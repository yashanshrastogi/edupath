"use client";

import { useEffect, useState } from "react";
import {
  Bookmark,
  Briefcase,
  CheckCircle,
  Clock,
  DollarSign,
  Filter,
  MapPin,
  X,
} from "lucide-react";

type Job = {
  id: string;
  title: string;
  company: string;
  location: string;
  salaryRange: string;
  type: string;
  skills: string[];
  description: string;
  remoteFriendly: boolean;
  applyLink: string | null;
  logo: string | null;
};
type Application = { id: string; status: string; job: Job };

const JOB_TYPE_COLORS: Record<string, string> = {
  FULL_TIME: "#8b5cf6",
  PART_TIME: "#06b6d4",
  CONTRACT: "#f59e0b",
  INTERNSHIP: "#10b981",
};

const STATUS_LABEL: Record<string, string> = {
  SAVED: "Saved",
  APPLIED: "Applied",
  REVIEWING: "Reviewing",
  INTERVIEW: "Interview",
  OFFER: "Offer",
  REJECTED: "Rejected",
};

const STATUS_COLOR: Record<string, string> = {
  SAVED: "#475569",
  APPLIED: "#8b5cf6",
  REVIEWING: "#06b6d4",
  INTERVIEW: "#f59e0b",
  OFFER: "#10b981",
  REJECTED: "#f43f5e",
};

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [statusMsg, setStatusMsg] = useState("Loading job board...");
  const [filterType, setFilterType] = useState("All");
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [showApplyFor, setShowApplyFor] = useState<string | null>(null);
  const [applyLoading, setApplyLoading] = useState(false);

  const [applicationForm, setApplicationForm] = useState({
    jobId: "",
    fullName: "",
    email: "",
    phone: "",
    coverLetter: "",
  });

  const loadJobs = async () => {
    const [jobRes, appRes] = await Promise.all([fetch("/api/jobs"), fetch("/api/jobs?scope=applications")]);
    if (!jobRes.ok || !appRes.ok) {
      setStatusMsg("Sign in and connect PostgreSQL to use the job board.");
      return;
    }
    const [jobData, appData] = await Promise.all([jobRes.json(), appRes.json()]) as [Job[], Application[]];
    setJobs(jobData);
    setApplications(appData);
    setStatusMsg("");
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadJobs();
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  const apply = async () => {
    setApplyLoading(true);
    const res = await fetch("/api/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...applicationForm,
        jobId: showApplyFor,
        phone: applicationForm.phone || undefined,
        coverLetter: applicationForm.coverLetter || undefined,
      }),
    });
    setApplyLoading(false);
    if (!res.ok) { setStatusMsg((await res.json()).error ?? "Error."); return; }
    setShowApplyFor(null);
    setApplicationForm({ jobId: "", fullName: "", email: "", phone: "", coverLetter: "" });
    setStatusMsg("Application saved!");
    await loadJobs();
  };

  const filteredJobs = jobs.filter((j) => {
    if (filterType === "All") return true;
    if (filterType === "Remote") return j.remoteFriendly;
    return j.type === filterType.toUpperCase().replace("-", "_");
  });

  const appliedJobIds = new Set(applications.map((a) => a.job.id));
  const applyJob = jobs.find((j) => j.id === showApplyFor);

  return (
    <div className="space-y-5 fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-extrabold font-display mb-1 flex items-center gap-2">
            <Briefcase size={22} style={{ color: "var(--accent-amber)" }} /> Job Board
          </h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Browse live listings, apply instantly, and track your pipeline.
          </p>
          {statusMsg && <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{statusMsg}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: job listings */}
        <div className="lg:col-span-2 space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-2 items-center">
            <Filter size={14} style={{ color: "var(--text-muted)" }} />
            {["All", "Remote", "FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP"].map((f) => (
              <button
                key={f}
                onClick={() => setFilterType(f)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                style={{
                  background: filterType === f ? "rgba(139,92,246,0.15)" : "transparent",
                  border: `1px solid ${filterType === f ? "rgba(139,92,246,0.4)" : "rgba(255,255,255,0.07)"}`,
                  color: filterType === f ? "#c4b5fd" : "var(--text-muted)",
                }}
              >
                {f === "FULL_TIME" ? "Full-time" : f === "PART_TIME" ? "Part-time" : f === "CONTRACT" ? "Contract" : f === "INTERNSHIP" ? "Internship" : f}
              </button>
            ))}
          </div>

          {filteredJobs.length === 0 && (
            <div className="card text-center py-10">
              <Briefcase size={32} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                {jobs.length === 0 ? "Connect PostgreSQL and seed the database to view job listings." : "No jobs match this filter."}
              </p>
            </div>
          )}

          {filteredJobs.map((job) => {
            const isApplied = appliedJobIds.has(job.id);
            const isSaved = savedIds.includes(job.id);
            const typeColor = JOB_TYPE_COLORS[job.type] ?? "#8b5cf6";
            return (
              <div
                key={job.id}
                className="card glass-hover"
                style={{ borderLeft: `3px solid ${typeColor}` }}
              >
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1 flex-wrap">
                      {job.logo && (
                        <img src={job.logo} alt={job.company} style={{ width: 28, height: 28, borderRadius: 6, objectFit: "contain", background: "rgba(255,255,255,0.05)", flexShrink: 0 }} />
                      )}
                      <h3 className="font-bold font-display">{job.title}</h3>
                      {isApplied && (
                        <span className="badge badge-emerald text-xs">
                          <CheckCircle size={10} /> Applied
                        </span>
                      )}
                      {job.remoteFriendly && (
                        <span className="badge badge-cyan text-xs">Remote</span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs mb-3" style={{ color: "var(--text-muted)" }}>
                      <span className="font-semibold" style={{ color: "var(--text-secondary)" }}>{job.company}</span>
                      <span><MapPin size={11} className="inline mr-0.5" />{job.location}</span>
                      <span><DollarSign size={11} className="inline mr-0.5" />{job.salaryRange}</span>
                      <span><Clock size={11} className="inline mr-0.5" />{job.type.replace("_", " ")}</span>
                    </div>
                    <p className="text-sm mb-3" style={{ color: "var(--text-secondary)" }}>{job.description}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {job.skills.map((s) => <span key={s} className="tag">{s}</span>)}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <button
                      onClick={() => setSavedIds((prev) => isSaved ? prev.filter((id) => id !== job.id) : [...prev, job.id])}
                      className="btn-ghost text-xs px-3 py-2"
                      title={isSaved ? "Unsave" : "Save"}
                    >
                      <Bookmark size={13} fill={isSaved ? "currentColor" : "none"} />
                    </button>
                    {job.applyLink && (
                      <a href={job.applyLink} target="_blank" rel="noopener noreferrer"
                        className="btn-primary text-xs px-3 py-2 text-center"
                        style={{ textDecoration: "none" }}
                      >
                        Apply ↗
                      </a>
                    )}
                    {!isApplied && (
                      <button
                        className="btn-ghost text-xs px-3 py-2"
                        onClick={() => { setShowApplyFor(job.id); setApplicationForm((f) => ({ ...f, jobId: job.id })); }}
                      >
                        Track
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: sidebar */}
        <div className="space-y-4">
          {/* Application tracker */}
          <div className="card">
            <h2 className="section-title mb-3">Application Tracker</h2>
            {applications.length === 0 ? (
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                No applications yet. Apply to start tracking.
              </p>
            ) : (
              <div className="space-y-2">
                {applications.map((app) => {
                  const sc = STATUS_COLOR[app.status] ?? "#8b5cf6";
                  return (
                    <div
                      key={app.id}
                      className="rounded-xl p-3"
                      style={{ background: "rgba(255,255,255,0.02)", borderLeft: `3px solid ${sc}` }}
                    >
                      <div className="font-semibold text-sm">{app.job.title}</div>
                      <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{app.job.company}</div>
                      <div className="mt-2">
                        <span
                          className="badge text-xs"
                          style={{ background: `${sc}15`, color: sc, border: `1px solid ${sc}30` }}
                        >
                          {STATUS_LABEL[app.status] ?? app.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Pipeline counts */}
          {applications.length > 0 && (
            <div className="card">
              <h2 className="section-title mb-3">Pipeline Overview</h2>
              <div className="space-y-2">
                {Object.entries(STATUS_LABEL).map(([key, label]) => {
                  const count = applications.filter((a) => a.status === key).length;
                  if (count === 0) return null;
                  const color = STATUS_COLOR[key] ?? "#8b5cf6";
                  return (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-xs" style={{ color: "var(--text-muted)" }}>{label}</span>
                      <span className="text-xs font-bold" style={{ color }}>{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Apply modal overlay */}
      {showApplyFor && applyJob && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
          onClick={() => setShowApplyFor(null)}
        >
          <div
            className="card w-full max-w-lg space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold font-display">Apply: {applyJob.title}</h2>
              <button className="btn-ghost p-2" onClick={() => setShowApplyFor(null)}>
                <X size={16} />
              </button>
            </div>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              {applyJob.company} · {applyJob.location}
            </p>
            <input
              className="input-field"
              value={applicationForm.fullName}
              onChange={(e) => setApplicationForm({ ...applicationForm, fullName: e.target.value })}
              placeholder="Full name *"
            />
            <input
              className="input-field"
              value={applicationForm.email}
              onChange={(e) => setApplicationForm({ ...applicationForm, email: e.target.value })}
              placeholder="Email address *"
            />
            <input
              className="input-field"
              value={applicationForm.phone}
              onChange={(e) => setApplicationForm({ ...applicationForm, phone: e.target.value })}
              placeholder="Phone (optional)"
            />
            <textarea
              className="input-field"
              rows={4}
              value={applicationForm.coverLetter}
              onChange={(e) => setApplicationForm({ ...applicationForm, coverLetter: e.target.value })}
              placeholder="Cover letter (optional)"
            />
            <div className="flex gap-3">
              <button className="btn-primary flex-1 justify-center" onClick={() => void apply()} disabled={applyLoading}>
                {applyLoading ? "Submitting..." : "Submit Application"}
              </button>
              <button className="btn-ghost" onClick={() => setShowApplyFor(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
