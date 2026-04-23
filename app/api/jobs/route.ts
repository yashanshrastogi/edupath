import { NextResponse } from "next/server";

import { requireUser } from "@/lib/auth";
import { applyToJob, getApplications, listJobs } from "@/lib/services/jobService";
import { applicationSchema } from "@/lib/validators";

export async function GET(request: Request) {
  const session = await requireUser();
  const { searchParams } = new URL(request.url);

  if (searchParams.get("scope") === "applications") {
    const applications = await getApplications(session.user.id);
    return NextResponse.json(applications);
  }

  // Pass userId so listJobs can personalize based on resume skills
  const jobs = await listJobs(session.user.id);
  return NextResponse.json(jobs);
}

export async function POST(request: Request) {
  try {
    const session = await requireUser();
    const body = await request.json();
    const input = applicationSchema.parse(body);
    const application = await applyToJob({
      userId: session.user.id,
      ...input,
    });

    return NextResponse.json(application, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to submit application." },
      { status: 400 },
    );
  }
}
