"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, BookOpen, FileText, Video, HelpCircle, Clock, CheckCircle2,
  Lock, PlayCircle, ChevronDown, ChevronRight, Trash2, RotateCcw,
  Award, Terminal, Layers,
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────────────────
type LessonVideo = { id: string; title: string; youtubeUrl: string };
type LessonArticle = { id: string; title: string; url: string; source: string };
type Lesson = {
  id: string; title: string; content: string;
  estimatedMins: number; difficulty: string;
  videos: LessonVideo[]; articles: LessonArticle[];
};
type QuizQuestion = { id: string; question: string };
type Module = {
  id: string; title: string; description: string;
  weekStart: number; weekEnd: number;
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
  position: number;
  lessons: Lesson[];
  quizQuestions: QuizQuestion[];
  certifications: { id: string; provider: string; certificateName: string; courseUrl: string }[];
  practiceProblems: { id: string; title: string; description: string; difficulty: string }[];
};
type Roadmap = {
  id: string; title: string; track: string; summary: string;
  estimatedWeeks: number; currentSkillLevel: string; status: string;
  modules: Module[];
};

// ─── Helpers ────────────────────────────────────────────────────────────────
function getModuleState(module: Module, index: number, modules: Module[]): "completed" | "active" | "locked" {
  if (module.status === "COMPLETED") return "completed";
  if (index === 0) return "active"; // first module always unlocked
  const prev = modules[index - 1];
  if (!prev || prev.status !== "COMPLETED") return "locked";
  return "active";
}

function levelBadge(level: string) {
  const l = level.toLowerCase();
  if (l === "beginner") return "badge-emerald";
  if (l === "advanced") return "badge-rose";
  return "badge-amber";
}

// ─── Sub-components ──────────────────────────────────────────────────────────
function StatusDot({ state }: { state: "completed" | "active" | "locked" }) {
  if (state === "completed")
    return (
      <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
        style={{ background: "rgba(16,185,129,0.2)", border: "2px solid #10b981" }}>
        <CheckCircle2 size={16} className="text-emerald-400" />
      </div>
    );
  if (state === "locked")
    return (
      <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
        style={{ background: "rgba(71,85,105,0.3)", border: "2px solid rgba(71,85,105,0.5)" }}>
        <Lock size={14} className="text-slate-500" />
      </div>
    );
  return (
    <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
      style={{ background: "rgba(139,92,246,0.25)", border: "2px solid #8b5cf6" }}>
      <PlayCircle size={15} className="text-violet-400" />
    </div>
  );
}

