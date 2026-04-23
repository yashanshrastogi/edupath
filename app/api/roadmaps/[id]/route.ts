import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireUser();
    const resolvedParams = await params;
    
    if (!resolvedParams.id) {
       return NextResponse.json({ error: "Invalid roadmap ID" }, { status: 400 });
    }

    // Using deleteMany makes it conditional on both id AND userId for security (only owner can delete)
    const result = await prisma.roadmap.deleteMany({
      where: {
        id: resolvedParams.id,
        userId: session.user.id,
      },
    });

    if (result.count === 0) {
      return NextResponse.json({ error: "Roadmap not found or unauthorized" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete roadmap" }, { status: 500 });
  }
}
