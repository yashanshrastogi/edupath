"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Code2, RefreshCw, Save, Plus, ExternalLink, Award, Zap, Target, TrendingUp } from "lucide-react";
import type { CodingStatsApiError, LeetCodeStats, CodeforcesStats } from "@/types/codingStats";

/* ── Platform card wrapper ─────────────────────────────────────── */
function PlatformCard({
  color, badge, name, username, lastSynced, children, onRefresh, loading,
}: {
  color: string; badge: string; name: string; username: string;
  lastSynced?: string; children: React.ReactNode;
  onRefresh: () => void; loading: boolean;
}) {
  return (
    <div
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border-subtle)",
        borderRadius: 18,
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div style={{ padding: "18px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: 14 }}>
        {/* Platform logo bubble */}
        <div
          style={{
            width: 40, height: 40, borderRadius: 10,
            background: color + "22", border: `1px solid ${color}40`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "1rem", fontWeight: 900,
            fontFamily: "monospace", color,
          }}
        >
          {badge}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 800, fontSize: "1rem", fontFamily: "Outfit,sans-serif" }}>{name}</div>
          <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
            {username} · {lastSynced ?? "Last synced just now"}
          </div>
        </div>
        <button
          onClick={onRefresh}
          disabled={loading}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "6px 14px", borderRadius: 8,
            border: "1px solid var(--border-subtle)",
            background: "transparent", color: "var(--text-secondary)",
            fontSize: "0.8rem", fontWeight: 600, cursor: "pointer",
          }}
        >
          <RefreshCw size={13} style={{ animation: loading ? "spin 1s linear infinite" : "none" }} />
          Refresh
        </button>
      </div>

      {/* Stats body */}
      <div style={{ padding: "24px" }}>
        {children}
      </div>
    </div>
  );
}

/* ── Big stat column ───────────────────────────────────────────── */
function StatCol({ value, label, color }: { value: string | number; label: string; color: string }) {
  return (
    <div>
      <div style={{ fontFamily: "Outfit,sans-serif", fontWeight: 800, fontSize: "2rem", color, lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: 4 }}>{label}</div>
    </div>
  );
}

/* ── Badge chip ────────────────────────────────────────────────── */
function BadgeChip({ label, color }: { label: string; color?: string }) {
  return (
    <span style={{
      padding: "4px 12px", borderRadius: 99, fontSize: "0.72rem", fontWeight: 600,
      background: (color ?? "rgba(139,92,246,0.15)"),
      color: (color ? "#fff" : "#c4b5fd"),
      border: "1px solid rgba(255,255,255,0.08)",
    }}>{label}</span>
  );
}

/* ── LeetCode panel ────────────────────────────────────────────── */
function LeetCodePanel({ username }: { username: string | null }) {
  const [data, setData] = useState<LeetCodeStats | null>(null);
  const [error, setError] = useState<CodingStatsApiError | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!username?.trim()) return;
    setLoading(true); setError(null);
    try {
      const res = await fetch(`/api/coding-stats/leetcode?username=${encodeURIComponent(username.trim())}`);
      const json = await res.json() as unknown;
      if (!res.ok) { setError(json as CodingStatsApiError); return; }
      setData(json as LeetCodeStats);
    } catch { setError({ error: "Network error.", code: "UNKNOWN" }); }
    finally { setLoading(false); }
  }, [username]);

  useEffect(() => { void load(); }, [load]);

  if (!username?.trim()) {
    return (
      <div style={{ textAlign: "center", padding: "32px 0", color: "var(--text-muted)", fontSize: "0.9rem" }}>
        Add your LeetCode username above to see your stats
      </div>
    );
  }

  return (
    <PlatformCard
      color="#f59e0b" badge="LC" name="LeetCode"
      username={username} lastSynced="Last synced 2h ago"
      onRefresh={() => void load()} loading={loading}
    >
      {loading && !data ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 24 }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ height: 36, width: 80, borderRadius: 8, background: "rgba(255,255,255,0.06)", animation: "pulse 1.5s infinite" }} />
              <div style={{ height: 12, width: 60, borderRadius: 4, background: "rgba(255,255,255,0.04)", animation: "pulse 1.5s infinite" }} />
            </div>
          ))}
        </div>
      ) : error ? (
        <div style={{ padding: "16px", borderRadius: 12, background: "rgba(244,63,94,0.08)", border: "1px solid rgba(244,63,94,0.2)", display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ fontWeight: 600, color: "#fda4af", fontSize: "0.88rem" }}>Unable to load LeetCode stats</div>
          <div style={{ color: "var(--text-secondary)", fontSize: "0.82rem" }}>{error.error}</div>
          <button className="btn-secondary" style={{ alignSelf: "flex-start", fontSize: "0.8rem" }} onClick={() => void load()}>Retry</button>
        </div>
      ) : data ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* 3 stat columns */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 24 }}>
            <StatCol value={data.totalSolved} label="Problems solved" color="#f5f5f5" />
            <StatCol value={data.ranking ? `#${data.ranking.toLocaleString()}` : "N/A"} label="Global ranking" color="#f59e0b" />
            <StatCol value={`${Math.round(data.acceptanceRate)}%`} label="Acceptance rate" color="#10b981" />
          </div>
          {/* Difficulty breakdown */}
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#10b981", display: "inline-block" }} />
              <span style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>Easy</span>
              <span style={{ fontWeight: 700, fontSize: "0.9rem", color: "#10b981" }}>{data.easySolved ?? "—"}</span>
            </div>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#f59e0b", display: "inline-block" }} />
              <span style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>Medium</span>
              <span style={{ fontWeight: 700, fontSize: "0.9rem", color: "#f59e0b" }}>{data.mediumSolved ?? "—"}</span>
            </div>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#f43f5e", display: "inline-block" }} />
              <span style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>Hard</span>
              <span style={{ fontWeight: 700, fontSize: "0.9rem", color: "#f43f5e" }}>{data.hardSolved ?? "—"}</span>
            </div>
          </div>
          {/* Badges row */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {data.ranking && data.ranking < 100000 && <BadgeChip label="Top 10%" color="#15803d" />}
            {data.totalSolved > 200 && <BadgeChip label="200+ Solved" />}
            {data.totalSolved > 500 && <BadgeChip label="500+ Club" />}
            {(data.easySolved ?? 0) > 0 && (data.mediumSolved ?? 0) > 0 && (data.hardSolved ?? 0) > 0 && <BadgeChip label="All Difficulties" />}
          </div>
        </div>
      ) : null}
    </PlatformCard>
  );
}

