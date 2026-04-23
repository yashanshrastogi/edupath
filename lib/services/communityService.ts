import "server-only";

import { prisma } from "@/lib/prisma";

export async function listCommunityFeed() {
  const [posts, groups, challenges] = await Promise.all([
    prisma.communityPost.findMany({
      include: {
        user: { select: { id: true, name: true, image: true } },
        comments: { select: { id: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.studyGroup.findMany({
      include: {
        owner: { select: { id: true, name: true } },
        members: true,
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.challenge.findMany({
      include: { entries: true },
      orderBy: { deadline: "asc" },
      take: 10,
    }),
  ]);

  return { posts, groups, challenges };
}

export async function createPost(input: {
  userId: string;
  type: "POST" | "QUESTION";
  title: string;
  content: string;
  tags: string[];
}) {
  return prisma.communityPost.create({
    data: input,
  });
}

export async function createStudyGroup(input: {
  ownerId: string;
  name: string;
  description: string;
  tags: string[];
  emoji: string;
}) {
  return prisma.studyGroup.create({
    data: {
      ownerId: input.ownerId,
      name: input.name,
      description: input.description,
      tags: input.tags,
      emoji: input.emoji,
      members: {
        create: {
          userId: input.ownerId,
        },
      },
    },
    include: {
      members: true,
    },
  });
}

export async function submitChallengeEntry(input: {
  userId: string;
  challengeId: string;
  githubUrl: string;
  description?: string;
}) {
  return prisma.challengeEntry.create({
    data: input,
  });
}
