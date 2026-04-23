import { NextResponse } from "next/server";

import { fetchLeetCodeStats, CodingStatsServiceError } from "@/lib/services/codingStatsService";
import type { CodingStatsApiError } from "@/types/codingStats";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username")?.trim() ?? "";

  if (!username) {
    return NextResponse.json<CodingStatsApiError>(
      { error: "Missing `username`.", code: "INVALID_INPUT" },
      { status: 400 },
    );
  }

  try {
    const data = await fetchLeetCodeStats(username);
    return NextResponse.json(data);
  } catch (err) {
    if (err instanceof CodingStatsServiceError) {
      const code =
        err.code === "NOT_FOUND"
          ? "NOT_FOUND"
          : err.code === "RATE_LIMIT"
            ? "RATE_LIMIT"
            : err.code === "TIMEOUT"
              ? "TIMEOUT"
              : err.code === "UPSTREAM_ERROR"
                ? "UPSTREAM_ERROR"
                : "UNKNOWN";

      return NextResponse.json<CodingStatsApiError>(
        { error: err.message, code },
        { status: err.httpStatus },
      );
    }

    return NextResponse.json<CodingStatsApiError>(
      { error: "Unexpected error.", code: "UNKNOWN" },
      { status: 500 },
    );
  }
}

