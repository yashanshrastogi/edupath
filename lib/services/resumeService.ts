import "server-only";

import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getAI, isAIConfigured } from "@/lib/ai";
import { atsEvaluateResultSchema } from "@/lib/validators";

type ResumePayload = Record<string, unknown>;
type ResumeStoredData = ResumePayload & {
  granularScores?: {
    content: number;
    sections: number;
    essentials: number;
    tailoring: number;
  };
  checks?: {
    parseRate: boolean;
    quantifyingImpact: boolean;
    repetition: boolean;
    spellingGrammar: boolean;
  };
};

function arrayFromUnknown(value: unknown): string[] {
  return Array.isArray(value) ? value.filter(Boolean).map(String) : [];
}

function resumePayloadToRawText(data: ResumePayload) {
  const summary = String(data.summary ?? "");
  const skills = arrayFromUnknown(data.skills);
  const experience = arrayFromUnknown(data.experienceHighlights);
  const education = arrayFromUnknown(data.education);
  const projects = arrayFromUnknown(data.projects);
  const headline = String(data.headline ?? "");
  const name = String(data.name ?? "");
  const email = String(data.email ?? "");
  const phone = String(data.phone ?? "");
  const linkedin = String(data.linkedin ?? "");

  const parts = [
    name ? `NAME: ${name}` : "",
    headline ? `HEADLINE: ${headline}` : "",
    email ? `EMAIL: ${email}` : "",
    phone ? `PHONE: ${phone}` : "",
    linkedin ? `LINKEDIN: ${linkedin}` : "",
    summary ? `SUMMARY:\n${summary}` : "",
    skills.length ? `SKILLS:\n${skills.join(", ")}` : "",
    experience.length ? `EXPERIENCE:\n- ${experience.join("\n- ")}` : "",
    education.length ? `EDUCATION:\n- ${education.join("\n- ")}` : "",
    projects.length ? `PROJECTS:\n- ${projects.join("\n- ")}` : "",
  ].filter(Boolean);

  return parts.join("\n\n").trim();
}

