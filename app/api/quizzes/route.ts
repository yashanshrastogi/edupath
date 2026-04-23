import { NextResponse } from "next/server";

import { requireUser } from "@/lib/auth";
import { getQuizResults, listQuizQuestions, submitQuiz } from "@/lib/services/quizService";
import { quizSubmissionSchema } from "@/lib/validators";

export async function GET(request: Request) {
  const session = await requireUser();
  const { searchParams } = new URL(request.url);
  const skill = searchParams.get("skill");
  const mode = (searchParams.get("mode") ?? "MANUAL") as "MANUAL" | "RESUME_BASED";

  if (skill) {
    const questions = await listQuizQuestions(skill, mode);
    return NextResponse.json(questions);
  }

  const results = await getQuizResults(session.user.id);
  return NextResponse.json(results);
}

export async function POST(request: Request) {
  try {
    const session = await requireUser();
    const body = await request.json();
    const input = quizSubmissionSchema.parse(body);
    const result = await submitQuiz({
      userId: session.user.id,
      ...input,
    });
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to submit quiz." },
      { status: 400 },
    );
  }
}
