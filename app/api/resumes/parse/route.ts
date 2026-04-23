import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { groqJSON, MODELS } from "@/lib/ai";
import pdfParse from "pdf-parse";

interface ParsedResume {
  name: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  experience: {
    company: string;
    role: string;
    startDate: string;
    endDate: string;
    bullets: string[];
  }[];
  education: {
    institution: string;
    degree: string;
    field: string;
    year: string;
  }[];
  skills: string[];
  certifications: string[];
}

function normalizeText(text: string): string {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]+/g, " ")
    .trim();
}

export async function POST(req: NextRequest) {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("file") as File | null;
  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  // Accept PDF or plain text
  const isPdf = file.type === "application/pdf" || file.name.endsWith(".pdf");
  const isText = file.type === "text/plain" || file.name.endsWith(".txt");

  if (!isPdf && !isText) {
    return NextResponse.json(
      { error: "Only PDF and .txt files are supported" },
      { status: 400 }
    );
  }

  let rawText: string;

  if (isPdf) {
    // pdf-parse extracts clean text from the PDF binary structure
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const parsed = await pdfParse(buffer);
    rawText = parsed.text;
  } else {
    rawText = await file.text();
  }

  rawText = normalizeText(rawText);

  if (rawText.length < 50) {
    return NextResponse.json(
      { error: "Could not extract readable text from this file" },
      { status: 422 }
    );
  }

  const prompt = `Extract structured data from this resume text and return a JSON object.

RESUME TEXT:
${rawText.slice(0, 6000)}

Return ONLY this JSON structure (use empty string "" or empty array [] for missing fields):
{
  "name": "<full name>",
  "email": "<email address>",
  "phone": "<phone number>",
  "location": "<city, country>",
  "summary": "<professional summary if present>",
  "experience": [
    {
      "company": "<company name>",
      "role": "<job title>",
      "startDate": "<month year or year>",
      "endDate": "<month year or Present>",
      "bullets": ["<achievement or responsibility>", ...]
    }
  ],
  "education": [
    {
      "institution": "<university or school name>",
      "degree": "<degree type>",
      "field": "<field of study>",
      "year": "<graduation year>"
    }
  ],
  "skills": ["<skill>", ...],
  "certifications": ["<certification name>", ...]
}`;

  try {
    const parsed = await groqJSON<ParsedResume>(prompt, MODELS.resume, 2048);
    return NextResponse.json({ parsed, rawText });
  } catch (err) {
    console.error("[resumes/parse] AI error:", err);
    return NextResponse.json(
      { error: "Failed to parse resume. Please try again." },
      { status: 500 }
    );
  }
}