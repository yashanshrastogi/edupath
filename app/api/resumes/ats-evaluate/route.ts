import { NextResponse } from "next/server";

import { requireUser } from "@/lib/auth";
import { atsEvaluateRequestSchema } from "@/lib/validators";
import { createResumeFromUpload, ResumeAtsError } from "@/lib/services/resumeService";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const session = await requireUser();
    const body = await request.json();
    const input = atsEvaluateRequestSchema.parse(body);

    const resume = await createResumeFromUpload({
      userId: session.user.id,
      title: input.title,
      rawText: input.rawText,
    });

    return NextResponse.json(resume, { status: 201 });
  } catch (error: any) {
    if (error?.code === "P2003") {
      return NextResponse.json(
        { error: "Session invalid or database out of sync. Please sign out and sign back in." },
        { status: 401 }
      );
    }

    if (error instanceof ResumeAtsError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to evaluate resume." },
      { status: 400 },
    );
  }
}

