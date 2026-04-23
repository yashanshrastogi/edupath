import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireUser();
    const userId = session.user.id;
    const { id } = await params;
    const body = await req.json() as { isPublic: boolean };

    // Only the owner can toggle visibility
    const resume = await prisma.resume.findFirst({
      where: { id, userId },
      select: { id: true },
    });

    if (!resume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    const updated = await prisma.resume.update({
      where: { id },
      data: { isPublic: Boolean(body.isPublic) },
      select: { id: true, isPublic: true },
    });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
