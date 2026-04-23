import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const VALID_STATUSES = ["NOT_STARTED", "IN_PROGRESS", "COMPLETED"] as const;
type ModuleStatus = (typeof VALID_STATUSES)[number];

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string; moduleId: string }> }
) {
  try {
    const session = await requireUser();
    const { id: roadmapId, moduleId } = await params;
    const body = await req.json() as { status?: ModuleStatus };

    if (!body.status || !VALID_STATUSES.includes(body.status)) {
      return NextResponse.json({ error: "Invalid status value." }, { status: 400 });
    }

    // Verify ownership — find the module that belongs to this roadmap & user
    const module = await prisma.roadmapModule.findFirst({
      where: {
        id: moduleId,
        roadmapId,
        roadmap: { userId: session.user.id },
      },
      select: { id: true },
    });

    if (!module) {
      return NextResponse.json({ error: "Module not found or unauthorized." }, { status: 404 });
    }

    const updated = await prisma.roadmapModule.update({
      where: { id: moduleId },
      data: { status: body.status },
      select: { id: true, status: true },
    });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
