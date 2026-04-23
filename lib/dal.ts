import "server-only";

import type { CommunityPost, Prisma, QuizResult } from "@prisma/client";
import { cache } from "react";

import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function isDatabaseUnavailable(error: unknown) {
  return (
    error instanceof Error &&
    (
      error.name === "PrismaClientInitializationError" ||
      error.message.includes("Can't reach database server")
    )
  );
}

export const getCurrentUser = cache(async () => {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    return null;
  }

  try {
    return await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        xp: true,
        streak: true,
        level: true,
        targetRole: true,
        currentLevel: true,
        leetcodeUsername: true,
        codeforcesHandle: true,
      },
    });
  } catch (error) {
    if (isDatabaseUnavailable(error)) {
      return null;
    }

    throw error;
  }
});

type DashboardUser = NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>;

type DashboardRoadmap = Prisma.RoadmapGetPayload<{ include: { modules: true } }>;
type DashboardUserProject = Prisma.UserProjectGetPayload<{ include: { project: true } }>;
type DashboardApplication = Prisma.ApplicationGetPayload<{ include: { job: true } }>;

export type DashboardSnapshot = {
  user: DashboardUser;
  activeRoadmaps: DashboardRoadmap[];
  userProjects: DashboardUserProject[];
  quizResults: QuizResult[];
  recentPosts: CommunityPost[];
  applications: DashboardApplication[];
};

export type DashboardSnapshotState =
  | { kind: "unauthenticated" }
  | { kind: "db_unavailable" }
  | { kind: "ready"; snapshot: DashboardSnapshot };

export const getDashboardSnapshot = cache(async (): Promise<DashboardSnapshotState> => {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    return { kind: "unauthenticated" };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        xp: true,
        streak: true,
        level: true,
        targetRole: true,
        currentLevel: true,
        leetcodeUsername: true,
        codeforcesHandle: true,
      },
    });

    if (!user) {
      return { kind: "unauthenticated" };
    }

    const [activeRoadmaps, userProjects, quizResults, recentPosts, applications] =
      await Promise.all([
        prisma.roadmap.findMany({
          where: { userId: user.id, status: "ACTIVE" },
          include: { modules: true },
          orderBy: { updatedAt: "desc" },
          take: 3,
        }),
        prisma.userProject.findMany({
          where: { userId: user.id },
          include: { project: true },
          orderBy: { updatedAt: "desc" },
          take: 4,
        }),
        prisma.quizResult.findMany({
          where: { userId: user.id },
          orderBy: { createdAt: "desc" },
          take: 5,
        }),
        prisma.communityPost.findMany({
          where: { userId: user.id },
          orderBy: { updatedAt: "desc" },
          take: 5,
        }),
        prisma.application.findMany({
          where: { userId: user.id },
          include: { job: true },
          orderBy: { updatedAt: "desc" },
          take: 5,
        }),
      ]);

    return {
      kind: "ready",
      snapshot: {
        user,
        activeRoadmaps,
        userProjects,
        quizResults,
        recentPosts,
        applications,
      },
    };
  } catch (error) {
    if (isDatabaseUnavailable(error)) {
      return { kind: "db_unavailable" };
    }

    throw error;
  }
});
