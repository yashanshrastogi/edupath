import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;

  const resume = await prisma.resume.findFirst({
    where: { userId, isPublic: true },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      template: true,
      atsScore: true,
      data: true,
      updatedAt: true,
      user: {
        select: {
          name: true,
          image: true,
        },
      },
    },
  });

  if (!resume) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Strip sensitive fields from public view
  const data = resume.data as Record<string, unknown>;
  const safeData = {
    name: data.name,
    headline: data.headline,
    summary: data.summary,
    skills: data.skills,
    projectCards: data.projectCards,
    // Intentionally omit: email, phone, linkedin
  };

  return NextResponse.json({
    id: resume.id,
    title: resume.title,
    template: resume.template,
    atsScore: resume.atsScore,
    data: safeData,
    updatedAt: resume.updatedAt,
    user: resume.user,
  });
}
