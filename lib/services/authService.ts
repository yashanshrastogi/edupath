import "server-only";

import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";

/** Sync API avoids bcryptjs async paths that call `callback.bind` when bundlers reshape the default export. */
function hashPassword(plain: string): string {
  return bcrypt.hashSync(plain, 12);
}

export async function registerUser(input: {
  name: string;
  email: string;
  password: string;
}) {
  const email = input.email.toLowerCase().trim();

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new Error("An account with this email already exists.");
  }

  const password = hashPassword(input.password);

  return prisma.user.create({
    data: {
      name: input.name.trim(),
      email,
      password,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  });
}