/* ── Codeforces panel ──────────────────────────────────────────── */
function CodeforcesPanel({ handle }: { handle: string | null }) {
  const [data, setData] = useState<CodeforcesStats | null>(null);
  const [error, setError] = useState<CodingStatsApiError | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!handle?.trim()) return;
    setLoading(true); setError(null);
    try {
      const res = await fetch(`/api/coding-stats/codeforces?handle=${encodeURIComponent(handle.trim())}`);
      const json = await res.json() as unknown;
      if (!res.ok) { setError(json as CodingStatsApiError); return; }
      setData(json as CodeforcesStats);
    } catch { setError({ error: "Network error.", code: "UNKNOWN" }); }
    finally { setLoading(false); }
  }, [handle]);

  useEffect(() => { void load(); }, [load]);

  if (!handle?.trim()) {
    return (
      <div style={{ textAlign: "center", padding: "32px 0", color: "var(--text-muted)", fontSize: "0.9rem" }}>
        Add your Codeforces handle above to see your stats
      </div>
    );
  }

  return (
    <PlatformCard
      color="#06b6d4" badge="CF" name="Codeforces"
      username={handle} lastSynced="Last synced 2h ago"
      onRefresh={() => void load()} loading={loading}
    >
      {loading && !data ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 24 }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ height: 36, width: 80, borderRadius: 8, background: "rgba(255,255,255,0.06)", animation: "pulse 1.5s infinite" }} />
              <div style={{ height: 12, width: 60, borderRadius: 4, background: "rgba(255,255,255,0.04)", animation: "pulse 1.5s infinite" }} />
            </div>
          ))}
        </div>
      ) : error ? (
        <div style={{ padding: "16px", borderRadius: 12, background: "rgba(244,63,94,0.08)", border: "1px solid rgba(244,63,94,0.2)", display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ fontWeight: 600, color: "#fda4af", fontSize: "0.88rem" }}>Unable to load Codeforces stats</div>
          <div style={{ color: "var(--text-secondary)", fontSize: "0.82rem" }}>{error.error}</div>
          <button className="btn-secondary" style={{ alignSelf: "flex-start", fontSize: "0.8rem" }} onClick={() => void load()}>Retry</button>
        </div>
      ) : data ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* 3 stat columns */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 24 }}>
            <StatCol value={data.rating ?? "N/A"} label="Rating" color="#f5f5f5" />
            <StatCol value={data.totalSolved ?? "—"} label="Problems solved" color="#06b6d4" />
            <StatCol value={data.maxRating ?? "—"} label="Peak rating" color="#8b5cf6" />
          </div>
          {/* Rank & max */}
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
            {data.rank && (
              <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                Rank: <strong style={{ color: "#06b6d4" }}>{data.rank}</strong>
              </span>
            )}
            {data.maxRating && (
              <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                Peak: <strong style={{ color: "#f59e0b" }}>{data.maxRating}</strong>
                {data.maxRank ? <span style={{ color: "var(--text-muted)", marginLeft: 4 }}>({data.maxRank})</span> : ""}
              </span>
            )}
          </div>
          {/* Badges */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {(data.rating ?? 0) >= 1200 && <BadgeChip label="Specialist" color="#276dad" />}
            {(data.rating ?? 0) >= 1400 && <BadgeChip label="Expert" color="#3d3dc5" />}
            {(data.rating ?? 0) >= 1600 && <BadgeChip label="Candidate Master" color="#7a1da0" />}
            {data.totalSolved > 50 && <BadgeChip label={`${data.totalSolved}+ Solved`} />}
          </div>
        </div>
      ) : null}
    </PlatformCard>
  );
}

