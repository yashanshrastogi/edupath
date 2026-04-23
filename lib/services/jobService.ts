import "server-only";

import { prisma } from "@/lib/prisma";

interface JSearchJob {
  job_id: string;
  job_title: string;
  employer_name: string;
  job_city: string | null;
  job_state: string | null;
  job_country: string | null;
  job_employment_type: string | null;
  job_description: string | null;
  job_required_skills: string[] | null;
  job_highlights?: { Qualifications?: string[]; Benefits?: string[] };
  job_min_salary: number | null;
  job_max_salary: number | null;
  job_salary_currency: string | null;
  job_is_remote: boolean | null;
  job_apply_link: string | null;
  employer_logo: string | null;
}

interface JSearchResponse {
  data: JSearchJob[];
  status: string;
}

// Clean up messy job titles from JSearch
function cleanTitle(title: string): string {
  return title
    .replace(/\|.*$/, "")           // remove "| Job # 6869" suffixes
    .replace(/\(.*?ref.*?\)/gi, "") // remove ref codes in parens
    .replace(/\s{2,}/g, " ")        // collapse multiple spaces
    .trim();
}

function normalizeJob(j: JSearchJob) {
  const location = [j.job_city, j.job_state, j.job_country]
    .filter(Boolean)
    .join(", ") || "Remote";

  let salaryRange = "Not disclosed";
  if (j.job_min_salary && j.job_max_salary) {
    const fmt = (n: number) =>
      n >= 1000 ? `${Math.round(n / 1000)}k` : `${n}`;
    const currency = j.job_salary_currency ?? "$";
    salaryRange = `${currency}${fmt(j.job_min_salary)} – ${currency}${fmt(j.job_max_salary)}`;
  }

  // Better skills extraction — try required_skills first, then parse qualifications
  let skills: string[] = [];

  if (j.job_required_skills && j.job_required_skills.length > 0) {
    skills = j.job_required_skills
      .flatMap((s) => s.split(/[,;]/))
      .map((s) => s.trim())
      .filter((s) => s.length > 1 && s.length < 25);
  } else if (j.job_highlights?.Qualifications) {
    // Extract short tech keywords from qualification sentences
    const techPattern = /\b(React|Node|Python|Java|TypeScript|JavaScript|AWS|Docker|Kubernetes|SQL|PostgreSQL|MongoDB|Redis|GraphQL|REST|API|Git|CI\/CD|Agile|Scrum|Angular|Vue|Next\.?js|Express|Spring|Django|Flask|Ruby|Go|Rust|C\+\+|C#|\.NET|Azure|GCP|Linux|Terraform|Figma|CSS|HTML)\b/gi;
    const allText = j.job_highlights.Qualifications.join(" ");
    const matches = allText.match(techPattern) ?? [];
    skills = [...new Set(matches.map((s) => s.trim()))];
  }

  skills = skills.slice(0, 7);

  const typeMap: Record<string, string> = {
    FULLTIME: "FULL_TIME",
    FULL_TIME: "FULL_TIME",
    PARTTIME: "PART_TIME",
    PART_TIME: "PART_TIME",
    CONTRACT: "CONTRACT",
    INTERN: "INTERNSHIP",
    INTERNSHIP: "INTERNSHIP",
    TEMPORARY: "CONTRACT",
  };
  const type =
    typeMap[(j.job_employment_type ?? "").toUpperCase()] ?? "FULL_TIME";

  return {
    id: j.job_id,
    title: cleanTitle(j.job_title),
    company: j.employer_name,
    location,
    salaryRange,
    type,
    skills,
    description: (j.job_description ?? "").slice(0, 280) + "…",
    remoteFriendly: j.job_is_remote ?? false,
    applyLink: j.job_apply_link ?? null,
    logo: j.employer_logo ?? null,
  };
}

async function fetchFromJSearch(query: string, page = 1) {
  const key = process.env.RAPIDAPI_KEY;
  if (!key) throw new Error("RAPIDAPI_KEY not set");

  const url = new URL("https://jsearch.p.rapidapi.com/search");
  url.searchParams.set("query", query);
  url.searchParams.set("page", String(page));
  url.searchParams.set("num_pages", "1");
  url.searchParams.set("date_posted", "month");

  const res = await fetch(url.toString(), {
    headers: {
      "X-RapidAPI-Key": key,
      "X-RapidAPI-Host": "jsearch.p.rapidapi.com",
    },
    next: { revalidate: 3600 },
  });

  if (!res.ok) throw new Error(`JSearch API error: ${res.status}`);
  const json = (await res.json()) as JSearchResponse;
  return (json.data ?? []).map(normalizeJob);
}

async function getUserSkills(userId: string): Promise<string[]> {
  const resume = await prisma.resume.findFirst({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    select: { data: true },
  });

  if (!resume?.data) return [];
  const data = resume.data as Record<string, unknown>;
  const skills = Array.isArray(data.skills)
    ? (data.skills as string[]).filter(Boolean)
    : [];
  return skills.slice(0, 6);
}

export async function listJobs(userId?: string) {
  try {
    let query = "software developer jobs";
    if (userId) {
      const skills = await getUserSkills(userId);
      if (skills.length > 0) {
        query = `${skills.slice(0, 4).join(" ")} developer jobs`;
      }
    }
    const jobs = await fetchFromJSearch(query);
    return jobs;
  } catch (err) {
    console.error("JSearch fetch failed, returning empty:", err);
    return [];
  }
}

export async function applyToJob(input: {
  userId: string;
  jobId: string;
  resumeId?: string;
  fullName: string;
  email: string;
  phone?: string;
  coverLetter?: string;
  attachmentUrl?: string;
}) {
  return prisma.application.upsert({
    where: { userId_jobId: { userId: input.userId, jobId: input.jobId } },
    update: {
      resumeId: input.resumeId,
      fullName: input.fullName,
      email: input.email,
      phone: input.phone,
      coverLetter: input.coverLetter,
      attachmentUrl: input.attachmentUrl,
      status: "APPLIED",
      updatedAt: new Date(),
    },
    create: { ...input, status: "APPLIED" },
  });
}

export async function getApplications(userId: string) {
  return prisma.application.findMany({
    where: { userId },
    include: { job: true, resume: true },
    orderBy: { updatedAt: "desc" },
  });
}