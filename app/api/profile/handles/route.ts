import { NextResponse } from "next/server";

import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { codingHandlesSchema } from "@/lib/validators";

export async function PATCH(request: Request) {
  try {
    const session = await requireUser();
    const body = await request.json();
    const input = codingHandlesSchema.parse(body);

    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        leetcodeUsername: input.leetcodeUsername ?? undefined,
        codeforcesHandle: input.codeforcesHandle ?? undefined,
      },
      select: {
        leetcodeUsername: true,
        codeforcesHandle: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to update handles." },
      { status: 400 },
    );
  }
}