/* ── Main page client ──────────────────────────────────────────── */
type Props = { initialLeetCodeUsername: string | null; initialCodeforcesHandle: string | null };

export function CodingStatsPageClient({ initialLeetCodeUsername, initialCodeforcesHandle }: Props) {
  const [leetcodeUsername, setLeetcodeUsername] = useState(initialLeetCodeUsername ?? "");
  const [codeforcesHandle, setCodeforcesHandle] = useState(initialCodeforcesHandle ?? "");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<Date | null>(null);

  const dirty = useMemo(() => (
    leetcodeUsername.trim() !== (initialLeetCodeUsername ?? "").trim() ||
    codeforcesHandle.trim() !== (initialCodeforcesHandle ?? "").trim()
  ), [codeforcesHandle, initialCodeforcesHandle, initialLeetCodeUsername, leetcodeUsername]);

  async function save() {
    setSaving(true); setSaveError(null);
    try {
      const res = await fetch("/api/profile/handles", {
        method: "PATCH", headers: { "content-type": "application/json" },
        body: JSON.stringify({ leetcodeUsername: leetcodeUsername.trim() || undefined, codeforcesHandle: codeforcesHandle.trim() || undefined }),
      });
      const json = await res.json() as unknown;
      if (!res.ok) {
        setSaveError(typeof json === "object" && json && "error" in json ? String((json as { error?: unknown }).error ?? "Unable to save.") : "Unable to save.");
        return;
      }
      setSavedAt(new Date());
    } catch { setSaveError("Network error. Please retry."); }
    finally { setSaving(false); }
  }

  return (
    <div className="fade-in-up" style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      {/* ── Page header ── */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: "Outfit,sans-serif", fontWeight: 800, fontSize: "1.5rem", display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(6,182,212,0.15)", border: "1px solid rgba(6,182,212,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Code2 size={18} style={{ color: "#06b6d4" }} />
            </div>
            Coding Stats
          </h1>
          <p style={{ fontSize: "0.88rem", color: "var(--text-secondary)" }}>
            Track your competitive programming progress across platforms.
          </p>
        </div>
        <button
          style={{
            display: "flex", alignItems: "center", gap: 7,
            padding: "9px 18px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)",
            background: "rgba(255,255,255,0.04)", color: "var(--text-secondary)",
            fontSize: "0.85rem", fontWeight: 600, cursor: "pointer",
          }}
        >
          <Plus size={15} /> Connect Account
        </button>
      </div>

      {/* ── Handle inputs ── */}
      <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: 16, padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ fontWeight: 700, fontSize: "0.9rem", marginBottom: 4 }}>Connect Your Profiles</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div>
            <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: 8 }}>LeetCode Username</label>
            <input
              className="input-field"
              value={leetcodeUsername}
              onChange={e => setLeetcodeUsername(e.target.value)}
              placeholder="e.g. neetcode"
            />
          </div>
          <div>
            <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: 8 }}>Codeforces Handle</label>
            <input
              className="input-field"
              value={codeforcesHandle}
              onChange={e => setCodeforcesHandle(e.target.value)}
              placeholder="e.g. tourist"
            />
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            className="btn-primary"
            onClick={() => void save()}
            disabled={saving || !dirty}
            style={{ fontSize: "0.85rem" }}
          >
            <Save size={15} /> {saving ? "Saving…" : "Save Handles"}
          </button>
          {saveError && <span style={{ fontSize: "0.78rem", color: "#fda4af" }}>{saveError}</span>}
          {savedAt && !saveError && <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>✓ Saved at {savedAt.toLocaleTimeString()}</span>}
        </div>
      </div>

      {/* ── Platform cards (side by side) ── */}
      <LeetCodePanel username={leetcodeUsername.trim() || null} />
      <CodeforcesPanel handle={codeforcesHandle.trim() || null} />

    </div>
  );
}
