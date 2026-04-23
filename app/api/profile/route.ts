import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";

export async function GET() {
  try {
    const session = await requireUser();
    const { id, name, email } = session.user;
    return NextResponse.json({ id, name, email });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
