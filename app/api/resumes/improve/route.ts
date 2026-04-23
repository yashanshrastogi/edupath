import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { getAI, isAIConfigured } from "@/lib/ai";

export async function POST(req: Request) {
  try {
    await requireUser(); // auth check only

    const body = await req.json() as { description?: string };
    const raw = (body.description ?? "").trim();

    if (!raw) {
      return NextResponse.json({ error: "description is required" }, { status: 400 });
    }

    // If no AI key, return the original text as-is (graceful degradation)
    if (!isAIConfigured()) {
      return NextResponse.json(
        { improved: raw, warning: "AI not configured — returned original. Add GROQ_API_KEY to .env.local." },
        { status: 200 }
      );
    }

    const { client, model } = getAI();

    const prompt = `You are an expert resume writer for software engineering and tech roles.
Rewrite the following project description into a single, powerful resume bullet point.
- Start with a strong action verb (Developed, Built, Engineered, Designed, Implemented)
- Include measurable impact if possible
- Keep it under 2 sentences (max 40 words)
- Make it ATS-friendly and professional

Original description: "${raw}"

Return ONLY the rewritten bullet point text. No quotes, no formatting, no explanation.`;

    const result = await client.chat.completions.create({
      model,
      messages: [
        { role: "system", content: "You are an expert resume writer. Return only the improved bullet point, no explanation." },
        { role: "user", content: prompt },
      ],
      temperature: 0.5,
      max_tokens: 200,
    });

    const improved = (result.choices[0]?.message?.content ?? raw).trim().replace(/^["']|["']$/g, "");

    return NextResponse.json({ improved });
  } catch (err) {
    console.error("Improve route error:", err);
    return NextResponse.json({ error: "Failed to improve description" }, { status: 500 });
  }
}
