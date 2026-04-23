import { NextResponse } from "next/server";

import { registerUser } from "@/lib/services/authService";
import { signupSchema } from "@/lib/validators";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const input = signupSchema.parse(body);
    const user = await registerUser(input);

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unable to register user.",
      },
      { status: 400 },
    );
  }
}
