import type { RoadmapModule } from "@prisma/client";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  Briefcase,
  CheckSquare,
  Clock,
  Flame,
  FolderCode,
  Map,
  Star,
  Target,
  Zap,
  ChevronRight,
  BookOpen,
  FileText,
  Users,
  TrendingUp,
} from "lucide-react";

import { getDashboardSnapshot } from "@/lib/dal";

const DIFFICULTY_COLOR: Record<string, string> = {
  BEGINNER: "#10b981",
  INTERMEDIATE: "#f59e0b",
  ADVANCED: "#f43f5e",
};

const STATUS_COLOR: Record<string, string> = {
  IN_PROGRESS: "#8b5cf6",
  COMPLETED: "#10b981",
  NOT_STARTED: "#475569",
  REVIEW: "#f59e0b",
};

const STATUS_BG: Record<string, string> = {
  IN_PROGRESS: "rgba(139,92,246,0.12)",
  COMPLETED: "rgba(16,185,129,0.12)",
  NOT_STARTED: "rgba(71,85,105,0.12)",
  REVIEW: "rgba(245,158,11,0.12)",
};

const LEVEL_COLOR: Record<string, string> = {
  EXPERT: "#f59e0b",
  ADVANCED: "#8b5cf6",
  INTERMEDIATE: "#06b6d4",
  BEGINNER: "#10b981",
};