export async function analyzeResume(data: ResumePayload) {
  const summary = String(data.summary ?? "");
  const skills = arrayFromUnknown(data.skills);
  const experience = arrayFromUnknown(data.experienceHighlights);

  const defaultAnalysis = {
    atsScore: Math.min(100, 55 + skills.length * 4 + experience.length * 5),
    grammarScore: summary.length > 50 ? 85 : 60,
    keywordScore: Math.min(100, 50 + skills.length * 5),
    grammarFeedback: ["Consider using more action verbs.", "Ensure bullet points are quantifiable."],
    keywordSuggestions: ["React", "TypeScript", "Node.js", "System Design"],
    skillSuggestions: ["Add cloud services like AWS or GCP.", "Include specific testing frameworks."],
    summary: "Basic ATS evaluation. Add more industry-specific keywords to improve score.",
  };

  if (!isAIConfigured()) return defaultAnalysis;

  try {
    const { client, model } = getAI();

    const prompt = `You are an enterprise Applicant Tracking System (ATS) algorithm for tech jobs.
Evaluate this resume data:
Summary: ${summary}
Skills: ${skills.join(", ")}
Experience: ${experience.join(" | ")}

Return EXCLUSIVELY a raw JSON object string with no markdown formatting. Do not wrap in \`\`\`json. The JSON must exactly match this schema:
{
  "atsScore": number (0-100),
  "grammarScore": number (0-100),
  "keywordScore": number (0-100),
  "granularScores": {
    "content": number,
    "sections": number,
    "essentials": number,
    "tailoring": number
  },
  "checks": {
    "parseRate": boolean,
    "quantifyingImpact": boolean,
    "repetition": boolean,
    "spellingGrammar": boolean
  },
  "grammarFeedback": ["string", "string"],
  "keywordSuggestions": ["keyword", "keyword"],
  "skillSuggestions": ["skill/tool", "skill/tool"],
  "summary": "1 sentence brief summary of the resume's strength."
}`;

    const result = await client.chat.completions.create({
      model,
      messages: [
        { role: "system", content: "You are an ATS evaluator. Respond with raw JSON only." },
        { role: "user", content: prompt },
      ],
      temperature: 0.3,
      max_tokens: 1024,
    });

    const text = result.choices[0]?.message?.content ?? "";
    const cleanedText = text.replace(/```(json)?/gi, "").trim();
    return JSON.parse(cleanedText);
  } catch (err) {
    console.error("AI Resume Analysis Error:", err);
    return defaultAnalysis;
  }
}

export async function saveResume(input: {
  userId: string;
  title: string;
  template: string;
  data: ResumePayload;
}) {
  const analysis = await analyzeResume(input.data);
  const rawText = resumePayloadToRawText(input.data);

  let provider: string | null = null;
  let modelName: string | null = null;
  if (isAIConfigured()) {
    try {
      const ai = getAI();
      provider = ai.provider.toLowerCase();
      modelName = ai.model;
    } catch { /* ignore */ }
  }

  const resume = await prisma.resume.create({
    data: {
      userId: input.userId,
      title: input.title,
      template: input.template,
      data: {
        ...(input.data as ResumeStoredData),
        granularScores: analysis.granularScores,
        checks: analysis.checks,
      } as Prisma.InputJsonValue,
      atsScore: analysis.atsScore,
      grammarScore: analysis.grammarScore,
      keywordScore: analysis.keywordScore,
    },
  });

  const { granularScores, checks, ...analysisDbSafe } = analysis;

  await prisma.resumeAnalysis.create({
    data: {
      resumeId: resume.id,
      ...analysisDbSafe,
      rawText,
      provider,
      model: modelName,
    },
  });

  return prisma.resume.findUnique({
    where: { id: resume.id },
    include: { analyses: { orderBy: { createdAt: "desc" }, take: 1 } },
  });
}

export async function getResumes(userId: string) {
  return prisma.resume.findMany({
    where: { userId },
    include: { analyses: { orderBy: { createdAt: "desc" }, take: 1 } },
    orderBy: { updatedAt: "desc" },
  });
}

export class ResumeAtsError extends Error {
  constructor(message: string, public statusCode: number) {
    super(message);
    this.name = "ResumeAtsError";
  }
}

async function generateAtsFromRawText(rawText: string) {
  if (!isAIConfigured()) {
    throw new ResumeAtsError(
      "AI service not configured. Add GROQ_API_KEY to .env.local (free at console.groq.com).",
      500
    );
  }

  const { client, model } = getAI();

  let provider: string | null = null;
  try { provider = getAI().provider.toLowerCase(); } catch { /* ignore */ }

  const prompt = `You are a strict enterprise ATS evaluator for software engineering roles.

Given the resume text below, return EXCLUSIVELY a valid JSON object matching this schema (no markdown, no code fences):
{
  "atsScore": number (0-100),
  "grammarScore": number (0-100),
  "keywordScore": number (0-100),
  "granularScores": {
    "content": number,
    "sections": number,
    "essentials": number,
    "tailoring": number
  },
  "checks": {
    "parseRate": boolean,
    "quantifyingImpact": boolean,
    "repetition": boolean,
    "spellingGrammar": boolean
  },
  "grammarFeedback": ["string", ...],
  "keywordSuggestions": ["keyword", ...],
  "skillSuggestions": ["skill/tool", ...],
  "summary": "short paragraph summary of improvements",
  "extractedData": {
    "name": "Full Name",
    "headline": "Professional Headline",
    "email": "Email Address",
    "phone": "Phone Number",
    "linkedin": "LinkedIn/Portfolio URL",
    "summary": "Professional Summary",
    "skills": ["Skill 1", "Skill 2"],
    "experienceHighlights": ["Experience 1", "Experience 2"],
    "education": ["Education 1", "Education 2"],
    "projects": ["Project 1", "Project 2"]
  }
}

Rules:
- Be harsh but fair.
- Prioritize ATS readability, impact, and measurable outcomes.
- Keep feedback actionable and specific.
- Extract as much information as possible into \`extractedData\`. If a field is missing, omit it or leave it blank.

RESUME TEXT:
${rawText}`;

  const result = await client.chat.completions.create({
    model,
    messages: [
      { role: "system", content: "You are an enterprise ATS evaluator. Respond with raw JSON only, no markdown." },
      { role: "user", content: prompt },
    ],
    temperature: 0.3,
    max_tokens: 2048,
  });

  const text = result.choices[0]?.message?.content ?? "";
  const cleaned = text.replace(/```(json)?/gi, "").trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new ResumeAtsError("AI returned invalid JSON. Please retry.", 502);
  }

  const validated = atsEvaluateResultSchema.safeParse(parsed);
  if (!validated.success) {
    throw new ResumeAtsError("AI returned an unexpected response shape. Please retry.", 502);
  }

  return {
    modelName: model,
    provider,
    result: validated.data,
  };
}

export async function createResumeFromUpload(input: {
  userId: string;
  title: string;
  rawText: string;
}) {
  const { modelName, provider, result } = await generateAtsFromRawText(input.rawText);

  return prisma.$transaction(async (tx) => {
    const resume = await tx.resume.create({
      data: {
        userId: input.userId,
        title: input.title,
        template: "Modern Professional",
        data: {
          source: "pdf",
          uploadedAt: new Date().toISOString(),
          ...(result.extractedData || {}),
          granularScores: result.granularScores,
          checks: result.checks,
        } as Prisma.InputJsonValue,
        atsScore: result.atsScore,
        grammarScore: result.grammarScore,
        keywordScore: result.keywordScore,
      },
    });

    await tx.resumeAnalysis.create({
      data: {
        resumeId: resume.id,
        atsScore: result.atsScore,
        grammarScore: result.grammarScore,
        keywordScore: result.keywordScore,
        grammarFeedback: result.grammarFeedback,
        keywordSuggestions: result.keywordSuggestions,
        skillSuggestions: result.skillSuggestions,
        summary: result.summary,
        rawText: input.rawText,
        provider,
        model: modelName,
      },
    });

    return tx.resume.findUnique({
      where: { id: resume.id },
      include: { analyses: { orderBy: { createdAt: "desc" }, take: 1 } },
    });
  });
}

export async function addResumeAnalysisFromRawText(input: {
  userId: string;
  resumeId: string;
  rawText: string;
}) {
  const resume = await prisma.resume.findFirst({
    where: { id: input.resumeId, userId: input.userId },
    select: { id: true },
  });
  if (!resume) {
    throw new ResumeAtsError("Resume not found.", 404);
  }

  const { modelName, provider, result } = await generateAtsFromRawText(input.rawText);

  await prisma.resumeAnalysis.create({
    data: {
      resumeId: resume.id,
      atsScore: result.atsScore,
      grammarScore: result.grammarScore,
      keywordScore: result.keywordScore,
      grammarFeedback: result.grammarFeedback,
      keywordSuggestions: result.keywordSuggestions,
      skillSuggestions: result.skillSuggestions,
      summary: result.summary,
      rawText: input.rawText,
      provider,
      model: modelName,
    },
  });

  await prisma.resume.update({
    where: { id: resume.id },
    data: {
      atsScore: result.atsScore,
      grammarScore: result.grammarScore,
      keywordScore: result.keywordScore,
    },
  });

  return prisma.resume.findUnique({
    where: { id: resume.id },
    include: { analyses: { orderBy: { createdAt: "desc" }, take: 1 } },
  });
}
