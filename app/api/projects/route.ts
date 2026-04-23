import { NextResponse } from "next/server";

import { requireUser } from "@/lib/auth";
import { ProjectStartError, listProjects, getUserProjects, startProjectSession } from "@/lib/services/projectService";
import { userProjectStartSchema } from "@/lib/validators";

export async function GET(request: Request) {
  await requireUser();
  const { searchParams } = new URL(request.url);
  const scope = searchParams.get("scope");

  if (scope === "user") {
    const session = await requireUser();
    const userProjects = await getUserProjects(session.user.id);
    return NextResponse.json(userProjects);
  }

  const difficulty = searchParams.get("difficulty") ?? undefined;
  const stack = searchParams.get("stack") ?? undefined;
  const track = searchParams.get("track") ?? undefined;

  const projects = await listProjects({
    difficulty: difficulty as "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | undefined,
    stack,
    track,
  });

  return NextResponse.json(projects);
}

export async function POST(request: Request) {
  try {
    const session = await requireUser();
    const body = await request.json();
    const input = userProjectStartSchema.parse(body);
    const result = await startProjectSession({
      userId: session.user.id,
      projectId: input.projectId,
      roadmapId: input.roadmapId,
    });

    return NextResponse.json(result, { status: result.alreadyStarted ? 200 : 201 });
  } catch (error) {
    if (error instanceof ProjectStartError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to start project." },
      { status: 400 },
    );
  }
}
