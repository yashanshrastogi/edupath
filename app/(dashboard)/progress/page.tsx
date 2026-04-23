import type { Prisma, QuizResult, RoadmapModule } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import {
  BrainCircuit, Flag, FolderGit2, Map, Star, TrendingUp, Zap,
  CheckCircle, ChevronRight,
} from "lucide-react";
import Link from "next/link";

type RoadmapWithModules = Prisma.RoadmapGetPayload<{ include: { modules: true } }>;

const LEVEL_COLORS: Record<string, string> = {
  EXPERT: "#f59e0b",
  ADVANCED: "#8b5cf6",
  INTERMEDIATE: "#06b6d4",
  BEGINNER: "#10b981",
};

export default async function ProgressPage() {
  const session = await requireUser();

  const data = await Promise.all([
    prisma.user.findUnique({ where: { id: session.user.id } }),
    prisma.roadmap.findMany({ where: { userId: session.user.id }, include: { modules: true }, orderBy: { updatedAt: "desc" } }),
    prisma.userProject.findMany({ where: { userId: session.user.id }, include: { project: true }, orderBy: { updatedAt: "desc" } }),
    prisma.quizResult.findMany({ where: { userId: session.user.id }, orderBy: { createdAt: "desc" } }),
    prisma.application.findMany({ where: { userId: session.user.id }, orderBy: { updatedAt: "desc" } }),
  ]).catch(() => null);

  if (!data || !data[0]) {
    return (
      <div className="card text-center py-16 max-w-2xl mx-auto mt-10">
        <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-4 bg-rose-500/10 border border-rose-500/20">
          <Zap size={32} className="text-rose-500" />
        </div>
        <h1 className="text-2xl font-extrabold font-display mb-2">Connection Required</h1>
        <p className="text-sm px-6" style={{ color: "var(--text-secondary)" }}>
          Progress data requires a live PostgreSQL connection. Please start your local database service on port 5432 and refresh.
        </p>
      </div>
    );
  }

  const [dbUser, roadmapsRaw, projects, quizzesRaw, applications] = data;
  const roadmaps: RoadmapWithModules[] = roadmapsRaw;
  const quizzes: QuizResult[] = quizzesRaw;

  const userXp = dbUser.xp;
  const currLevel = dbUser.level;
  const nextLevelXp = currLevel * 1500;
  const prevLevelXp = (currLevel - 1) * 1500;
  const progressToNext = Math.min(100, Math.max(0, Math.round(((userXp - prevLevelXp) / (nextLevelXp - prevLevelXp)) * 100)));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }} className="fade-in-up">

      {/* ═══════ HEADER BANNER ═══════ */}
      <div className="portfolio-banner">
        {/* Subtle watermark */}
        <div style={{ position: "absolute", right: 24, bottom: -10, fontSize: "clamp(3rem, 8vw, 7rem)", fontWeight: 900, lineHeight: 1, color: "#10b981", opacity: 0.04, userSelect: "none", pointerEvents: "none", fontFamily: "Outfit,sans-serif" }}>RISE</div>

        <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: 32, flexWrap: "wrap" }}>
          {/* Left: Icon + title */}
          <div style={{ display: "flex", alignItems: "center", gap: 16, flex: 1, minWidth: 240 }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, flexShrink: 0, background: "linear-gradient(135deg, rgba(16,185,129,0.2), rgba(6,182,212,0.15))", border: "1px solid rgba(16,185,129,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <TrendingUp size={24} style={{ color: "#34d399" }} />
            </div>
            <div>
              <h1 style={{ fontFamily: "Outfit,sans-serif", fontWeight: 800, fontSize: "1.4rem", margin: 0, color: "var(--text-primary)" }}>Learner Portfolio</h1>
              <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", margin: "4px 0 0", maxWidth: 420, lineHeight: 1.5 }}>
                A comprehensive overview of your AI-verified skills, completed projects, and career momentum.
              </p>
            </div>
          </div>

          {/* Right: XP progress card */}
          <div style={{ background: "rgba(0,0,0,0.25)", padding: "16px 20px", borderRadius: 14, border: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: 16, minWidth: 260, flexShrink: 0 }}>
            <div style={{ width: 52, height: 52, borderRadius: "50%", flexShrink: 0, border: "2px solid #10b981", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Outfit,sans-serif", fontWeight: 800, fontSize: "1.2rem", color: "#34d399", boxShadow: "0 0 16px rgba(16,185,129,0.25)" }}>
              {currLevel}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: "0.72rem", color: "#94a3b8", fontWeight: 600 }}>Level {currLevel} Progress</span>
                <span style={{ fontSize: "0.72rem", color: "#34d399", fontWeight: 700 }}>{progressToNext}%</span>
              </div>
              <div style={{ height: 6, borderRadius: 99, background: "rgba(255,255,255,0.07)", overflow: "hidden" }}>
                <div className="xp-bar-fill" style={{ width: `${progressToNext}%`, background: "linear-gradient(90deg,#10b981,#06b6d4)" }} />
              </div>
              <div style={{ fontSize: "0.68rem", marginTop: 5, color: "#475569", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                {userXp.toLocaleString()} / {nextLevelXp.toLocaleString()} XP
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════ SNAPSHOT STATS ═══════ */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
        {[
          { label: "Roadmaps", value: roadmaps.length, icon: Map, color: "#8b5cf6", dataColor: "violet", sub: "Guided Paths" },
          { label: "Projects", value: projects.length, icon: FolderGit2, color: "#06b6d4", dataColor: "cyan", sub: "Code Submissions" },
          { label: "Verified Skills", value: quizzes.length, icon: BrainCircuit, color: "#10b981", dataColor: "emerald", sub: "Quizzes Taken" },
          { label: "Applications", value: applications.length, icon: Flag, color: "#f59e0b", dataColor: "amber", sub: "Jobs Tracked" },
        ].map(({ label, value, icon: Icon, color, dataColor, sub }) => (
          <div key={label} className="stat-card" data-color={dataColor}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: "0.73rem", fontWeight: 600, color: "var(--text-muted)" }}>{label}</span>
              <div className="stat-icon" style={{ width: 32, height: 32, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", background: `${color}16`, border: `1px solid ${color}28`, flexShrink: 0 }}>
                <Icon size={15} style={{ color }} />
              </div>
            </div>
            <div>
              <div style={{ fontFamily: "Outfit,sans-serif", fontSize: "2rem", fontWeight: 800, color: "var(--text-primary)", lineHeight: 1, marginBottom: 4 }}>{value}</div>
              <div style={{ fontSize: "0.71rem", fontWeight: 600, color }}>{sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ═══════ MAIN TWO-COLUMN GRID ═══════ */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>

        {/* Active Roadmaps */}
        <div className="panel-card" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <h2 style={{ fontFamily: "Outfit,sans-serif", fontWeight: 700, fontSize: "0.95rem", margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
              <Map size={15} style={{ color: "#8b5cf6" }} /> Active Roadmaps
            </h2>
            <Link href="/roadmap" style={{ textDecoration: "none" }}>
              <span style={{ fontSize: "0.75rem", color: "#8b5cf6", fontWeight: 600, display: "flex", alignItems: "center", gap: 3, cursor: "pointer" }}>
                View All <ChevronRight size={12} />
              </span>
            </Link>
          </div>

          {roadmaps.length === 0 ? (
            <div style={{ textAlign: "center", padding: "24px 0", color: "var(--text-muted)", fontSize: "0.82rem" }}>No active roadmaps found.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {roadmaps.map((roadmap) => {
                const total = Math.max(roadmap.modules.length, 1);
                const complete = roadmap.modules.filter((m: RoadmapModule) => m.status === "COMPLETED").length;
                const pct = Math.round((complete / total) * 100);
                return (
                  <Link key={roadmap.id} href={`/roadmap/${roadmap.id}`} style={{ textDecoration: "none" }}>
                    <div className="roadmap-row">
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                        <div style={{ minWidth: 0, flex: 1, paddingRight: 12 }}>
                          <div style={{ fontWeight: 600, fontSize: "0.875rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", color: "var(--text-primary)" }}>{roadmap.title}</div>
                          <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: 2 }}>{complete} of {total} Modules Completed</div>
                        </div>
                        <div style={{ fontFamily: "Outfit,sans-serif", fontSize: "1.3rem", fontWeight: 800, color: "#8b5cf6", flexShrink: 0 }}>{pct}%</div>
                      </div>
                      <div style={{ height: 5, borderRadius: 99, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                        <div style={{ height: "100%", borderRadius: 99, width: `${pct}%`, background: "linear-gradient(90deg,#8b5cf6,#6366f1)" }} />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Skill Verification Ledger */}
        <div className="panel-card" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <h2 style={{ fontFamily: "Outfit,sans-serif", fontWeight: 700, fontSize: "0.95rem", margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
              <BrainCircuit size={15} style={{ color: "#10b981" }} /> Skill Ledger
            </h2>
            <Link href="/quizzes" style={{ textDecoration: "none" }}>
              <span style={{ fontSize: "0.75rem", color: "#10b981", fontWeight: 600, display: "flex", alignItems: "center", gap: 3, cursor: "pointer" }}>
                Take Quiz <ChevronRight size={12} />
              </span>
            </Link>
          </div>

          {quizzes.length === 0 ? (
            <div style={{ textAlign: "center", padding: "24px 0", color: "var(--text-muted)", fontSize: "0.82rem" }}>No skills verified yet.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {quizzes.map((quiz) => (
                <div key={quiz.id} className="list-row">
                  <div style={{ width: 40, height: 40, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Outfit,sans-serif", fontWeight: 800, fontSize: "0.82rem", background: `${LEVEL_COLORS[quiz.level] ?? "#8b5cf6"}16`, color: LEVEL_COLORS[quiz.level] ?? "#8b5cf6", border: `1px solid ${LEVEL_COLORS[quiz.level] ?? "#8b5cf6"}28` }}>
                    {quiz.score}%
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: "0.875rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{quiz.skill}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
                      <Star size={9} style={{ color: LEVEL_COLORS[quiz.level] ?? "#8b5cf6", flexShrink: 0 }} />
                      <span style={{ fontSize: "0.68rem", color: LEVEL_COLORS[quiz.level] ?? "#8b5cf6", fontWeight: 600 }}>{quiz.level}</span>
                    </div>
                  </div>
                  <CheckCircle size={14} style={{ color: "#10b981", flexShrink: 0, opacity: 0.7 }} />
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