function LessonRow({ lesson }: { lesson: Lesson }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border-subtle)" }}>
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="w-full text-left flex items-center gap-3 px-4 py-3 hover:bg-white/[0.03] transition-colors"
      >
        <BookOpen size={13} className="text-violet-400 shrink-0" />
        <div className="flex-1 min-w-0">
          <span className="text-xs font-semibold">{lesson.title}</span>
        </div>
        <span className="badge badge-violet text-[9px] shrink-0">{lesson.estimatedMins}m</span>
        {open ? <ChevronDown size={13} className="text-slate-500 shrink-0" /> : <ChevronRight size={13} className="text-slate-500 shrink-0" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-1 space-y-3 border-t border-white/5">
              <p className="text-xs text-slate-400 leading-relaxed">{lesson.content}</p>

              {(lesson.videos.length > 0 || lesson.articles.length > 0) && (
                <div className="flex flex-wrap gap-3">
                  {lesson.videos.map((v) => (
                    <a key={v.id} href={v.youtubeUrl} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 font-medium transition-colors">
                      <Video size={13} /> {v.title}
                    </a>
                  ))}
                  {lesson.articles.map((a) => (
                    <a key={a.id} href={a.url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors">
                      <FileText size={13} /> {a.title}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedModuleId, setExpandedModuleId] = useState<string | null>(null);
  const [updatingModuleId, setUpdatingModuleId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const roadmapIdRef = useRef<string>("");

  // Resolve params (Next.js 15 async params)
  useEffect(() => {
    void params.then(({ id }) => {
      roadmapIdRef.current = id;
      void fetchRoadmap(id);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchRoadmap = useCallback(async (id: string) => {
    setLoading(true);
    const res = await fetch("/api/roadmaps");
    if (!res.ok) { setError("Failed to load. Please sign in."); setLoading(false); return; }
    const all: Roadmap[] = await res.json() as Roadmap[];
    const found = all.find((r) => r.id === id);
    if (!found) { setError("Roadmap not found."); setLoading(false); return; }
    setRoadmap(found);
    // Auto-expand the first non-completed module
    const firstActive = found.modules.find((m) => m.status !== "COMPLETED");
    setExpandedModuleId(firstActive?.id ?? found.modules[0]?.id ?? null);
    setLoading(false);
  }, []);

  const updateModuleStatus = async (moduleId: string, status: Module["status"]) => {
    if (!roadmap) return;
    setUpdatingModuleId(moduleId);
    const res = await fetch(`/api/roadmaps/${roadmap.id}/modules/${moduleId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      setRoadmap((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          modules: prev.modules.map((m) => m.id === moduleId ? { ...m, status } : m),
        };
      });
    }
    setUpdatingModuleId(null);
  };

  const deleteRoadmap = async () => {
    if (!roadmap) return;
    if (!confirm("Permanently delete this roadmap?")) return;
    setDeleting(true);
    const res = await fetch(`/api/roadmaps/${roadmap.id}`, { method: "DELETE" });
    if (res.ok) router.push("/roadmap");
    else setDeleting(false);
  };

  // ── Derived ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
      </div>
    );
  }
  if (error || !roadmap) {
    return (
      <div className="card text-center py-16 space-y-3">
        <p className="text-rose-400 font-semibold">{error || "Roadmap not found."}</p>
        <Link href="/roadmap" className="btn-secondary inline-flex"><ArrowLeft size={14} /> Back to Roadmaps</Link>
      </div>
    );
  }

  const completedCount = roadmap.modules.filter((m) => m.status === "COMPLETED").length;
  const total = roadmap.modules.length;
  const progress = total > 0 ? Math.round((completedCount / total) * 100) : 0;

  const totalLessons = roadmap.modules.reduce((n, m) => n + m.lessons.length, 0);
  const totalVideos = roadmap.modules.reduce((n, m) => n + m.lessons.reduce((nn, l) => nn + l.videos.length, 0), 0);
  const totalArticles = roadmap.modules.reduce((n, m) => n + m.lessons.reduce((nn, l) => nn + l.articles.length, 0), 0);

  return (
    <div className="fade-in-up" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* ── Back link ── */}
      <Link href="/roadmap"
        style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: "0.78rem", fontWeight: 600, color: "var(--text-muted)", textDecoration: "none" }}
      >
        <ArrowLeft size={13} /> All Courses
      </Link>

      {/* ── Hero banner ── */}
      <div style={{
        borderRadius: 18, overflow: "hidden",
        background: "rgba(22,22,31,0.95)",
        border: "1px solid rgba(139,92,246,0.25)",
      }}>
        {/* gradient bar */}
        <div style={{ height: 3, background: "linear-gradient(90deg,#8b5cf6,#6366f1,#06b6d4)" }} />

        <div style={{ padding: "24px 28px" }}>
          {/* top row: badges + delete */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 12, flexWrap: "wrap" }}>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              <span style={{ fontSize: "0.7rem", fontWeight: 700, padding: "3px 10px", borderRadius: 6, background: "rgba(139,92,246,0.15)", color: "#c4b5fd", textTransform: "uppercase", letterSpacing: "0.05em" }}>{roadmap.track}</span>
              <span className={`badge ${levelBadge(roadmap.currentSkillLevel)} text-[10px]`}>{roadmap.currentSkillLevel}</span>
              {progress === 100 && <span className="badge badge-emerald text-[10px] flex items-center gap-1"><CheckCircle2 size={10} /> Completed</span>}
            </div>
            <button
              onClick={() => void deleteRoadmap()}
              disabled={deleting}
              style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid rgba(244,63,94,0.2)", background: "rgba(244,63,94,0.06)", color: "#f87171", cursor: "pointer", display: "flex", alignItems: "center", gap: 5, fontSize: "0.75rem", fontWeight: 600 }}
            >
              <Trash2 size={13} /> Delete
            </button>
          </div>

          {/* title + summary */}
          <h1 style={{ fontFamily: "Outfit,sans-serif", fontWeight: 800, fontSize: "clamp(1.3rem,2.5vw,1.75rem)", margin: "0 0 8px", lineHeight: 1.25, color: "var(--text-primary)" }}>
            {roadmap.title}
          </h1>
          <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", margin: "0 0 20px", maxWidth: 640, lineHeight: 1.6 }}>
            {roadmap.summary}
          </p>

          {/* meta chips row */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginBottom: 20 }}>
            {[
              { icon: <Layers size={13} />, label: `${total} Modules`, color: "#c4b5fd" },
              { icon: <BookOpen size={13} />, label: `${totalLessons} Lessons`, color: "#67e8f9" },
              { icon: <Video size={13} />, label: `${totalVideos} Videos`, color: "#f9a8d4" },
              { icon: <FileText size={13} />, label: `${totalArticles} Articles`, color: "#6ee7b7" },
              { icon: <Clock size={13} />, label: `${roadmap.estimatedWeeks} Weeks`, color: "#fcd34d" },
            ].map(({ icon, label, color }) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: "0.8rem", fontWeight: 600, color }}>
                {icon} {label}
              </div>
            ))}
          </div>

          {/* progress bar */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: "0.73rem", color: "var(--text-muted)", fontWeight: 500 }}>
                Course Progress · {completedCount} of {total} modules completed
              </span>
              <span style={{ fontSize: "0.78rem", fontWeight: 800, color: progress === 100 ? "#10b981" : "#c4b5fd" }}>{progress}%</span>
            </div>
            <div style={{ height: 7, borderRadius: 99, background: "rgba(255,255,255,0.07)", overflow: "hidden" }}>
              <motion.div
                style={{ height: "100%", borderRadius: 99, background: progress === 100 ? "linear-gradient(90deg,#10b981,#06b6d4)" : "linear-gradient(90deg,#8b5cf6,#06b6d4)" }}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1.2, ease: "easeOut" }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Grid ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 18, alignItems: "start" }}>

        {/* Module list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, paddingBottom: 12, borderBottom: "1px solid var(--border-subtle)" }}>
            <Layers size={14} style={{ color: "var(--text-muted)" }} />
            <span style={{ fontSize: "0.73rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em" }}>Course Modules</span>
          </div>

          {roadmap.modules.map((module, index) => {
            const state = getModuleState(module, index, roadmap.modules);
            const isExpanded = expandedModuleId === module.id;
            const isLocked = state === "locked";
            const isUpdating = updatingModuleId === module.id;

            const borderColor = state === "completed" ? "rgba(16,185,129,0.3)" : state === "active" ? "rgba(139,92,246,0.3)" : "var(--border-subtle)";

            return (
              <div key={module.id} id={`module-${module.id}`} style={{
                background: "var(--bg-card)",
                border: `1px solid ${borderColor}`,
                borderRadius: 14,
                overflow: "hidden",
                opacity: isLocked ? 0.55 : 1,
                transition: "border-color 0.2s",
                borderLeft: state === "active" ? "3px solid #8b5cf6" : state === "completed" ? "3px solid #10b981" : "1px solid var(--border-subtle)",
              }}>
                {/* Header button */}
                <button
                  type="button"
                  disabled={isLocked}
                  onClick={() => !isLocked && setExpandedModuleId(isExpanded ? null : module.id)}
                  style={{
                    width: "100%", textAlign: "left", display: "flex", alignItems: "center", gap: 14,
                    padding: "16px 18px", background: "transparent", border: "none", cursor: isLocked ? "not-allowed" : "pointer",
                  }}
                >
                  <StatusDot state={state} />

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 3 }}>
                      Module {module.position} · Wks {module.weekStart}–{module.weekEnd}
                    </div>
                    <div style={{ fontWeight: 700, fontSize: "0.92rem", color: "var(--text-primary)" }}>{module.title}</div>
                    <div style={{ fontSize: "0.73rem", color: "var(--text-muted)", marginTop: 2 }}>{module.lessons.length} lessons{module.quizQuestions.length > 0 ? " · Quiz included" : ""}</div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                    {state === "completed" && <span style={{ padding: "3px 8px", borderRadius: 99, fontSize: "0.68rem", fontWeight: 700, background: "rgba(16,185,129,0.12)", color: "#34d399" }}>Done</span>}
                    {state === "active" && module.status === "IN_PROGRESS" && <span style={{ padding: "3px 8px", borderRadius: 99, fontSize: "0.68rem", fontWeight: 700, background: "rgba(139,92,246,0.12)", color: "#c4b5fd" }}>In progress</span>}
                    {isLocked ? <Lock size={14} style={{ color: "#475569" }} /> : (isExpanded ? <ChevronDown size={16} style={{ color: "#475569" }} /> : <ChevronRight size={16} style={{ color: "#475569" }} />)}
                  </div>
                </button>

                {/* Expanded body */}
                <AnimatePresence>
                  {isExpanded && !isLocked && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      style={{ overflow: "hidden" }}
                    >
                      <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", padding: "16px 18px", display: "flex", flexDirection: "column", gap: 14, background: "rgba(0,0,0,0.15)" }}>
                        <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>{module.description}</p>

                        {/* Lessons */}
                        {module.lessons.length > 0 && (
                          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                            <div style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Curriculum</div>
                            {module.lessons.map((lesson) => <LessonRow key={lesson.id} lesson={lesson} />)}
                          </div>
                        )}

                        {/* Certs */}
                        {module.certifications.length > 0 && (
                          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                            <div style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Recommended Certs</div>
                            {module.certifications.map((cert) => (
                              <a key={cert.id} href={cert.courseUrl} target="_blank" rel="noopener noreferrer"
                                style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", borderRadius: 10, textDecoration: "none", background: "rgba(6,182,212,0.08)", border: "1px solid rgba(6,182,212,0.18)" }}>
                                <Award size={13} style={{ color: "#67e8f9", flexShrink: 0 }} />
                                <span style={{ fontSize: "0.8rem", color: "#bae6fd", fontWeight: 500, flex: 1, minWidth: 0 }}>{cert.certificateName}</span>
                                <span style={{ fontSize: "0.68rem", color: "#67e8f9" }}>{cert.provider}</span>
                              </a>
                            ))}
                          </div>
                        )}

                        {/* Practice */}
                        {module.practiceProblems.length > 0 && (
                          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                            <div style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Practice</div>
                            {module.practiceProblems.map((p) => (
                              <div key={p.id} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 12px", borderRadius: 10, background: "rgba(245,158,11,0.07)", border: "1px solid rgba(245,158,11,0.18)" }}>
                                <Terminal size={13} style={{ color: "#fbbf24", flexShrink: 0, marginTop: 2 }} />
                                <div>
                                  <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "#fef3c7" }}>{p.title}</div>
                                  <div style={{ fontSize: "0.72rem", color: "rgba(254,243,199,0.6)", marginTop: 3, lineHeight: 1.5 }}>{p.description}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Quiz */}
                        {module.quizQuestions.length > 0 && (
                          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", borderRadius: 10, background: "rgba(139,92,246,0.07)", border: "1px solid rgba(139,92,246,0.18)" }}>
                            <HelpCircle size={15} style={{ color: "#a78bfa", flexShrink: 0 }} />
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "#c4b5fd" }}>Module Quiz</div>
                              <div style={{ fontSize: "0.72rem", color: "#a78bfa", marginTop: 2 }}>{module.quizQuestions.length} questions — pass to complete</div>
                            </div>
                            <Link href="/quizzes" style={{ padding: "6px 14px", borderRadius: 8, border: "1px solid rgba(139,92,246,0.3)", background: "rgba(139,92,246,0.1)", color: "#c4b5fd", fontSize: "0.75rem", fontWeight: 700, textDecoration: "none" }}>Start Quiz</Link>
                          </div>
                        )}

                        {/* Action */}
                        <div style={{ display: "flex", gap: 8, paddingTop: 6, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                          {module.status === "NOT_STARTED" && (
                            <button type="button" disabled={isUpdating} onClick={() => void updateModuleStatus(module.id, "IN_PROGRESS")}
                              style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 20px", borderRadius: 9, border: "none", background: "linear-gradient(135deg,#8b5cf6,#6366f1)", color: "#fff", fontWeight: 700, fontSize: "0.82rem", cursor: "pointer" }}>
                              {isUpdating ? <span style={{ width: 12, height: 12, border: "2px solid #fff", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} /> : <PlayCircle size={13} />}
                              Start Module
                            </button>
                          )}
                          {module.status === "IN_PROGRESS" && (
                            <button type="button" disabled={isUpdating} onClick={() => void updateModuleStatus(module.id, "COMPLETED")}
                              style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 20px", borderRadius: 9, border: "none", background: "linear-gradient(135deg,#10b981,#059669)", color: "#fff", fontWeight: 700, fontSize: "0.82rem", cursor: "pointer" }}>
                              {isUpdating ? <span style={{ width: 12, height: 12, border: "2px solid #fff", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} /> : <CheckCircle2 size={13} />}
                              Mark Complete
                            </button>
                          )}
                          {module.status === "COMPLETED" && (
                            <button type="button" disabled={isUpdating} onClick={() => void updateModuleStatus(module.id, "IN_PROGRESS")}
                              style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 9, border: "1px solid var(--border-subtle)", background: "transparent", color: "var(--text-muted)", fontWeight: 600, fontSize: "0.78rem", cursor: "pointer" }}>
                              <RotateCcw size={12} /> Reopen
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* ── Syllabus sidebar ── */}
        <div style={{ position: "sticky", top: 24, display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Syllabus nav */}
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: 14, overflow: "hidden" }}>
            <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--border-subtle)" }}>
              <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em" }}>Syllabus</span>
            </div>
            {roadmap.modules.map((module, index) => {
              const state = getModuleState(module, index, roadmap.modules);
              const dotColor = state === "completed" ? "#10b981" : state === "active" ? "#8b5cf6" : "#334155";
              const isActive = expandedModuleId === module.id;
              return (
                <div
                  key={module.id}
                  onClick={() => { if (state !== "locked") { setExpandedModuleId(module.id); document.getElementById(`module-${module.id}`)?.scrollIntoView({ behavior: "smooth", block: "start" }); } }}
                  style={{
                    padding: "11px 16px", borderBottom: "1px solid var(--border-subtle)",
                    cursor: state === "locked" ? "not-allowed" : "pointer",
                    background: isActive ? "rgba(139,92,246,0.06)" : "transparent",
                    transition: "background 0.15s",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 9 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: dotColor, boxShadow: state !== "locked" ? `0 0 6px ${dotColor}70` : "none", marginTop: 4, flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "0.78rem", fontWeight: 600, color: state === "locked" ? "var(--text-muted)" : "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {module.title}
                      </div>
                      <div style={{ display: "flex", gap: 6, marginTop: 3 }}>
                        <span style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>{module.lessons.length} lessons</span>
                        {module.quizQuestions.length > 0 && <span style={{ fontSize: "0.65rem", color: "#fcd34d" }}>· Quiz</span>}
                        {state === "completed" && <CheckCircle2 size={9} style={{ color: "#10b981", marginTop: 1 }} />}
                        {state === "locked" && <Lock size={9} style={{ color: "#334155", marginTop: 1 }} />}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Stats card */}
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: 14, padding: "16px" }}>
            <div style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 12 }}>Course Stats</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { label: "Modules", value: total, color: "#c4b5fd" },
                { label: "Completed", value: completedCount, color: "#10b981" },
                { label: "Remaining", value: total - completedCount, color: "#f59e0b" },
                { label: "Total Lessons", value: totalLessons, color: "#67e8f9" },
              ].map(({ label, value, color }) => (
                <div key={label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{label}</span>
                  <span style={{ fontFamily: "Outfit,sans-serif", fontSize: "0.9rem", fontWeight: 800, color }}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
