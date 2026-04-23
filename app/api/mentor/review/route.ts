import { NextResponse } from "next/server";
import { getAI, isAIConfigured } from "@/lib/ai";

export async function POST(request: Request) {
  try {
    const { code, language } = await request.json();

    if (!code) {
      return NextResponse.json({ error: "No code provided" }, { status: 400 });
    }

    if (!isAIConfigured()) {
      return NextResponse.json({
        feedback: "AI service not configured. Add GROQ_API_KEY to .env.local (free at console.groq.com).",
        score: 0,
      });
    }

    const { client, model } = getAI();

    const prompt = `You are an expert senior software engineer reviewing code written by a junior developer.

Language: ${language || "javascript"}

Code snippet to review:
\`\`\`${language || "javascript"}
${code}
\`\`\`

Perform a comprehensive code review. Provide:
1. An overall score out of 100 based on syntax, logic, best practices, and efficiency.
2. A list of constructive feedback points. Highlight bugs, bad practices, and areas of improvement. Give brief examples of the correct way.
3. Be professional and encouraging.

Return your response EXCLUSIVELY as a JSON object, exactly matching this schema, without any markdown formatting wrappers:
{
  "score": number,
  "feedback": "string (use markdown for the feedback, like **bold** or - bullets)"
}`;

    const result = await client.chat.completions.create({
      model,
      messages: [
        { role: "system", content: "You are an expert code reviewer. Respond with raw JSON only, no markdown fences." },
        { role: "user", content: prompt },
      ],
      temperature: 0.4,
      max_tokens: 1024,
    });

    const text = result.choices[0]?.message?.content ?? "";

    let parsedData = { score: 80, feedback: "Code review completed successfully." };
    try {
      const cleanedText = text.replace(/```(json)?/gi, "").trim();
      parsedData = JSON.parse(cleanedText);
    } catch {
      parsedData.feedback = text;
      const scoreMatch = text.match(/score["':\s]+(\d+)/i);
      parsedData.score = scoreMatch ? parseInt(scoreMatch[1]) : 85;
    }

    return NextResponse.json(parsedData);
  } catch (error) {
    console.error("AI Review error:", error);
    return NextResponse.json(
      { error: "Failed to generate review. Please try again." },
      { status: 500 }
    );
  }
}
