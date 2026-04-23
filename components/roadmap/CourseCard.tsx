"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { BookOpen, FileText, Video, HelpCircle, Clock, ArrowRight, CheckCircle2 } from "lucide-react";

type Lesson = { id: string; videos: unknown[]; articles: unknown[] };
type Module = {
  id: string;
  status: string;
  lessons: Lesson[];
  quizQuestions: unknown[];
};
type Roadmap = {
  id: string;
  title: string;
  track: string;
  summary: string;
  estimatedWeeks: number;
  currentSkillLevel: string;
  status: string;
  modules: Module[];
};

interface Props {
  roadmap: Roadmap;
  index?: number;
}

function trackColor(track: string) {
  const t = track.toLowerCase();
  if (t.includes("frontend")) return { accent: "#818cf8", bg: "rgba(99,102,241,0.08)", border: "rgba(99,102,241,0.2)" };
  if (t.includes("backend")) return { accent: "#34d399", bg: "rgba(16,185,129,0.08)", border: "rgba(16,185,129,0.2)" };
  if (t.includes("full")) return { accent: "#c4b5fd", bg: "rgba(139,92,246,0.08)", border: "rgba(139,92,246,0.2)" };
  if (t.includes("ai") || t.includes("data") || t.includes("ml")) return { accent: "#fcd34d", bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.2)" };
  if (t.includes("mobile")) return { accent: "#67e8f9", bg: "rgba(6,182,212,0.08)", border: "rgba(6,182,212,0.2)" };
  if (t.includes("devops") || t.includes("cloud")) return { accent: "#fb923c", bg: "rgba(249,115,22,0.08)", border: "rgba(249,115,22,0.2)" };
  return { accent: "#c4b5fd", bg: "rgba(139,92,246,0.08)", border: "rgba(139,92,246,0.2)" };
}

function levelBadge(level: string): { color: string; bg: string } {
  const l = level.toLowerCase();
  if (l === "beginner") return { color: "#34d399", bg: "rgba(16,185,129,0.12)" };
  if (l === "advanced") return { color: "#f87171", bg: "rgba(244,63,94,0.12)" };
  return { color: "#fcd34d", bg: "rgba(245,158,11,0.12)" };
}

