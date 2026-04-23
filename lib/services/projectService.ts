import "server-only";

import { prisma } from "@/lib/prisma";

const PROJECT_START_XP = 50;

export class ProjectStartError extends Error {
  constructor(message: string, public statusCode: number) {
    super(message);
    this.name = "ProjectStartError";
  }
}

export async function listProjects(filters?: {
  difficulty?: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  stack?: string;
  track?: string;
}) {
  return prisma.project.findMany({
    where: {
      difficulty: filters?.difficulty,
      ...(filters?.stack ? { stack: { has: filters.stack } } : {}),
      ...(filters?.track ? { tracks: { has: filters.track } } : {}),
    },
    orderBy: [{ isFeatured: "desc" }, { title: "asc" }],
  });
}

export async function startProjectSession(input: {
  userId: string;
  projectId: string;
  roadmapId?: string;
}) {
  return prisma.$transaction(async (tx) => {
    const project = await tx.project.findUnique({
      where: { id: input.projectId },
    });

    if (!project) {
      throw new ProjectStartError("Project not found.", 404);
    }

    const existingUserProject = await tx.userProject.findUnique({
      where: {
        userId_projectId: {
          userId: input.userId,
          projectId: input.projectId,
        },
      },
    });

    const userProject = existingUserProject
      ? await tx.userProject.update({
          where: { id: existingUserProject.id },
          data: {
            roadmapId: input.roadmapId ?? existingUserProject.roadmapId,
            status: existingUserProject.status === "COMPLETED" ? "COMPLETED" : "IN_PROGRESS",
          },
          include: {
            project: true,
          },
        })
      : await tx.userProject.create({
          data: {
            userId: input.userId,
            projectId: input.projectId,
            roadmapId: input.roadmapId,
            status: "IN_PROGRESS",
          },
          include: {
            project: true,
          },
        });

    const session = await tx.projectSession.create({
      data: {
        userProjectId: userProject.id,
        statusNote: existingUserProject ? "Project session resumed" : "Project session started",
      },
    });

    let awardedXp = 0;

    if (!existingUserProject) {
      await tx.user.update({
        where: { id: input.userId },
        data: {
          xp: { increment: PROJECT_START_XP },
        },
      });
      awardedXp = PROJECT_START_XP;
    }

    return {
      userProject,
      session,
      awardedXp,
      alreadyStarted: Boolean(existingUserProject),
    };
  });
}

export async function updateUserProjectProgress(input: {
  userProjectId: string;
  progress: number;
  notes?: string;
}) {
  return prisma.userProject.update({
    where: { id: input.userProjectId },
    data: {
      progress: input.progress,
      notes: input.notes,
      status: input.progress >= 100 ? "COMPLETED" : "IN_PROGRESS",
      completedAt: input.progress >= 100 ? new Date() : null,
    },
  });
}

export async function getUserProjects(userId: string) {
  return prisma.userProject.findMany({
    where: { userId },
    include: { project: true, sessions: { orderBy: { startedAt: "desc" } } },
    orderBy: { updatedAt: "desc" },
  });
}
