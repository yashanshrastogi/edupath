import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  await requireAdmin();

  const [users, roadmaps, posts, applications] = await Promise.all([
    prisma.user.count(),
    prisma.roadmap.count(),
    prisma.communityPost.count(),
    prisma.application.count(),
  ]).catch(() => [0, 0, 0, 0]);

  return NextResponse.json({ users, roadmaps, posts, applications });
}
