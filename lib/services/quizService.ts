import "server-only";

import type { QuizQuestion } from "@prisma/client";

import { prisma } from "@/lib/prisma";

function scoreToLevel(score: number): "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT" {
  if (score >= 90) return "EXPERT";
  if (score >= 75) return "ADVANCED";
  if (score >= 55) return "INTERMEDIATE";
  return "BEGINNER";
}

export async function listQuizQuestions(skill: string, mode: "MANUAL" | "RESUME_BASED") {
  return prisma.quizQuestion.findMany({
    where: { skill, mode },
    orderBy: [{ difficulty: "asc" }, { createdAt: "asc" }],
    take: 5,
  });
}

export async function submitQuiz(input: {
  userId: string;
  skill: string;
  mode: "MANUAL" | "RESUME_BASED";
  answers: Array<{ questionId: string; selectedIndex: number }>;
}) {
  const questions = await prisma.quizQuestion.findMany({
    where: {
      id: { in: input.answers.map((answer) => answer.questionId) },
    },
  });

  const correctAnswers = questions.reduce((total: number, question: QuizQuestion) => {
    const answer = input.answers.find((candidate) => candidate.questionId === question.id);
    return total + (answer?.selectedIndex === question.correct ? 1 : 0);
  }, 0);

  const totalQuestions = Math.max(questions.length, 1);
  const score = Math.round((correctAnswers / totalQuestions) * 100);
  const level = scoreToLevel(score);

  return prisma.quizResult.create({
    data: {
      userId: input.userId,
      skill: input.skill,
      mode: input.mode,
      score,
      level,
      totalQuestions,
      correctAnswers,
      feedback: `You performed at a ${level.toLowerCase()} level in ${input.skill}.`,
    },
  });
}

export async function getQuizResults(userId: string) {
  return prisma.quizResult.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}
