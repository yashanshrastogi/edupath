import { NextResponse } from "next/server";

import { getAuthSession } from "@/lib/auth";
import { ProjectStartError, startProjectSession } from "@/lib/services/projectService";
import { userProjectStartSchema } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const session = await getAuthSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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
