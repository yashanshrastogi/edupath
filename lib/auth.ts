import "server-only";

import bcrypt from "bcryptjs";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { getServerSession, type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";

const isGoogleOAuthEnabled = Boolean(
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET,
);

const isGitHubOAuthEnabled = Boolean(
  process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET,
);

export const enabledOAuthProviders = {
  google: isGoogleOAuthEnabled,
  github: isGitHubOAuthEnabled,
} as const;

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase().trim() },
        });

        if (!user?.password) {
          return null;
        }

        const isValid = bcrypt.compareSync(credentials.password, user.password);
        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        };
      },
    }),
    ...(isGoogleOAuthEnabled
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
          }),
        ]
      : []),
    ...(isGitHubOAuthEnabled
      ? [
          GitHubProvider({
            clientId: process.env.GITHUB_CLIENT_ID!,
            clientSecret: process.env.GITHUB_CLIENT_SECRET!,
          }),
        ]
      : []),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Only populate token fields during the INITIAL sign-in (when `user` is present).
      // Do NOT hit the database on every subsequent request — that causes JWT_SESSION_ERROR
      // whenever the DB is momentarily unavailable.
      if (user) {
        token.sub = user.id;
        token.role = ((user as { role?: string }).role ?? "USER") as "USER" | "ADMIN";
        token.name = user.name;
        token.picture = user.image;
        token.email = user.email;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        session.user.role = token.role ?? "USER";
        session.user.name = token.name ?? session.user.name;
        session.user.email = token.email ?? session.user.email;
        session.user.image = typeof token.picture === "string" ? token.picture : session.user.image;
      }

      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export async function getAuthSession() {
  return getServerSession(authOptions);
}

export async function requireUser() {
  const session = await getAuthSession();

  if (!session?.user?.id) {
    redirect("/api/auth/signout?callbackUrl=/login");
  }

  return session;
}

export async function requireAdmin() {
  const session = await requireUser();

  if (session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return session;
}
