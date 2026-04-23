import { NextResponse } from "next/server";

import { requireUser } from "@/lib/auth";
import { getResumes, saveResume } from "@/lib/services/resumeService";
import { resumeSchema } from "@/lib/validators";

export async function GET() {
  const session = await requireUser();
  const resumes = await getResumes(session.user.id);
  return NextResponse.json(resumes);
}

export async function POST(request: Request) {
  try {
    const session = await requireUser();
    const body = await request.json();
    const input = resumeSchema.parse(body);
    const resume = await saveResume({
      userId: session.user.id,
      ...input,
    });

    return NextResponse.json(resume, { status: 201 });
  } catch (error: any) {
    if (error?.code === "P2003") {
      return NextResponse.json(
        { error: "Session invalid or database out of sync. Please sign out and sign back in." },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to save resume." },
      { status: 400 },
    );
  }
}
