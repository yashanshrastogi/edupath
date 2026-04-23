import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await requireUser();
    const userId = session.user.id;

    const [roadmaps, userProjects] = await Promise.all([
      prisma.roadmap.findMany({
        where: { userId },
        include: { modules: true },
        orderBy: { updatedAt: "desc" },
      }),
      prisma.userProject.findMany({
        where: { userId, status: { in: ["IN_PROGRESS", "COMPLETED", "REVIEW"] } },
        include: { project: true },
        orderBy: { updatedAt: "desc" },
      }),
    ]);

    // ── Aggregate skills ─────────────────────────────────────────────────────
    const skillSet = new Set<string>();

    for (const roadmap of roadmaps) {
      roadmap.knownSkills.forEach((s) => s.trim() && skillSet.add(s.trim()));
      roadmap.modules.forEach((m) => {
        const first = m.title.split(/[\s:—–-]/)[0].trim();
        if (first.length > 2) skillSet.add(first);
      });
    }

    for (const up of userProjects) {
      up.project.stack.forEach((s) => s.trim() && skillSet.add(s.trim()));
    }

    // ── Build project list ───────────────────────────────────────────────────
    const projects = userProjects.slice(0, 10).map((up) => ({
      id: up.id,
      title: up.project.title,
      description: up.project.summary,
      status: up.status,
    }));

    const skills = Array.from(skillSet).filter(Boolean).slice(0, 25);
    const hasActivity = skills.length > 0 || projects.length > 0;

    return NextResponse.json({ skills, projects, hasActivity });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
