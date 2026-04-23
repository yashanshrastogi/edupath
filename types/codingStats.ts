export type LeetCodeStats = {
  username: string;
  totalSolved: number;
  acceptanceRate: number;
  ranking: number | null;
  easySolved: number | null;
  mediumSolved: number | null;
  hardSolved: number | null;
};

export type CodeforcesStats = {
  handle: string;
  totalSolved: number;
  rank: string | null;
  rating: number | null;
  maxRank: string | null;
  maxRating: number | null;
};

export type CodingStatsErrorCode =
  | "INVALID_INPUT"
  | "NOT_FOUND"
  | "RATE_LIMIT"
  | "TIMEOUT"
  | "UPSTREAM_ERROR"
  | "UNKNOWN";

export type CodingStatsApiError = {
  error: string;
  code: CodingStatsErrorCode;
};