export default async function DashboardPage() {
  const snapshotState = await getDashboardSnapshot();

  if (snapshotState.kind === "unauthenticated") {
    redirect("/api/auth/signout?callbackUrl=/login");
  }

  if (snapshotState.kind === "db_unavailable") {
    return (
      <div style={{
        margin: "64px auto", maxWidth: 520,
        background: "var(--bg-card)", border: "1px solid rgba(244,63,94,0.2)",
        borderRadius: 20, padding: "48px 40px", textAlign: "center",
      }}>
        <div style={{
          width: 56, height: 56, borderRadius: 16,
          background: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.2)",
          display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px",
        }}>
          <Zap size={28} style={{ color: "#f43f5e" }} />
        </div>
        <h1 style={{ fontFamily: "Outfit,sans-serif", fontWeight: 800, fontSize: "1.4rem", marginBottom: 12 }}>
          Database Unavailable
        </h1>
        <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.7 }}>
          EduPath can&apos;t connect to PostgreSQL on <strong>localhost:5432</strong>.
          Start your database or fix your <code>DATABASE_URL</code>, then refresh.
        </p>
      </div>
    );
  }

  const snapshot = snapshotState.snapshot;
  const { user, activeRoadmaps, userProjects, quizResults, applications } = snapshot;

  const roadmapProgress = activeRoadmaps.map((roadmap) => {
    const completed = roadmap.modules.filter((m: RoadmapModule) => m.status === "COMPLETED").length;
    const total = Math.max(roadmap.modules.length, 1);
    return {
      id: roadmap.id,
      title: roadmap.title,
      goal: roadmap.careerGoal,
      progress: Math.round((completed / total) * 100),
      estimatedWeeks: roadmap.estimatedWeeks,
    };
  });

  const xpInLevel = user.xp % 1500;
  const xpPercent = Math.min(100, Math.round((xpInLevel / 1500) * 100));
  const completedProjects = userProjects.filter((p) => p.status === "COMPLETED").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }} className="fade-in-up">

      {/* ═══════ HERO BANNER ═══════ */}
      <div className="hero-banner">
        {/* decorative glow orbs */}
        <div style={{ position: "absolute", top: -40, right: -40, width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle, rgba(139,92,246,0.12), transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -20, left: "30%", width: 120, height: 120, borderRadius: "50%", background: "radial-gradient(circle, rgba(6,182,212,0.08), transparent 70%)", pointerEvents: "none" }} />

        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 24, flexWrap: "wrap" }}>
            {/* LEFT: user info */}
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontSize: "0.78rem", fontWeight: 600, color: "#c4b5fd", marginBottom: 6, letterSpacing: "0.03em" }}>
                Welcome back 👋
              </div>
              <h1 style={{ fontFamily: "Outfit,sans-serif", fontWeight: 800, fontSize: "clamp(1.6rem,3vw,2.2rem)", margin: "0 0 8px", color: "#f0eeff", lineHeight: 1.15 }}>
                {user.name ?? "Learner"}
              </h1>
              <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", marginBottom: 14, lineHeight: 1.5 }}>
                {user.streak > 0 ? (
                  <>You&apos;re on a{" "}<strong style={{ color: "#f59e0b" }}>{user.streak}-day streak</strong>! Keep the momentum going.</>
                ) : (
                  "Start a learning session today to build your streak."
                )}
              </p>
              {user.targetRole && (
                <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 12px", borderRadius: 99, background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.25)", color: "#c4b5fd", fontSize: "0.75rem", fontWeight: 600, marginBottom: 18 }}>
                  <Target size={11} /> {user.targetRole}
                </div>
              )}
              {/* XP bar */}
              <div style={{ maxWidth: 360 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontWeight: 500 }}>Level {user.level}</span>
                  <span style={{ fontSize: "0.72rem", color: "#c4b5fd", fontWeight: 600 }}>{xpInLevel.toLocaleString()} / 1,500 XP → Level {user.level + 1}</span>
                </div>
                <div style={{ height: 7, borderRadius: 99, background: "rgba(255,255,255,0.07)", overflow: "hidden" }}>
                  <div className="xp-bar-fill" style={{ width: `${xpPercent}%` }} />
                </div>
              </div>
            </div>
            {/* RIGHT: CTAs */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10, flexShrink: 0, paddingTop: 28 }}>
              <Link href="/roadmap">
                <button className="btn-cta-primary">Continue Learning <ArrowRight size={14} /></button>
              </Link>
              <Link href="/mentor">
                <button className="btn-cta-secondary">Ask AI Mentor</button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════ STAT CARDS ═══════ */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
        {[
          { label: "Study Streak", value: user.streak > 0 ? user.streak.toString() : "0", unit: user.streak === 1 ? "day" : "days", icon: Flame, color: user.streak > 0 ? "#f59e0b" : "#475569", dataColor: "amber", sub: user.streak > 0 ? "🔥 On fire!" : "Start today" },
          { label: "Total XP", value: user.xp.toLocaleString(), unit: "XP", icon: Zap, color: "#8b5cf6", dataColor: "violet", sub: `Level ${user.level} learner` },
          { label: "Projects Done", value: completedProjects.toString(), unit: completedProjects === 1 ? "project" : "projects", icon: FolderCode, color: "#10b981", dataColor: "emerald", sub: `${userProjects.length} total started` },
          { label: "Applications", value: applications.length.toString(), unit: "tracked", icon: Briefcase, color: "#06b6d4", dataColor: "cyan", sub: "Job pipeline" },
        ].map(({ label, value, unit, icon: Icon, color, dataColor, sub }) => (
          <div key={label} className="stat-card" data-color={dataColor}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.02em" }}>{label}</span>
              <div className="stat-icon" style={{ width: 34, height: 34, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", background: `${color}18`, flexShrink: 0 }}>
                <Icon size={16} style={{ color }} />
              </div>
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 3 }}>
                <span style={{ fontFamily: "Outfit,sans-serif", fontSize: "2rem", fontWeight: 800, color: "var(--text-primary)", lineHeight: 1 }}>{value}</span>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 500 }}>{unit}</span>
              </div>
              <div style={{ fontSize: "0.72rem", color, fontWeight: 600 }}>{sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ═══════ MAIN 60/40 GRID ═══════ */}
      <div style={{ display: "grid", gridTemplateColumns: "3fr 2fr", gap: 18 }}>

        {/* Active Roadmaps */}
        <div className="panel-card">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <h2 style={{ display: "flex", alignItems: "center", gap: 9, fontFamily: "Outfit,sans-serif", fontWeight: 700, fontSize: "0.95rem", margin: 0 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(139,92,246,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Map size={14} style={{ color: "#8b5cf6" }} />
              </div>
              Active Roadmaps
            </h2>
            <Link href="/roadmap" style={{ textDecoration: "none" }}>
              <button style={{ display: "flex", alignItems: "center", gap: 4, padding: "5px 12px", borderRadius: 8, border: "1px solid var(--border-subtle)", background: "transparent", color: "var(--text-muted)", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer" }}>
                Manage <ChevronRight size={11} />
              </button>
            </Link>
          </div>

          {roadmapProgress.length === 0 ? (
            <div style={{ textAlign: "center", padding: "36px 0" }}>
              <Map size={32} style={{ color: "var(--text-muted)", opacity: 0.25, margin: "0 auto 12px", display: "block" }} />
              <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginBottom: 16 }}>No active roadmaps yet.</p>
              <Link href="/roadmap">
                <button style={{ padding: "9px 20px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#8b5cf6,#6366f1)", color: "#fff", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer" }}>
                  Create your first roadmap
                </button>
              </Link>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {roadmapProgress.map(({ id, title, goal, progress, estimatedWeeks }) => (
                <Link key={id} href={`/roadmap/${id}`} style={{ textDecoration: "none" }}>
                  <div className="roadmap-row">
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                      <div style={{ flex: 1, minWidth: 0, paddingRight: 16 }}>
                        <div style={{ fontWeight: 700, fontSize: "0.9rem", marginBottom: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", color: "var(--text-primary)" }}>{title}</div>
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                          <span style={{ padding: "2px 8px", borderRadius: 99, fontSize: "0.68rem", fontWeight: 600, background: "rgba(6,182,212,0.1)", color: "#67e8f9", border: "1px solid rgba(6,182,212,0.15)" }}>{goal}</span>
                          <span style={{ padding: "2px 8px", borderRadius: 99, fontSize: "0.68rem", fontWeight: 600, background: "rgba(255,255,255,0.04)", color: "var(--text-muted)", border: "1px solid rgba(255,255,255,0.07)" }}>{estimatedWeeks}w</span>
                        </div>
                      </div>
                      <span style={{ fontFamily: "Outfit,sans-serif", fontWeight: 800, fontSize: "1.5rem", color: "#8b5cf6", lineHeight: 1, flexShrink: 0 }}>{progress}%</span>
                    </div>
                    <div style={{ height: 5, borderRadius: 99, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                      <div style={{ height: "100%", borderRadius: 99, width: `${progress}%`, background: "linear-gradient(90deg,#8b5cf6,#06b6d4)" }} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Right column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Quiz results */}
          <div className="panel-card" style={{ flex: 1, padding: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <h2 style={{ display: "flex", alignItems: "center", gap: 9, fontFamily: "Outfit,sans-serif", fontWeight: 700, fontSize: "0.95rem", margin: 0 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(16,185,129,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <CheckSquare size={14} style={{ color: "#10b981" }} />
                </div>
                Quiz Results
              </h2>
              <Link href="/quizzes" style={{ textDecoration: "none" }}>
                <button style={{ padding: "5px 12px", borderRadius: 8, border: "1px solid var(--border-subtle)", background: "transparent", color: "var(--text-muted)", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer" }}>
                  Take quiz
                </button>
              </Link>
            </div>
            {quizResults.length === 0 ? (
              <div style={{ textAlign: "center", padding: "16px 0" }}>
                <CheckSquare size={24} style={{ color: "var(--text-muted)", opacity: 0.2, margin: "0 auto 8px", display: "block" }} />
                <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>No quiz results yet.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {quizResults.slice(0, 4).map((result) => (
                  <div key={result.id} className="list-row" style={{ justifyContent: "space-between" }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: "0.82rem" }}>{result.skill}</div>
                      <div style={{ fontSize: "0.68rem", fontWeight: 600, color: LEVEL_COLOR[result.level] ?? "var(--text-muted)", marginTop: 2 }}>{result.level}</div>
                    </div>
                    <div style={{ fontFamily: "Outfit,sans-serif", fontWeight: 800, fontSize: "1.1rem", color: "#8b5cf6" }}>{result.score}%</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick actions */}
          <div className="panel-card" style={{ padding: "20px" }}>
            <h2 style={{ display: "flex", alignItems: "center", gap: 9, fontFamily: "Outfit,sans-serif", fontWeight: 700, fontSize: "0.95rem", margin: "0 0 14px" }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(245,158,11,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Clock size={13} style={{ color: "#f59e0b" }} />
              </div>
              Next Steps
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {[
                { icon: Star, text: "Complete your profile", color: "#f59e0b", href: "/resume" },
                { icon: BookOpen, text: "Take a skill quiz", color: "#8b5cf6", href: "/quizzes" },
                { icon: FolderCode, text: "Start a project", color: "#10b981", href: "/projects" },
                { icon: Users, text: "Join community", color: "#06b6d4", href: "/community" },
              ].map(({ icon: Icon, text, color, href }) => (
                <Link key={text} href={href} style={{ textDecoration: "none" }}>
                  <div className="list-row">
                    <div style={{ width: 28, height: 28, borderRadius: 7, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: `${color}14` }}>
                      <Icon size={13} style={{ color }} />
                    </div>
                    <span style={{ fontSize: "0.8rem", fontWeight: 500, color: "var(--text-secondary)", flex: 1 }}>{text}</span>
                    <ChevronRight size={11} style={{ color: "var(--text-muted)" }} />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ═══════ ACTIVE PROJECTS ═══════ */}
      <div className="panel-card">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <h2 style={{ display: "flex", alignItems: "center", gap: 9, fontFamily: "Outfit,sans-serif", fontWeight: 700, fontSize: "0.95rem", margin: 0 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(6,182,212,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <FolderCode size={14} style={{ color: "#06b6d4" }} />
            </div>
            Active Projects
          </h2>
          <Link href="/projects" style={{ textDecoration: "none" }}>
            <button style={{ display: "flex", alignItems: "center", gap: 4, padding: "5px 12px", borderRadius: 8, border: "1px solid var(--border-subtle)", background: "transparent", color: "var(--text-muted)", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer" }}>
              View all <ChevronRight size={11} />
            </button>
          </Link>
        </div>

        {userProjects.length === 0 ? (
          <div style={{ textAlign: "center", padding: "32px 0" }}>
            <FolderCode size={32} style={{ color: "var(--text-muted)", opacity: 0.2, margin: "0 auto 12px", display: "block" }} />
            <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", marginBottom: 16 }}>No projects started yet.</p>
            <Link href="/projects">
              <button style={{ padding: "9px 20px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#8b5cf6,#6366f1)", color: "#fff", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer" }}>
                Browse projects
              </button>
            </Link>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 12 }}>
            {userProjects.slice(0, 4).map((up) => {
              const diffColor = DIFFICULTY_COLOR[up.project.difficulty] ?? "#8b5cf6";
              const statusColor = STATUS_COLOR[up.status] ?? "#8b5cf6";
              const statusBg = STATUS_BG[up.status] ?? "rgba(139,92,246,0.10)";
              return (
                <div key={up.id} className="list-row" style={{ borderLeft: `3px solid ${diffColor}`, flexDirection: "column", alignItems: "stretch", gap: 10 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "0.875rem", marginBottom: 5 }}>{up.project.title}</div>
                    <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 99, fontSize: "0.66rem", fontWeight: 700, background: statusBg, color: statusColor }}>{up.status.replace("_", " ")}</span>
                  </div>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: "0.7rem" }}>
                      <span style={{ color: "var(--text-muted)" }}>Progress</span>
                      <span style={{ fontWeight: 700, color: diffColor }}>{up.progress}%</span>
                    </div>
                    <div style={{ height: 4, borderRadius: 99, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                      <div style={{ height: "100%", borderRadius: 99, width: `${up.progress}%`, background: `linear-gradient(90deg,${diffColor},${diffColor}90)` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ═══════ JOBS PIPELINE (conditional) ═══════ */}
      {applications.length > 0 && (
        <div className="panel-card">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
            <h2 style={{ display: "flex", alignItems: "center", gap: 9, fontFamily: "Outfit,sans-serif", fontWeight: 700, fontSize: "0.95rem", margin: 0 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(245,158,11,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Briefcase size={14} style={{ color: "#f59e0b" }} />
              </div>
              Job Pipeline
            </h2>
            <Link href="/jobs" style={{ textDecoration: "none" }}>
              <button style={{ display: "flex", alignItems: "center", gap: 4, padding: "5px 12px", borderRadius: 8, border: "1px solid var(--border-subtle)", background: "transparent", color: "var(--text-muted)", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer" }}>
                View all <ChevronRight size={11} />
              </button>
            </Link>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 12 }}>
            {applications.slice(0, 3).map((app) => (
              <div key={app.id} className="list-row" style={{ flexDirection: "column", alignItems: "flex-start", gap: 8 }}>
                <div style={{ fontWeight: 700, fontSize: "0.875rem" }}>{app.job.title}</div>
                <div style={{ fontSize: "0.73rem", color: "var(--text-muted)" }}>{app.job.company}</div>
                <span style={{ padding: "3px 10px", borderRadius: 99, fontSize: "0.68rem", fontWeight: 700, background: "rgba(139,92,246,0.13)", color: "#c4b5fd", border: "1px solid rgba(139,92,246,0.2)" }}>{app.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom filler to account for sidebar name clip */}
      <div style={{ height: 8 }} />
    </div>
  );
}
