import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { getAI, isAIConfigured } from "@/lib/ai";

export async function POST(request: Request) {
  try {
    await requireUser();

    const body = await request.json();
    const { currentProfession, careerGoal, currentSkillLevel, knownSkills, educationLevel } = body;

    if (!currentProfession || !careerGoal) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!isAIConfigured()) {
      return NextResponse.json(
        { error: "AI not configured. Add GROQ_API_KEY to .env.local (free at console.groq.com)." },
        { status: 500 }
      );
    }

    const { client, model } = getAI();

    const prompt = `You are an expert tech career counselor. A user has approached you for guidance.
User Profile:
- Current Profession: ${currentProfession}
- Target Career Goal Ideas: ${careerGoal}
- Current Skill Level: ${currentSkillLevel}
- Known Skills: ${(knownSkills as string[]).join(", ")}
- Education Level: ${educationLevel}

Based on this profile, identify exactly 15 to 20 potential highly-demanded job roles in the current market that bridge the gap or align perfectly with their goals and background.

Return a raw JSON array of objects. No markdown fences, no explanation.

Schema for each object:
{
  "jobTitle": "String (e.g., Cloud Architect)",
  "whyItFits": "String (1-2 sentences on why this fits their specific profile)",
  "pros": ["String", "String", "String"],
  "cons": ["String", "String"],
  "salariesAndGrowth": "String (e.g. High demand, $90k-$130k base)",
  "matchScore": Integer (1-100 indicating how close they are to this job right now)
}`;

    const result = await client.chat.completions.create({
      model,
      messages: [
        {
          role: "system",
          content: "You are an expert tech career counselor. Always respond with a raw JSON array only, no markdown fences, no explanation.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.6,
      max_tokens: 4096,
      response_format: { type: "json_object" },
    });

    let text = result.choices[0]?.message?.content ?? "[]";
    text = text.replace(/```json/gi, "").replace(/```/g, "").trim();

    let jobsData;
    try {
      const parsed = JSON.parse(text);
      // Groq with json_object mode may wrap in { jobs: [...] } or return array directly
      jobsData = Array.isArray(parsed) ? parsed : (parsed.jobs ?? parsed.roles ?? Object.values(parsed)[0]);
    } catch (parseError) {
      console.error("Failed to parse AI output as JSON:", text);
      return NextResponse.json(
        { error: "AI parser failed. Raw output: " + text.substring(0, 200) + "..." },
        { status: 500 }
      );
    }

    return NextResponse.json({ jobs: jobsData });

  } catch (error) {
    console.error("Recommendations Error:", error);
    return NextResponse.json(
      { error: "Failed to generate AI recommendations. Make sure GROQ_API_KEY is configured in .env.local." },
      { status: 500 }
    );
  }
}
