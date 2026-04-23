"use client";

import { motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useState } from "react";
import { RefreshCw } from "lucide-react";

import type { CodeforcesStats, CodingStatsApiError } from "@/types/codingStats";
import { StatMetric } from "@/components/coding-stats/StatMetric";

type Props = {
  handle: string | null;
  onEditHandle?: () => void;
};

export function CodeforcesCard({ handle, onEditHandle }: Props) {
  const [data, setData] = useState<CodeforcesStats | null>(null);
  const [error, setError] = useState<CodingStatsApiError | null>(null);
  const [loading, setLoading] = useState(false);

  const canFetch = useMemo(() => Boolean(handle?.trim()), [handle]);

  const load = useCallback(async () => {
    if (!handle?.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/coding-stats/codeforces?handle=${encodeURIComponent(handle.trim())}`);
      const json = (await res.json()) as unknown;
      if (!res.ok) {
        setData(null);
        setError(json as CodingStatsApiError);
        return;
      }
      setData(json as CodeforcesStats);
    } catch {
      setData(null);
      setError({ error: "Network error. Please try again.", code: "UNKNOWN" });
    } finally {
      setLoading(false);
    }
  }, [handle]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="card"
    >
      <div className="section-header">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#06b6d4" }} />
          <h2 className="section-title">Codeforces Stats</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void load()}
            className="btn-ghost text-xs inline-flex items-center gap-1"
            disabled={!canFetch || loading}
            title="Refresh"
          >
            <RefreshCw size={14} />
            Refresh
          </button>
          {onEditHandle ? (
            <button type="button" onClick={onEditHandle} className="btn-ghost text-xs">
              Edit
            </button>
          ) : null}
        </div>
      </div>

      {!canFetch ? (
        <div className="text-sm" style={{ color: "var(--text-secondary)" }}>
          Add your Codeforces handle to fetch stats.
        </div>
      ) : loading && !data ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl p-4 animate-pulse"
              style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <div className="h-3 w-24 rounded bg-white/10 mb-3" />
              <div className="h-7 w-16 rounded bg-white/10 mb-2" />
              <div className="h-3 w-32 rounded bg-white/10" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="rounded-xl p-4" style={{ background: "rgba(244,63,94,0.08)", border: "1px solid rgba(244,63,94,0.25)" }}>
          <div className="text-sm font-semibold mb-1" style={{ color: "#fecdd3" }}>
            Unable to load Codeforces stats
          </div>
          <div className="text-xs" style={{ color: "var(--text-secondary)" }}>
            {error.error}
          </div>
          <button type="button" className="btn-secondary text-xs mt-3" onClick={() => void load()}>
            Retry
          </button>
        </div>
      ) : data ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatMetric label="Total Solved" value={data.totalSolved} color="#06b6d4" sub={`@${data.handle}`} />
          <StatMetric
            label="Current Rating"
            value={data.rating ?? "N/A"}
            color="#8b5cf6"
            sub={data.rank ? data.rank : "No rating yet"}
          />
          <StatMetric
            label="Max Rating"
            value={data.maxRating ?? "N/A"}
            color="#f59e0b"
            sub={data.maxRank ? data.maxRank : "Not available"}
          />
        </div>
      ) : null}
    </motion.div>
  );
}

