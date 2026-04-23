import "server-only";

import {
  codeforcesUserInfoResponseSchema,
  codeforcesUserStatusResponseSchema,
  leetCodeStatsResponseSchema,
} from "@/lib/validators";
import type { CodeforcesStats, LeetCodeStats } from "@/types/codingStats";

type UpstreamErrorCode = "NOT_FOUND" | "RATE_LIMIT" | "TIMEOUT" | "UPSTREAM_ERROR" | "UNKNOWN";

export class CodingStatsServiceError extends Error {
  constructor(
    message: string,
    public code: UpstreamErrorCode,
    public httpStatus: number,
  ) {
    super(message);
    this.name = "CodingStatsServiceError";
  }
}

async function fetchJson<T>(input: RequestInfo | URL, init?: RequestInit & { timeoutMs?: number }) {
  const controller = new AbortController();
  const timeoutMs = init?.timeoutMs ?? 9000;

  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(input, {
      ...init,
      signal: controller.signal,
      headers: {
        accept: "application/json",
        ...(init?.headers ?? {}),
      },
    });

    if (res.status === 404) {
      throw new CodingStatsServiceError("User not found.", "NOT_FOUND", 404);
    }
    if (res.status === 429) {
      throw new CodingStatsServiceError("Rate limited by upstream provider.", "RATE_LIMIT", 429);
    }
    if (!res.ok) {
      throw new CodingStatsServiceError("Upstream provider failed.", "UPSTREAM_ERROR", 502);
    }

    return (await res.json()) as T;
  } catch (err) {
    if (err instanceof CodingStatsServiceError) throw err;
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new CodingStatsServiceError("Upstream request timed out.", "TIMEOUT", 504);
    }
    throw new CodingStatsServiceError("Unexpected upstream error.", "UNKNOWN", 502);
  } finally {
    clearTimeout(timeout);
  }
}

export async function fetchLeetCodeStats(username: string): Promise<LeetCodeStats> {
  const safe = username.trim();
  if (!safe) {
    throw new CodingStatsServiceError("Username required.", "UNKNOWN", 400);
  }

  const query = `
    query getUserProfile($username: String!) {
      matchedUser(username: $username) {
        profile { ranking }
        submitStats {
          acSubmissionNum { difficulty count submissions }
        }
      }
    }
  `;

  const raw: any = await fetchJson<unknown>("https://leetcode.com/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "User-Agent": "Mozilla/5.0",
    },
    body: JSON.stringify({ query, variables: { username: safe } }),
    timeoutMs: 9000,
    next: { revalidate: 120 },
  });

  const matchedUser = raw?.data?.matchedUser;
  if (!matchedUser) {
    // If matchedUser is null or missing, the user probably doesn't exist
    throw new CodingStatsServiceError("User not found.", "NOT_FOUND", 404);
  }

  const ranking = matchedUser.profile?.ranking ?? null;
  const stats = matchedUser.submitStats?.acSubmissionNum ?? [];

  const all = stats.find((s: any) => s.difficulty === "All");
  const easy = stats.find((s: any) => s.difficulty === "Easy");
  const medium = stats.find((s: any) => s.difficulty === "Medium");
  const hard = stats.find((s: any) => s.difficulty === "Hard");

  const totalSolved = all?.count ?? 0;
  const totalSubmissions = all?.submissions ?? 0;
  const acceptanceRate = totalSubmissions > 0 ? (totalSolved / totalSubmissions) * 100 : 0;

  return {
    username: safe,
    totalSolved,
    acceptanceRate,
    ranking,
    easySolved: easy?.count ?? 0,
    mediumSolved: medium?.count ?? 0,
    hardSolved: hard?.count ?? 0,
  };
}

export async function fetchCodeforcesStats(handle: string): Promise<CodeforcesStats> {
  const safe = handle.trim();
  if (!safe) {
    throw new CodingStatsServiceError("Handle required.", "UNKNOWN", 400);
  }

  const infoUrl = new URL("https://codeforces.com/api/user.info");
  infoUrl.searchParams.set("handles", safe);

  const statusUrl = new URL("https://codeforces.com/api/user.status");
  statusUrl.searchParams.set("handle", safe);
  statusUrl.searchParams.set("from", "1");
  statusUrl.searchParams.set("count", "2000");

  const [infoRaw, statusRaw] = await Promise.all([
    fetchJson<unknown>(infoUrl, { timeoutMs: 9000, next: { revalidate: 120 } }),
    fetchJson<unknown>(statusUrl, { timeoutMs: 9000, next: { revalidate: 120 } }),
  ]);

  const infoParsed = codeforcesUserInfoResponseSchema.safeParse(infoRaw);
  if (!infoParsed.success) {
    // If Codeforces returns {status:"FAILED", comment:"..."} it won't match schema.
    throw new CodingStatsServiceError("Unable to parse Codeforces user info.", "UPSTREAM_ERROR", 502);
  }

  const statusParsed = codeforcesUserStatusResponseSchema.safeParse(statusRaw);
  if (!statusParsed.success) {
    throw new CodingStatsServiceError("Unable to parse Codeforces submissions.", "UPSTREAM_ERROR", 502);
  }

  const user = infoParsed.data.result[0]!;

  // Compute total solved as unique problems with an accepted submission.
  const solved = new Set<string>();
  for (const s of statusParsed.data.result) {
    if (s.verdict !== "OK") continue;
    const key = `${s.problem.contestId ?? "x"}-${s.problem.index ?? "x"}-${s.problem.name ?? ""}`;
    solved.add(key);
  }

  return {
    handle: safe,
    totalSolved: solved.size,
    rank: user.rank ?? null,
    rating: typeof user.rating === "number" ? user.rating : null,
    maxRank: user.maxRank ?? null,
    maxRating: typeof user.maxRating === "number" ? user.maxRating : null,
  };
}

