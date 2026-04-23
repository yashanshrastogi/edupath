import { NextResponse } from "next/server";

import { requireUser } from "@/lib/auth";
import { getRoadmapsForUser, createRoadmap } from "@/lib/services/roadmapService";
import { roadmapInputSchema } from "@/lib/validators";

export async function GET() {
  const session = await requireUser();
  const roadmaps = await getRoadmapsForUser(session.user.id);
  return NextResponse.json(roadmaps);
}

export async function POST(request: Request) {
  try {
    const session = await requireUser();
    const body = await request.json();
    const input = roadmapInputSchema.parse(body);
    const roadmap = await createRoadmap({
      userId: session.user.id,
      ...input,
    });

    return NextResponse.json(roadmap, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to create roadmap." },
      { status: 400 },
    );
  }
}
