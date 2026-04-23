"use client";

import { useEffect, useState } from "react";
import { BookOpen, Map, Shield, Target } from "lucide-react";
import { CourseCard } from "@/components/roadmap/CourseCard";

type Module = {
  id: string;
  status: string;
  lessons: { id: string; videos: unknown[]; articles: unknown[] }[];
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

const initialForm = {
  currentProfession: "",
  careerGoal: "",
  currentSkillLevel: "Beginner",
  knownSkills: "",
  learningPace: "Moderate (2-3h/day)",
  educationLevel: "Self-taught / Bootcamp graduate",
};

export default function RoadmapPage() {
  const [form, setForm] = useState(initialForm);
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [statusMsg, setStatusMsg] = useState("Loading courses…");
  const [submitting, setSubmitting] = useState(false);
  const [showGenerate, setShowGenerate] = useState(false);
  const [suggestedJobs, setSuggestedJobs] = useState<{
    jobTitle: string; whyItFits: string; matchScore: number;
    pros: string[]; cons: string[]; salariesAndGrowth: string;
  }[]>([]);
  const [expandedJobIndex, setExpandedJobIndex] = useState<number | null>(null);

  const loadRoadmaps = async () => {
    const res = await fetch("/api/roadmaps");
    if (!res.ok) { setStatusMsg("Sign in and connect PostgreSQL to load courses."); return; }
    const data: Roadmap[] = await res.json() as Roadmap[];
    setRoadmaps(data);
    setStatusMsg("");
    if (data.length === 0) setShowGenerate(true);
  };

  useEffect(() => { void loadRoadmaps(); }, []);

  const handleGetRecommendations = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.careerGoal || !form.currentProfession) return;
    setSubmitting(true);
    setStatusMsg("Analyzing your profile…");
    const res = await fetch("/api/roadmaps/recommend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        currentProfession: form.currentProfession,
        careerGoal: form.careerGoal,
        currentSkillLevel: form.currentSkillLevel,
        knownSkills: form.knownSkills.split(",").map((s) => s.trim()).filter(Boolean),
        learningPace: form.learningPace,
        educationLevel: form.educationLevel,
      }),
    });
    setSubmitting(false);
    if (!res.ok) { setStatusMsg((await res.json() as { error?: string }).error ?? "Error"); return; }
    const data = await res.json() as { jobs: typeof suggestedJobs };
    setSuggestedJobs(data.jobs);
    setStatusMsg("");
  };

  const handleGenerateFullRoadmap = async (jobTitle: string) => {
    setSubmitting(true);
    setStatusMsg(`Generating curriculum for ${jobTitle}… this may take 15–20 seconds.`);
    const res = await fetch("/api/roadmaps", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        careerGoal: jobTitle,
        currentSkillLevel: form.currentSkillLevel,
        knownSkills: form.knownSkills.split(",").map((s) => s.trim()).filter(Boolean),
        learningPace: form.learningPace,
        educationLevel: form.educationLevel,
      }),
    });
    if (!res.ok) {
      setStatusMsg((await res.json() as { error?: string }).error ?? "Failed to create roadmap");
      setSubmitting(false);
      return;
    }
    setForm(initialForm);
    setSuggestedJobs([]);
    setExpandedJobIndex(null);
    setSubmitting(false);
    setShowGenerate(false);
    await loadRoadmaps();
    setStatusMsg("✓ New course created!");
  };

  return (
    <div className="space-y-6 fade-in-up">

      {/* ── Page Header ───────────────────────────────────────────────────── */}
      <div style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border-subtle)",
        borderRadius: 18,
        padding: "24px 28px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
        flexWrap: "wrap",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, flex: 1, minWidth: 0 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12, flexShrink: 0,
            background: "linear-gradient(135deg, rgba(139,92,246,0.2), rgba(99,102,241,0.15))",
            border: "1px solid rgba(139,92,246,0.3)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Map size={20} style={{ color: "#c4b5fd" }} />
          </div>
          <div>
            <h1 style={{ fontFamily: "Outfit,sans-serif", fontWeight: 800, fontSize: "1.3rem", margin: 0, color: "var(--text-primary)" }}>
              My Courses
            </h1>
            <p style={{ fontSize: "0.825rem", color: "var(--text-secondary)", margin: 0, marginTop: 2 }}>
              AI-generated learning paths — pick up where you left off.
            </p>
            {statusMsg && (
              <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: 4 }}>{statusMsg}</p>
            )}
          </div>
        </div>

        {!showGenerate && roadmaps.length > 0 && (
          <button
            className="btn-primary"
            style={{ flexShrink: 0 }}
            onClick={() => { setShowGenerate(true); setSuggestedJobs([]); setExpandedJobIndex(null); }}
          >
            <Target size={14} /> New Course
          </button>
        )}
      </div>

      {/* ── Generator Wizard ──────────────────────────────────────────────── */}
      {showGenerate && (
        <div
          className="card glass-hover"
          style={{ border: "1px solid rgba(139,92,246,0.3)", background: "rgba(22,22,31,0.95)" }}
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold font-display flex items-center gap-2">
              <Shield size={18} style={{ color: "var(--accent-cyan)" }} />
              {suggestedJobs.length > 0 ? "Step 2 — Choose Your Career Path" : "Step 1 — Your Profile"}
            </h2>
            {roadmaps.length > 0 && (
              <button className="btn-ghost text-xs px-2 py-1" onClick={() => { setShowGenerate(false); setSuggestedJobs([]); }}>
                Cancel
              </button>
            )}
          </div>

          {/* Step 1 */}
          {suggestedJobs.length === 0 && (
            <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={(e) => void handleGetRecommendations(e)}>
              <div>
                <label className="text-xs font-semibold block mb-1">Current Profession <span className="text-rose-400">*</span></label>
                <input className="input-field" required value={form.currentProfession}
                  onChange={(e) => setForm({ ...form, currentProfession: e.target.value })}
                  placeholder="e.g. Student, Barista, Software Engineer…" />
              </div>
              <div>
                <label className="text-xs font-semibold block mb-1">Target Career Goal <span className="text-rose-400">*</span></label>
                <input className="input-field" required value={form.careerGoal}
                  onChange={(e) => setForm({ ...form, careerGoal: e.target.value })}
                  placeholder="e.g. ML Engineer, Frontend Dev…" />
              </div>
              <div>
                <label className="text-xs font-semibold block mb-1">Current Skill Level</label>
                <select className="input-field" value={form.currentSkillLevel} onChange={(e) => setForm({ ...form, currentSkillLevel: e.target.value })}>
                  <option>Beginner</option><option>Intermediate</option><option>Advanced</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold block mb-1">Education Background</label>
                <select className="input-field" value={form.educationLevel} onChange={(e) => setForm({ ...form, educationLevel: e.target.value })}>
                  <option>High School / No degree</option>
                  <option>Computer Science degree</option>
                  <option>Non-CS degree</option>
                  <option>Self-taught / Bootcamp graduate</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="text-xs font-semibold block mb-1">Known Skills (optional)</label>
                <input className="input-field" value={form.knownSkills}
                  onChange={(e) => setForm({ ...form, knownSkills: e.target.value })}
                  placeholder="React, TypeScript, SQL…" />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs font-semibold block mb-1">Learning Pace</label>
                <select className="input-field" value={form.learningPace} onChange={(e) => setForm({ ...form, learningPace: e.target.value })}>
                  <option>Intensive (4-6h/day)</option>
                  <option>Moderate (2-3h/day)</option>
                  <option>Casual (1h/day)</option>
                </select>
              </div>
              <div className="md:col-span-2 flex justify-end">
                <button className="btn-primary px-8 py-3" disabled={submitting} type="submit">
                  {submitting ? "Analyzing…" : "Find Career Paths"}
                </button>
              </div>
            </form>
          )}

          {/* Step 2 */}
          {suggestedJobs.length > 0 && (
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1 custom-scrollbar">
              <p className="text-sm text-slate-400 mb-4">
                Based on your background as a <strong>{form.currentProfession}</strong>, our AI found {suggestedJobs.length} career paths. Select one to generate a full curriculum.
              </p>
              {suggestedJobs.map((job, index) => {
                const isExpanded = expandedJobIndex === index;
                return (
                  <div key={index}
                    className="card p-4 bg-white/[0.01] border hover:border-violet-500/50 transition-colors"
                    style={{ borderColor: isExpanded ? "var(--accent-violet)" : "rgba(255,255,255,0.05)" }}>
                    <div className="flex justify-between items-center cursor-pointer"
                      onClick={() => setExpandedJobIndex(isExpanded ? null : index)}>
                      <div>
                        <h3 className="font-bold text-lg text-emerald-400">{job.jobTitle}</h3>
                        <p className="text-xs text-slate-400 mt-1 line-clamp-1">{job.whyItFits}</p>
                      </div>
                      <span className="badge badge-cyan text-[10px]">Match: {job.matchScore}%</span>
                    </div>

                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-white/10 space-y-4 fade-in-up">
                        <p className="text-sm text-slate-300">{job.whyItFits}</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="p-3 bg-emerald-500/10 rounded border border-emerald-500/20">
                            <h4 className="text-xs font-bold text-emerald-400 mb-2">Pros</h4>
                            <ul className="text-xs text-emerald-200/80 space-y-1 list-disc list-inside">
                              {job.pros.map((p, i) => <li key={i}>{p}</li>)}
                            </ul>
                          </div>
                          <div className="p-3 bg-rose-500/10 rounded border border-rose-500/20">
                            <h4 className="text-xs font-bold text-rose-400 mb-2">Cons</h4>
                            <ul className="text-xs text-rose-200/80 space-y-1 list-disc list-inside">
                              {job.cons.map((c, i) => <li key={i}>{c}</li>)}
                            </ul>
                          </div>
                        </div>
                        <div className="text-xs font-mono text-cyan-300 bg-cyan-900/20 p-2 rounded">
                          Expected Market: {job.salariesAndGrowth}
                        </div>
                        <div className="flex justify-end pt-2">
                          <button
                            className="btn-primary py-2 px-6"
                            disabled={submitting}
                            onClick={() => void handleGenerateFullRoadmap(job.jobTitle)}
                          >
                            {submitting ? "Generating…" : `Build ${job.jobTitle} Course`}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Course Catalog ────────────────────────────────────────────────── */}
      {roadmaps.length > 0 && (
        <div>
          {/* Section label */}
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            marginBottom: 16, paddingBottom: 12,
            borderBottom: "1px solid var(--border-subtle)",
          }}>
            <BookOpen size={14} style={{ color: "var(--text-muted)" }} />
            <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Your Courses
            </span>
            <span style={{
              marginLeft: 4, padding: "1px 8px", borderRadius: 99,
              fontSize: "0.68rem", fontWeight: 700,
              background: "rgba(139,92,246,0.12)", color: "#c4b5fd",
              border: "1px solid rgba(139,92,246,0.2)",
            }}>
              {roadmaps.length}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {roadmaps.map((roadmap, i) => (
              <CourseCard key={roadmap.id} roadmap={roadmap} index={i} />
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {roadmaps.length === 0 && !showGenerate && !statusMsg && (
        <div className="card text-center py-20 space-y-4">
          <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center"
            style={{ background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)" }}>
            <Map size={28} style={{ color: "var(--accent-violet)" }} />
          </div>
          <h2 className="text-xl font-bold font-display">No courses yet</h2>
          <p className="text-sm max-w-sm mx-auto" style={{ color: "var(--text-secondary)" }}>
            Create your first AI-generated course tailored to your career goal.
          </p>
          <button className="btn-primary mx-auto" onClick={() => setShowGenerate(true)}>
            <Target size={14} /> Create My First Course
          </button>
        </div>
      )}
    </div>
  );
}


// "use client";

// import { useState, useEffect } from "react";
// import {
//   Map,
//   Loader2,
//   ChevronDown,
//   ChevronUp,
//   BookOpen,
//   Award,
//   BrainCircuit,
//   ExternalLink,
//   Trash2,
//   Sparkles,
//   FileText,
//   GraduationCap,
//   PlayCircle,
// } from "lucide-react";

// // ── Types ────────────────────────────────────────────────────────────────────

// interface ResourceLink {
//   title: string;
//   url: string;
//   description?: string;
// }

// interface ModuleResources {
//   videos: ResourceLink[];
//   articles: ResourceLink[];
//   certifications: ResourceLink[];
// }

// interface Lesson {
//   title: string;
//   description?: string;
// }

// interface Module {
//   title: string;
//   description?: string;
//   lessons?: Lesson[];
//   quiz?: { question: string; options: string[]; answer: string }[];
// }

// interface Roadmap {
//   id: string;
//   title: string;
//   goal?: string;
//   modules?: Module[];
//   createdAt?: string;
// }

// // ── Resource cache (keyed by "roadmapId:moduleIndex") ───────────────────────
// type ResourceCache = Record<string, ModuleResources | "loading" | "error">;

// // ── Tab type ─────────────────────────────────────────────────────────────────
// type ModuleTab = "lessons" | "articles" | "videos" | "certifications" | "quiz";

// // ─────────────────────────────────────────────────────────────────────────────
// // Main Page
// // ─────────────────────────────────────────────────────────────────────────────

// export default function RoadmapPage() {
//   // ── Existing state ─────────────────────────────────────────────────────────
//   const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [statusMsg, setStatusMsg] = useState("");
//   const [submitting, setSubmitting] = useState(false);
//   const [showGenerate, setShowGenerate] = useState(false);
//   const [form, setForm] = useState({ goal: "", skills: "", experience: "" });
//   const [suggestedJobs, setSuggestedJobs] = useState<string[]>([]);
//   const [expandedJobIndex, setExpandedJobIndex] = useState<number | null>(null);
//   const [expandedModuleKey, setExpandedModuleKey] = useState<string | null>(null);

//   // ── New state for resources ────────────────────────────────────────────────
//   const [resourceCache, setResourceCache] = useState<ResourceCache>({});
//   const [activeTab, setActiveTab] = useState<Record<string, ModuleTab>>({});

//   // ── Load roadmaps ──────────────────────────────────────────────────────────
//   async function loadRoadmaps() {
//     setLoading(true);
//     try {
//       const res = await fetch("/api/roadmaps");
//       const data = await res.json();
//       setRoadmaps(data.roadmaps ?? []);
//     } catch {
//       setStatusMsg("Failed to load roadmaps.");
//     } finally {
//       setLoading(false);
//     }
//   }

//   useEffect(() => {
//     loadRoadmaps();
//   }, []);

//   // ── Recommend (existing) ───────────────────────────────────────────────────
//   async function handleGetRecommendations() {
//     if (!form.goal.trim()) {
//       setStatusMsg("Please enter your learning goal.");
//       return;
//     }
//     setSubmitting(true);
//     setStatusMsg("");
//     setSuggestedJobs([]);
//     try {
//       const res = await fetch("/api/roadmaps/recommend", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(form),
//       });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.error ?? "Unknown error");
//       const jobs: string[] =
//         typeof data.jobs === "string"
//           ? data.jobs
//             .split("\n")
//             .map((j: string) => j.trim())
//             .filter(Boolean)
//           : data.jobs ?? [];
//       setSuggestedJobs(jobs);
//       setShowGenerate(true);
//     } catch (err: unknown) {
//       const msg = err instanceof Error ? err.message : "Error getting recommendations.";
//       setStatusMsg(msg);
//     } finally {
//       setSubmitting(false);
//     }
//   }

//   // ── Generate full roadmap (existing) ──────────────────────────────────────
//   async function handleGenerateFullRoadmap(selectedJob: string) {
//     setSubmitting(true);
//     setStatusMsg("");
//     try {
//       const res = await fetch("/api/roadmaps", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ ...form, goal: selectedJob }),
//       });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.error ?? "Unknown error");
//       setStatusMsg("Roadmap generated!");
//       setShowGenerate(false);
//       setSuggestedJobs([]);
//       setForm({ goal: "", skills: "", experience: "" });
//       await loadRoadmaps();
//     } catch (err: unknown) {
//       const msg = err instanceof Error ? err.message : "Error generating roadmap.";
//       setStatusMsg(msg);
//     } finally {
//       setSubmitting(false);
//     }
//   }

//   // ── Delete roadmap (existing) ──────────────────────────────────────────────
//   async function handleDelete(id: string) {
//     if (!confirm("Delete this roadmap?")) return;
//     try {
//       await fetch(`/api/roadmaps/${id}`, { method: "DELETE" });
//       setRoadmaps((prev) => prev.filter((r) => r.id !== id));
//     } catch {
//       setStatusMsg("Failed to delete roadmap.");
//     }
//   }

//   // ── Toggle module expand ───────────────────────────────────────────────────
//   function toggleModule(key: string) {
//     setExpandedModuleKey((prev) => (prev === key ? null : key));
//   }

//   // ── Load resources for a module ───────────────────────────────────────────
//   async function loadResources(
//     cacheKey: string,
//     moduleTitle: string,
//     moduleDescription: string
//   ) {
//     if (resourceCache[cacheKey]) return; // already loaded or loading
//     setResourceCache((prev) => ({ ...prev, [cacheKey]: "loading" }));
//     try {
//       const res = await fetch("/api/roadmaps/resources", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ moduleTitle, moduleDescription }),
//       });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.error);
//       setResourceCache((prev) => ({ ...prev, [cacheKey]: data.resources }));
//     } catch {
//       setResourceCache((prev) => ({ ...prev, [cacheKey]: "error" }));
//     }
//   }

//   // ── Get or set tab for a module ───────────────────────────────────────────
//   function getTab(key: string): ModuleTab {
//     return activeTab[key] ?? "lessons";
//   }
//   function setTab(key: string, tab: ModuleTab) {
//     setActiveTab((prev) => ({ ...prev, [key]: tab }));
//     // Auto-fetch resources when switching to a resource tab
//     // (cacheKey passed in from caller)
//   }

//   // ─────────────────────────────────────────────────────────────────────────
//   // Render
//   // ─────────────────────────────────────────────────────────────────────────
//   return (
//     <div className="min-h-screen bg-[#0d1117] text-[#c9d1d9]">
//       {/* ── Header ── */}
//       <div className="border-b border-[#21262d] bg-[#161b22] px-6 py-5">
//         <div className="max-w-4xl mx-auto flex items-center gap-3">
//           <Map className="text-[#58a6ff]" size={24} />
//           <div>
//             <h1 className="text-xl font-semibold text-[#e6edf3]">Learning Roadmap</h1>
//             <p className="text-sm text-[#8b949e] mt-0.5">
//               AI-generated paths with curated videos, articles &amp; certifications
//             </p>
//           </div>
//         </div>
//       </div>

//       <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">

//         {/* ── Generate form ── */}
//         <div className="rounded-xl border border-[#30363d] bg-[#161b22] p-6">
//           <div className="flex items-center gap-2 mb-5">
//             <Sparkles size={16} className="text-[#f0883e]" />
//             <h2 className="font-semibold text-[#e6edf3]">Generate a New Roadmap</h2>
//           </div>
//           <div className="grid gap-3">
//             <input
//               className="w-full rounded-lg border border-[#30363d] bg-[#0d1117] px-4 py-2.5 text-sm text-[#c9d1d9] placeholder-[#484f58] focus:outline-none focus:border-[#58a6ff]"
//               placeholder="Your learning goal (e.g. Become a Full Stack Developer)"
//               value={form.goal}
//               onChange={(e) => setForm({ ...form, goal: e.target.value })}
//             />
//             <input
//               className="w-full rounded-lg border border-[#30363d] bg-[#0d1117] px-4 py-2.5 text-sm text-[#c9d1d9] placeholder-[#484f58] focus:outline-none focus:border-[#58a6ff]"
//               placeholder="Current skills (e.g. HTML, CSS, basic Python)"
//               value={form.skills}
//               onChange={(e) => setForm({ ...form, skills: e.target.value })}
//             />
//             <input
//               className="w-full rounded-lg border border-[#30363d] bg-[#0d1117] px-4 py-2.5 text-sm text-[#c9d1d9] placeholder-[#484f58] focus:outline-none focus:border-[#58a6ff]"
//               placeholder="Experience level (e.g. Beginner, 1 year)"
//               value={form.experience}
//               onChange={(e) => setForm({ ...form, experience: e.target.value })}
//             />
//             <button
//               onClick={handleGetRecommendations}
//               disabled={submitting}
//               className="flex items-center justify-center gap-2 rounded-lg bg-[#238636] hover:bg-[#2ea043] disabled:opacity-50 px-5 py-2.5 text-sm font-medium text-white transition-colors"
//             >
//               {submitting ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
//               {submitting ? "Generating…" : "Get AI Recommendations"}
//             </button>
//           </div>

//           {/* Job suggestions */}
//           {showGenerate && suggestedJobs.length > 0 && (
//             <div className="mt-5 space-y-2">
//               <p className="text-xs text-[#8b949e] mb-3">Select a career path to generate your roadmap:</p>
//               {suggestedJobs.map((job, i) => (
//                 <div
//                   key={i}
//                   className="rounded-lg border border-[#30363d] bg-[#0d1117] overflow-hidden"
//                 >
//                   <button
//                     className="w-full flex items-center justify-between px-4 py-3 text-sm text-left hover:bg-[#21262d] transition-colors"
//                     onClick={() => setExpandedJobIndex(expandedJobIndex === i ? null : i)}
//                   >
//                     <span className="text-[#58a6ff] font-medium">{job}</span>
//                     {expandedJobIndex === i ? (
//                       <ChevronUp size={14} className="text-[#8b949e]" />
//                     ) : (
//                       <ChevronDown size={14} className="text-[#8b949e]" />
//                     )}
//                   </button>
//                   {expandedJobIndex === i && (
//                     <div className="px-4 pb-4">
//                       <button
//                         onClick={() => handleGenerateFullRoadmap(job)}
//                         disabled={submitting}
//                         className="mt-2 flex items-center gap-2 rounded-lg bg-[#1f6feb] hover:bg-[#388bfd] disabled:opacity-50 px-4 py-2 text-sm font-medium text-white transition-colors"
//                       >
//                         {submitting ? <Loader2 size={12} className="animate-spin" /> : <Map size={12} />}
//                         Generate Full Roadmap
//                       </button>
//                     </div>
//                   )}
//                 </div>
//               ))}
//             </div>
//           )}

//           {statusMsg && (
//             <p className="mt-4 text-sm text-[#f0883e]">{statusMsg}</p>
//           )}
//         </div>

//         {/* ── Roadmap list ── */}
//         {loading ? (
//           <div className="flex justify-center py-16">
//             <Loader2 className="animate-spin text-[#58a6ff]" size={28} />
//           </div>
//         ) : roadmaps.length === 0 ? (
//           <div className="text-center py-16 text-[#8b949e]">
//             <Map size={40} className="mx-auto mb-4 opacity-30" />
//             <p className="text-sm">No roadmaps yet. Generate one above!</p>
//           </div>
//         ) : (
//           <div className="space-y-6">
//             {roadmaps.map((roadmap) => (
//               <RoadmapCard
//                 key={roadmap.id}
//                 roadmap={roadmap}
//                 expandedModuleKey={expandedModuleKey}
//                 toggleModule={toggleModule}
//                 resourceCache={resourceCache}
//                 loadResources={loadResources}
//                 getTab={getTab}
//                 setTab={setTab}
//                 onDelete={() => handleDelete(roadmap.id)}
//               />
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // RoadmapCard
// // ─────────────────────────────────────────────────────────────────────────────

// interface RoadmapCardProps {
//   roadmap: Roadmap;
//   expandedModuleKey: string | null;
//   toggleModule: (key: string) => void;
//   resourceCache: ResourceCache;
//   loadResources: (key: string, title: string, desc: string) => Promise<void>;
//   getTab: (key: string) => ModuleTab;
//   setTab: (key: string, tab: ModuleTab) => void;
//   onDelete: () => void;
// }

// function RoadmapCard({
//   roadmap,
//   expandedModuleKey,
//   toggleModule,
//   resourceCache,
//   loadResources,
//   getTab,
//   setTab,
//   onDelete,
// }: RoadmapCardProps) {
//   return (
//     <div className="rounded-xl border border-[#30363d] bg-[#161b22] overflow-hidden">
//       {/* Header */}
//       <div className="flex items-start justify-between px-6 py-4 border-b border-[#21262d]">
//         <div>
//           <h3 className="font-semibold text-[#e6edf3] text-base">{roadmap.title}</h3>
//           {roadmap.goal && (
//             <p className="text-xs text-[#8b949e] mt-1">Goal: {roadmap.goal}</p>
//           )}
//         </div>
//         <button
//           onClick={onDelete}
//           className="text-[#8b949e] hover:text-[#f85149] transition-colors p-1"
//           title="Delete roadmap"
//         >
//           <Trash2 size={15} />
//         </button>
//       </div>

//       {/* Modules */}
//       <div className="divide-y divide-[#21262d]">
//         {(roadmap.modules ?? []).map((mod, idx) => {
//           const moduleKey = `${roadmap.id}:${idx}`;
//           const isOpen = expandedModuleKey === moduleKey;

//           return (
//             <ModuleRow
//               key={moduleKey}
//               moduleKey={moduleKey}
//               mod={mod}
//               idx={idx}
//               isOpen={isOpen}
//               toggleModule={toggleModule}
//               resourceCache={resourceCache}
//               loadResources={loadResources}
//               getTab={getTab}
//               setTab={setTab}
//             />
//           );
//         })}
//       </div>
//     </div>
//   );
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // ModuleRow
// // ─────────────────────────────────────────────────────────────────────────────

// interface ModuleRowProps {
//   moduleKey: string;
//   mod: Module;
//   idx: number;
//   isOpen: boolean;
//   toggleModule: (key: string) => void;
//   resourceCache: ResourceCache;
//   loadResources: (key: string, title: string, desc: string) => Promise<void>;
//   getTab: (key: string) => ModuleTab;
//   setTab: (key: string, tab: ModuleTab) => void;
// }

// function ModuleRow({
//   moduleKey,
//   mod,
//   idx,
//   isOpen,
//   toggleModule,
//   resourceCache,
//   loadResources,
//   getTab,
//   setTab,
// }: ModuleRowProps) {
//   const tab = getTab(moduleKey);
//   const resources = resourceCache[moduleKey];

//   // Trigger resource load when module opens
//   useEffect(() => {
//     if (isOpen) {
//       loadResources(moduleKey, mod.title, mod.description ?? "");
//     }
//   }, [isOpen]);

//   const lessons = mod.lessons ?? [];
//   const quiz = mod.quiz ?? [];

//   return (
//     <div>
//       {/* Module header row */}
//       <button
//         className="w-full flex items-center gap-3 px-6 py-3.5 text-left hover:bg-[#21262d] transition-colors"
//         onClick={() => toggleModule(moduleKey)}
//       >
//         <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#1f6feb] text-white text-xs flex items-center justify-center font-mono font-bold">
//           {idx + 1}
//         </span>
//         <span className="flex-1 text-sm font-medium text-[#e6edf3]">{mod.title}</span>
//         <div className="flex items-center gap-3 text-xs text-[#8b949e]">
//           {lessons.length > 0 && (
//             <span className="flex items-center gap-1">
//               <BookOpen size={11} /> {lessons.length}
//             </span>
//           )}
//           {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
//         </div>
//       </button>

//       {/* Module expanded body */}
//       {isOpen && (
//         <div className="bg-[#0d1117] border-t border-[#21262d]">
//           {/* ── Tabs ── */}
//           <div className="flex border-b border-[#21262d] px-6 gap-1 overflow-x-auto">
//             {(
//               [
//                 { key: "lessons", icon: <BookOpen size={12} />, label: "Lessons" },
//                 { key: "articles", icon: <FileText size={12} />, label: "Articles" },
//                 { key: "videos", icon: <PlayCircle size={12} />, label: "Videos" },
//                 { key: "certifications", icon: <GraduationCap size={12} />, label: "Certifications" },
//                 { key: "quiz", icon: <BrainCircuit size={12} />, label: "Quiz" },
//               ] as { key: ModuleTab; icon: React.ReactNode; label: string }[]
//             ).map((t) => (
//               <button
//                 key={t.key}
//                 onClick={() => setTab(moduleKey, t.key)}
//                 className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${tab === t.key
//                   ? "border-[#58a6ff] text-[#58a6ff]"
//                   : "border-transparent text-[#8b949e] hover:text-[#c9d1d9]"
//                   }`}
//               >
//                 {t.icon}
//                 {t.label}
//               </button>
//             ))}
//           </div>

//           {/* ── Tab Panels ── */}
//           <div className="p-6">

//             {/* LESSONS */}
//             {tab === "lessons" && (
//               <div className="space-y-3">
//                 {lessons.length === 0 ? (
//                   <p className="text-sm text-[#8b949e]">No lessons listed for this module.</p>
//                 ) : (
//                   lessons.map((lesson, li) => (
//                     <div key={li} className="flex gap-3">
//                       <span className="flex-shrink-0 mt-0.5 w-5 h-5 rounded bg-[#1c2128] border border-[#30363d] text-[#8b949e] text-xs flex items-center justify-center">
//                         {li + 1}
//                       </span>
//                       <div>
//                         <p className="text-sm text-[#e6edf3] font-medium">{lesson.title}</p>
//                         {lesson.description && (
//                           <p className="text-xs text-[#8b949e] mt-0.5">{lesson.description}</p>
//                         )}
//                       </div>
//                     </div>
//                   ))
//                 )}
//               </div>
//             )}

//             {/* ARTICLES */}
//             {tab === "articles" && (
//               <ResourcePanel
//                 type="articles"
//                 resources={resources}
//                 icon={<FileText size={14} className="text-[#3fb950]" />}
//                 accentColor="text-[#3fb950]"
//                 emptyLabel="No articles yet."
//               />
//             )}

//             {/* VIDEOS */}
//             {tab === "videos" && (
//               <ResourcePanel
//                 type="videos"
//                 resources={resources}
//                 icon={<PlayCircle size={14} className="text-[#f85149]" />}
//                 accentColor="text-[#f85149]"
//                 emptyLabel="No videos yet."
//               />
//             )}

//             {/* CERTIFICATIONS */}
//             {tab === "certifications" && (
//               <ResourcePanel
//                 type="certifications"
//                 resources={resources}
//                 icon={<Award size={14} className="text-[#f0883e]" />}
//                 accentColor="text-[#f0883e]"
//                 emptyLabel="No certifications yet."
//               />
//             )}

//             {/* QUIZ */}
//             {tab === "quiz" && (
//               <QuizPanel quiz={quiz} />
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // ResourcePanel
// // ─────────────────────────────────────────────────────────────────────────────

// interface ResourcePanelProps {
//   type: "videos" | "articles" | "certifications";
//   resources: ModuleResources | "loading" | "error" | undefined;
//   icon: React.ReactNode;
//   accentColor: string;
//   emptyLabel: string;
// }

// function ResourcePanel({ type, resources, icon, accentColor, emptyLabel }: ResourcePanelProps) {
//   if (!resources || resources === "loading") {
//     return (
//       <div className="flex items-center gap-2 text-sm text-[#8b949e] py-4">
//         <Loader2 size={14} className="animate-spin" />
//         Loading resources…
//       </div>
//     );
//   }

//   if (resources === "error") {
//     return (
//       <p className="text-sm text-[#f85149] py-4">
//         Failed to load resources. Please try again.
//       </p>
//     );
//   }

//   const items: ResourceLink[] = resources[type] ?? [];

//   if (items.length === 0) {
//     return <p className="text-sm text-[#8b949e] py-4">{emptyLabel}</p>;
//   }

//   return (
//     <div className="space-y-3">
//       {items.map((item, i) => (
//         <a
//           key={i}
//           href={item.url}
//           target="_blank"
//           rel="noopener noreferrer"
//           className="group flex items-start gap-3 p-3 rounded-lg border border-[#30363d] hover:border-[#58a6ff] bg-[#161b22] hover:bg-[#1c2128] transition-all"
//         >
//           <span className="mt-0.5 flex-shrink-0">{icon}</span>
//           <div className="flex-1 min-w-0">
//             <p className={`text-sm font-medium group-hover:underline ${accentColor} truncate`}>
//               {item.title}
//             </p>
//             {item.description && (
//               <p className="text-xs text-[#8b949e] mt-0.5 line-clamp-2">{item.description}</p>
//             )}
//             <p className="text-xs text-[#484f58] mt-1 truncate">{item.url}</p>
//           </div>
//           <ExternalLink size={12} className="text-[#484f58] group-hover:text-[#8b949e] flex-shrink-0 mt-1" />
//         </a>
//       ))}
//     </div>
//   );
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // QuizPanel
// // ─────────────────────────────────────────────────────────────────────────────

// function QuizPanel({ quiz }: { quiz: { question: string; options: string[]; answer: string }[] }) {
//   const [selected, setSelected] = useState<Record<number, string>>({});
//   const [submitted, setSubmitted] = useState(false);

//   if (quiz.length === 0) {
//     return (
//       <div className="flex items-center gap-2 text-sm text-[#8b949e] py-4">
//         <BrainCircuit size={14} />
//         No quiz questions for this module.
//       </div>
//     );
//   }

//   const score = quiz.filter((q, i) => selected[i] === q.answer).length;

//   return (
//     <div className="space-y-5">
//       {quiz.map((q, qi) => (
//         <div key={qi} className="space-y-2">
//           <p className="text-sm font-medium text-[#e6edf3]">
//             {qi + 1}. {q.question}
//           </p>
//           <div className="space-y-1.5">
//             {q.options.map((opt, oi) => {
//               const isSelected = selected[qi] === opt;
//               const isCorrect = submitted && opt === q.answer;
//               const isWrong = submitted && isSelected && opt !== q.answer;
//               return (
//                 <button
//                   key={oi}
//                   disabled={submitted}
//                   onClick={() => setSelected((prev) => ({ ...prev, [qi]: opt }))}
//                   className={`w-full text-left px-4 py-2.5 rounded-lg text-sm border transition-colors ${isCorrect
//                     ? "border-[#3fb950] bg-[#1c2e1c] text-[#3fb950]"
//                     : isWrong
//                       ? "border-[#f85149] bg-[#2e1c1c] text-[#f85149]"
//                       : isSelected
//                         ? "border-[#58a6ff] bg-[#1c2433] text-[#58a6ff]"
//                         : "border-[#30363d] bg-[#161b22] text-[#c9d1d9] hover:border-[#8b949e]"
//                     }`}
//                 >
//                   {opt}
//                 </button>
//               );
//             })}
//           </div>
//         </div>
//       ))}

//       {!submitted ? (
//         <button
//           onClick={() => setSubmitted(true)}
//           disabled={Object.keys(selected).length < quiz.length}
//           className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1f6feb] hover:bg-[#388bfd] disabled:opacity-40 text-sm text-white font-medium transition-colors"
//         >
//           <BrainCircuit size={14} />
//           Submit Quiz
//         </button>
//       ) : (
//         <div className="rounded-lg border border-[#30363d] bg-[#161b22] p-4 flex items-center justify-between">
//           <span className="text-sm text-[#8b949e]">Your score</span>
//           <span className={`font-bold text-lg ${score === quiz.length ? "text-[#3fb950]" : "text-[#f0883e]"}`}>
//             {score} / {quiz.length}
//           </span>
//         </div>
//       )}
//     </div>
//   );
// }