export function CourseCard({ roadmap, index = 0 }: Props) {
  const completed = roadmap.modules.filter((m) => m.status === "COMPLETED").length;
  const total = roadmap.modules.length;
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

  const totalLessons = roadmap.modules.reduce((n, m) => n + m.lessons.length, 0);
  const totalVideos = roadmap.modules.reduce(
    (n, m) => n + m.lessons.reduce((nn, l) => nn + (l.videos as unknown[]).length, 0),
    0
  );
  const totalArticles = roadmap.modules.reduce(
    (n, m) => n + m.lessons.reduce((nn, l) => nn + (l.articles as unknown[]).length, 0),
    0
  );
  const totalQuizzes = roadmap.modules.reduce((n, m) => n + ((m.quizQuestions as unknown[]).length > 0 ? 1 : 0), 0);

  const tc = trackColor(roadmap.track);
  const lbadge = levelBadge(roadmap.currentSkillLevel);

  const actionLabel = progress > 0 && progress < 100 ? "Resume Course" : progress === 100 ? "Review Course" : "Start Course";

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border-subtle)",
        borderRadius: 18,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        transition: "border-color 0.2s, box-shadow 0.2s, transform 0.2s",
      }}
      whileHover={{ y: -3, boxShadow: "0 16px 40px rgba(139,92,246,0.12)" }}
    >
      {/* ── Top accent gradient bar ── */}
      <div style={{ height: 3, background: `linear-gradient(90deg, ${tc.accent}, transparent 80%)` }} />

      <div style={{ padding: "20px 20px 0", flex: 1, display: "flex", flexDirection: "column", gap: 16 }}>

        {/* ── Header: badges + clock chip ── */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Badge row */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
              <span style={{
                fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.06em",
                textTransform: "uppercase", padding: "3px 8px", borderRadius: 6,
                background: tc.bg, color: tc.accent, border: `1px solid ${tc.border}`,
              }}>
                {roadmap.track}
              </span>
              <span style={{
                fontSize: "0.68rem", fontWeight: 700, padding: "3px 8px", borderRadius: 6,
                background: lbadge.bg, color: lbadge.color,
              }}>
                {roadmap.currentSkillLevel}
              </span>
              {progress === 100 && (
                <span style={{
                  display: "flex", alignItems: "center", gap: 3,
                  fontSize: "0.68rem", fontWeight: 700, padding: "3px 8px", borderRadius: 6,
                  background: "rgba(16,185,129,0.12)", color: "#34d399",
                }}>
                  <CheckCircle2 size={9} /> Done
                </span>
              )}
            </div>

            {/* Title */}
            <h2 style={{
              fontFamily: "Outfit,sans-serif", fontWeight: 700, fontSize: "0.95rem",
              lineHeight: 1.35, margin: 0, color: "var(--text-primary)",
              display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
            }}>
              {roadmap.title}
            </h2>

            {/* Summary */}
            <p style={{
              fontSize: "0.775rem", color: "var(--text-secondary)", marginTop: 5,
              lineHeight: 1.5, display: "-webkit-box",
              WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
            }}>
              {roadmap.summary}
            </p>
          </div>

          {/* Duration chip */}
          <div style={{
            flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
            padding: "8px 10px", borderRadius: 10,
            background: "rgba(6,182,212,0.08)", border: "1px solid rgba(6,182,212,0.15)",
          }}>
            <Clock size={13} style={{ color: "#67e8f9" }} />
            <span style={{ fontSize: "0.72rem", fontWeight: 800, color: "#67e8f9" }}>{roadmap.estimatedWeeks}w</span>
          </div>
        </div>

        {/* ── Stats row: clean inline chips ── */}
        <div style={{
          display: "flex", gap: 6, flexWrap: "wrap",
          padding: "10px 12px", borderRadius: 10,
          background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.04)",
        }}>
          {[
            { icon: BookOpen, count: totalLessons, label: "Lessons", color: "#a78bfa" },
            { icon: FileText, count: totalArticles, label: "Articles", color: "#67e8f9" },
            { icon: Video, count: totalVideos, label: "Videos", color: "#f9a8d4" },
            { icon: HelpCircle, count: totalQuizzes, label: "Quizzes", color: "#fcd34d" },
          ].map(({ icon: Icon, count, label, color }) => (
            <div key={label} style={{
              display: "flex", alignItems: "center", gap: 5, flex: 1,
              justifyContent: "center", minWidth: 50,
            }}>
              <Icon size={12} style={{ color, flexShrink: 0 }} />
              <span style={{ fontFamily: "Outfit,sans-serif", fontSize: "0.82rem", fontWeight: 800, color: "var(--text-primary)" }}>{count}</span>
              <span style={{ fontSize: "0.65rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</span>
            </div>
          ))}
        </div>

        {/* ── Progress ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontWeight: 500 }}>
              {completed}/{total} modules complete
            </span>
            <span style={{
              fontFamily: "Outfit,sans-serif", fontSize: "0.82rem", fontWeight: 800,
              color: progress === 100 ? "#34d399" : tc.accent,
            }}>
              {progress}%
            </span>
          </div>
          <div style={{ height: 5, borderRadius: 99, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
            <motion.div
              style={{
                height: "100%", borderRadius: 99,
                background: progress === 100
                  ? "linear-gradient(90deg,#10b981,#06b6d4)"
                  : `linear-gradient(90deg,${tc.accent},${tc.accent}80)`,
              }}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, ease: "easeOut", delay: index * 0.1 + 0.3 }}
            />
          </div>
        </div>
      </div>

      {/* ── CTA Button ── */}
      <div style={{ padding: "16px 20px 20px" }}>
        <Link href={`/roadmap/${roadmap.id}`} style={{ textDecoration: "none", display: "block" }}>
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            padding: "11px 16px", borderRadius: 11, fontWeight: 700, fontSize: "0.85rem",
            background: progress > 0
              ? `linear-gradient(135deg, ${tc.accent}30, ${tc.accent}15)`
              : "linear-gradient(135deg,#8b5cf6,#6366f1)",
            border: progress > 0 ? `1px solid ${tc.accent}40` : "none",
            color: progress > 0 ? tc.accent : "#fff",
            cursor: "pointer",
            transition: "opacity 0.2s",
          }}>
            {actionLabel}
            <ArrowRight size={14} />
          </div>
        </Link>
      </div>
    </motion.div>
  );
}
