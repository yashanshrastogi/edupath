"use client";

import { useEffect, useState } from "react";
import { Code2, FolderGit2, Search } from "lucide-react";
import confetti from "canvas-confetti";

import ProjectCard, { type ProjectCardProject, type ProjectCardUserProject } from "@/components/projects/ProjectCard";

type UserProject = ProjectCardUserProject & {
  id: string;
  project: ProjectCardProject;
};

const DIFFICULTY_COLORS: Record<string, string> = {
  BEGINNER: "#10b981", // Emerald
  INTERMEDIATE: "#f59e0b", // Amber
  ADVANCED: "#f43f5e", // Rose
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectCardProject[]>([]);
  const [userProjects, setUserProjects] = useState<UserProject[]>([]);
  const [allRoadmaps, setAllRoadmaps] = useState<any[]>([]);
  const [activeRoadmap, setActiveRoadmap] = useState<any>(null);
  const [statusMsg, setStatusMsg] = useState("Loading project library...");
  const [filterDiff, setFilterDiff] = useState("All");
  const [search, setSearch] = useState("");
  const [startingId, setStartingId] = useState<string | null>(null);

  const resolveTrack = (r: any) => {
    let t = r?.track;
    if (!t || t === "general") {
      const g = (r?.careerGoal || "").toLowerCase();
      if (g.includes("front")) return "Frontend";
      if (g.includes("back")) return "Backend";
      if (g.includes("full")) return "Full-Stack";
      if (g.includes("ai") || g.includes("machine")) return "AI";
      if (g.includes("data")) return "Data Science";
    }
    return t;
  };

  const fetchProjectsForTrack = async (track: string | undefined) => {
    setStatusMsg(track ? "Loading projects for track..." : "Loading project library...");
    try {
      const projUrl = track
        ? `/api/projects?track=${encodeURIComponent(track)}`
        : "/api/projects";

      const [projRes, userProjRes] = await Promise.all([
        fetch(projUrl),
        fetch("/api/projects?scope=user")
      ]);

      if (!projRes.ok || !userProjRes.ok) {
        setStatusMsg("Sign in and connect PostgreSQL to access the project library.");
        return;
      }

      const [projData, userProjData] = await Promise.all([projRes.json(), userProjRes.json()]);

      setProjects(projData);
      setUserProjects(userProjData);
      setStatusMsg("");
    } catch (err) {
      console.error(err);
      setStatusMsg("Unable to load project catalog.");
    }
  };

  const loadRoadmaps = async () => {
    try {
      const roadmapRes = await fetch("/api/roadmaps");
      if (roadmapRes.ok) {
        const roadmaps = await roadmapRes.json();
        setAllRoadmaps(roadmaps);
        const active = roadmaps.find((r: any) => r.status === "ACTIVE") || roadmaps[0];
        if (active) {
          setActiveRoadmap(active);
          await fetchProjectsForTrack(resolveTrack(active));
          return;
        }
      }

      await fetchProjectsForTrack(undefined);
    } catch (err) {
      console.error(err);
      setStatusMsg("Unable to load roadmaps.");
    }
  };

  useEffect(() => {
    void loadRoadmaps();
  }, []);

  const handleStart = async (projectId: string) => {
    setStartingId(projectId);
    setStatusMsg("");

    const res = await fetch("/api/projects/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId, roadmapId: activeRoadmap?.id }),
    });

    if (!res.ok) {
      const payload = await res.json().catch(() => null);
      setStatusMsg(payload?.error ?? "Failed to start project.");
      setStartingId(null);
      return;
    }

    const payload = await res.json() as { awardedXp: number; alreadyStarted: boolean };

    if (!payload.alreadyStarted) {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#8b5cf6', '#06b6d4', '#f59e0b', '#10b981']
      });
    }

    setStatusMsg(
      payload.alreadyStarted
        ? "Project session resumed."
        : `Project session started successfully! +${payload.awardedXp} XP.`
    );
    setStartingId(null);
    await fetchProjectsForTrack(resolveTrack(activeRoadmap));
  };

  const filteredProjects = projects.filter((p) => {
    if (filterDiff !== "All" && p.difficulty !== filterDiff.toUpperCase()) return false;
    if (search && !p.title.toLowerCase().includes(search.toLowerCase()) && !p.summary.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const grouped = {
    BEGINNER: filteredProjects.filter(p => p.difficulty === "BEGINNER"),
    INTERMEDIATE: filteredProjects.filter(p => p.difficulty === "INTERMEDIATE"),
    ADVANCED: filteredProjects.filter(p => p.difficulty === "ADVANCED"),
  };

  const renderSection = (title: string, items: ProjectCardProject[], accent: string) => {
    return (
      <div className={`space-y-4 ${items.length === 0 ? "opacity-60" : ""}`}>
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-black uppercase tracking-[0.2em]" style={{ color: accent }}>{title}</h2>
          <div className="h-px flex-1" style={{ background: `linear-gradient(to right, ${accent}40, transparent)` }} />
        </div>

        {items.length === 0 ? (
          <div className="p-8 border-2 border-dashed rounded-xl text-center flex flex-col items-center justify-center gap-2" style={{ borderColor: `${accent}20`, backgroundColor: `${accent}05` }}>
            <p className="text-sm font-medium" style={{ color: `${accent}80` }}>More projects coming soon.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {items.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                userProject={userProjects.find((entry) => entry.project.id === project.id)}
                difficultyColor={accent}
                isStarting={startingId === project.id}
                onStart={handleStart}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-8 fade-in-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2 border-b" style={{ borderColor: "var(--border-subtle)" }}>
        <div>
          <h1 className="text-2xl font-extrabold font-display mb-1 flex items-center gap-2">
            <FolderGit2 size={24} style={{ color: "var(--accent-cyan)" }} /> Project Catalog
          </h1>
          <p className="text-sm max-w-xl" style={{ color: "var(--text-secondary)" }}>
            {activeRoadmap
              ? `Recommended for your ${activeRoadmap.title}. Complete these to verify your journey.`
              : "Build real-world applications to verify your skills and build your professional portfolio."}
          </p>
          {statusMsg && <p className="text-sm mt-3 px-3 py-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 inline-block font-medium">{statusMsg}</p>}
        </div>

        {/* Search & Filter */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search projects..."
              className="input-field pl-9"
            />
          </div>
          <select
            className="input-field w-32"
            value={filterDiff}
            onChange={(e) => setFilterDiff(e.target.value)}
          >
            <option value="All">All Levels</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
        </div>
      </div>

      {/* Track Tabs */}
      {allRoadmaps.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4 border-b custom-scrollbar" style={{ borderColor: "var(--border-subtle)" }}>
          {allRoadmaps.map((r) => (
            <button
              key={r.id}
              onClick={() => {
                setActiveRoadmap(r);
                fetchProjectsForTrack(resolveTrack(r));
              }}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors whitespace-nowrap ${activeRoadmap?.id === r.id
                  ? "bg-[var(--accent-cyan)] text-slate-900"
                  : "bg-white/5 hover:bg-white/10 text-slate-300"
                }`}
            >
              {r.careerGoal}
            </button>
          ))}
        </div>
      )}

      {projects.length === 0 && !statusMsg && (
        <div className="card text-center py-16 opacity-80">
          <Code2 size={48} className="mx-auto mb-4 text-slate-500" />
          <h3 className="text-xl font-bold font-display mb-2">The catalog is quiet...</h3>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            {activeRoadmap ? `No projects matched your ${activeRoadmap.careerGoal} track yet.` : "No projects found."}
          </p>
        </div>
      )}

      {/* Grouped Lists */}
      <div className="space-y-12 pb-12">
        {renderSection("Beginner Foundations", grouped.BEGINNER, DIFFICULTY_COLORS.BEGINNER)}
        {renderSection("Intermediate Builders", grouped.INTERMEDIATE, DIFFICULTY_COLORS.INTERMEDIATE)}
        {renderSection("Advanced Architecture", grouped.ADVANCED, DIFFICULTY_COLORS.ADVANCED)}
      </div>
    </div>
  );
}
