"use client";

import { motion } from "framer-motion";
import { TrendingUp, AlertCircle, CheckCircle } from "lucide-react";
import type { ProjectEntry } from "./ProjectCardEditor";

interface Props {
  skills: string[];
  projects: ProjectEntry[];
  experience: string;
  education: string;
  atsScore: number;
  name: string;
  email: string;
  phone: string;
  linkedin: string;
  summary: string;
}

interface CategoryScore {
  label: string;
  score: number;
  tip: string | null;
  color: string;
  icon: string;
}

function computeStrength(props: Props): CategoryScore[] {
  const { skills, projects, experience, atsScore, name, email, phone, linkedin, summary } = props;

  const skillsScore = Math.min(100, skills.length * 11);
  const skillsTip =
    skillsScore < 60 ? `Add ${Math.ceil((60 - skillsScore) / 11)} more skills for your target role.`
    : skillsScore < 85 ? "Add a few more specific technical skills."
    : null;

  const projectsScore = Math.min(100, projects.length * 34);
  const projectsTip =
    projectsScore < 34 ? "Add at least 1 portfolio project with a description."
    : projectsScore < 68 ? "Add 2–3 projects with measurable outcomes."
    : null;

  const expLines = experience.split("\n").map((l) => l.trim()).filter(Boolean).length;
  const experienceScore = Math.min(100, expLines * 20);
  const experienceTip =
    experienceScore < 40 ? "Add 2+ experience highlights with quantifiable impact."
    : experienceScore < 70 ? "Expand with specific metrics and outcomes."
    : null;

  const atsOptimizationScore = atsScore > 0 ? atsScore : Math.min(80, skillsScore * 0.7 + projectsScore * 0.3);
  const atsTip =
    atsOptimizationScore < 60 ? "Save & Analyze to get your ATS score."
    : atsOptimizationScore < 80 ? "Match skills to job posting language."
    : null;

  const contactPoints = [!!name, !!email, !!phone, !!linkedin].filter(Boolean).length;
  const hasSummary = summary.length > 50;
  const formattingScore = Math.round((contactPoints / 4) * 70 + (hasSummary ? 30 : 0));
  const formattingTip =
    formattingScore < 50 ? "Fill in name, email, and phone."
    : formattingScore < 80 ? "Add LinkedIn URL and a professional summary."
    : null;

  return [
    { label: "Skills",         score: skillsScore,                         tip: skillsTip,   color: skillsScore >= 80 ? "#10b981" : skillsScore >= 55 ? "#f59e0b" : "#f43f5e",         icon: "🎯" },
    { label: "Projects",       score: projectsScore,                       tip: projectsTip, color: projectsScore >= 80 ? "#10b981" : projectsScore >= 55 ? "#f59e0b" : "#f43f5e",     icon: "📁" },
    { label: "Experience",     score: experienceScore,                     tip: experienceTip, color: experienceScore >= 80 ? "#10b981" : experienceScore >= 55 ? "#f59e0b" : "#f43f5e", icon: "💼" },
    { label: "ATS Optimization", score: Math.round(atsOptimizationScore), tip: atsTip,      color: atsOptimizationScore >= 80 ? "#10b981" : atsOptimizationScore >= 55 ? "#f59e0b" : "#f43f5e", icon: "🤖" },
    { label: "Formatting",     score: formattingScore,                     tip: formattingTip, color: formattingScore >= 80 ? "#10b981" : formattingScore >= 55 ? "#f59e0b" : "#f43f5e",   icon: "📋" },
  ];
}

export function ResumeStrengthMeter(props: Props) {
  const categories = computeStrength(props);
  const overall = Math.round(categories.reduce((a, c) => a + c.score, 0) / categories.length);
  const overallColor = overall >= 80 ? "#10b981" : overall >= 55 ? "#f59e0b" : "#f43f5e";

  const tips = categories.filter((c) => c.tip);

  return (
    <div style={{
      background: "var(--bg-card)",
      border: "1px solid var(--border-subtle)",
      borderRadius: 16,
      padding: "22px 24px",
    }}>
      {/* Header row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(139,92,246,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <TrendingUp size={14} style={{ color: "#8b5cf6" }} />
          </div>
          <span style={{ fontWeight: 700, fontSize: "0.95rem" }}>Resume Strength</span>
        </div>
        <div style={{
          fontFamily: "Outfit,sans-serif",
          fontWeight: 800, fontSize: "1.25rem",
          color: overallColor,
        }}>
          {overall}%
        </div>
      </div>

      {/* Score grid — 5 metrics in a row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 10, marginBottom: 18 }}>
        {categories.map((cat) => (
          <div key={cat.label} style={{
            borderRadius: 12, padding: "12px 10px",
            background: `${cat.color}08`,
            border: `1px solid ${cat.color}20`,
            textAlign: "center",
          }}>
            <div style={{ fontSize: "1.1rem", marginBottom: 4 }}>{cat.icon}</div>
            <div style={{
              fontFamily: "Outfit,sans-serif",
              fontWeight: 800, fontSize: "1.15rem",
              color: cat.color, lineHeight: 1, marginBottom: 4,
            }}>
              {cat.score}%
            </div>
            {/* Mini bar */}
            <div style={{ height: 3, borderRadius: 99, background: "rgba(255,255,255,0.06)", marginBottom: 6 }}>
              <motion.div
                style={{ height: "100%", borderRadius: 99, background: cat.color }}
                initial={{ width: 0 }}
                animate={{ width: `${cat.score}%` }}
                transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
              />
            </div>
            <div style={{ fontSize: "0.62rem", fontWeight: 600, color: "var(--text-muted)", lineHeight: 1.2 }}>
              {cat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Full-width overall bar */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ height: 6, borderRadius: 99, background: "rgba(255,255,255,0.06)" }}>
          <motion.div
            style={{ height: "100%", borderRadius: 99, background: `linear-gradient(90deg, ${overallColor}, ${overallColor}99)` }}
            initial={{ width: 0 }}
            animate={{ width: `${overall}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Tips (only if there are any) */}
      {tips.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {tips.map((cat) => (
            <div key={cat.label} style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "8px 12px", borderRadius: 8, background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.12)" }}>
              <AlertCircle size={13} style={{ color: "#f59e0b", flexShrink: 0, marginTop: 1 }} />
              <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                <strong style={{ color: "var(--text-primary)" }}>{cat.label}:</strong> {cat.tip}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Final status label */}
      <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 6, paddingTop: 12, borderTop: "1px solid var(--border-subtle)", fontSize: "0.78rem", color: "var(--text-muted)" }}>
        {overall >= 80
          ? <><CheckCircle size={13} style={{ color: "#10b981" }} /> <span style={{ color: "#10b981", fontWeight: 600 }}>Strong resume</span> — ready to apply!</>
          : overall >= 55
          ? <><AlertCircle size={13} style={{ color: "#f59e0b" }} /> Good start — address the tips above to reach 80%+</>
          : <><AlertCircle size={13} style={{ color: "#f43f5e" }} /> Keep building — fill in key sections to stand out.</>
        }
      </div>
    </div>
  );
}
