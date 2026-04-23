"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Bookmark, Briefcase, CheckCircle, Clock,
  DollarSign, MapPin, Search, X, Filter,
} from "lucide-react";

type Job = {
  id: string; title: string; company: string; location: string;
  salaryRange: string; type: string; skills: string[];
  description: string; remoteFriendly: boolean;
  applyLink: string | null; logo: string | null;
};
type Application = { id: string; status: string; job: Job };

const JOB_TYPE_COLORS: Record<string, string> = {
  FULL_TIME: "#8b5cf6", PART_TIME: "#06b6d4",
  CONTRACT: "#f59e0b", INTERNSHIP: "#10b981",
};
const JOB_TYPE_LABELS: Record<string, string> = {
  FULL_TIME: "Full-time", PART_TIME: "Part-time",
  CONTRACT: "Contract", INTERNSHIP: "Internship",
};
const STATUS_LABEL: Record<string, string> = {
  SAVED: "Saved", APPLIED: "Applied", REVIEWING: "Reviewing",
  INTERVIEW: "Interview", OFFER: "Offer", REJECTED: "Rejected",
};
const STATUS_COLOR: Record<string, string> = {
  SAVED: "#475569", APPLIED: "#8b5cf6", REVIEWING: "#06b6d4",
  INTERVIEW: "#f59e0b", OFFER: "#10b981", REJECTED: "#f43f5e",
};
const FILTERS = ["All", "Remote", "FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP"];
const FILTER_LABELS: Record<string, string> = {
  All: "All", Remote: "Remote 🌐",
  FULL_TIME: "Full-time", PART_TIME: "Part-time",
  CONTRACT: "Contract", INTERNSHIP: "Internship",
};

function SkeletonCard() {
  return (
    <div style={{
      background: "rgba(255,255,255,0.02)", borderRadius: 14,
      border: "1px solid rgba(255,255,255,0.06)",
      borderLeft: "3px solid rgba(139,92,246,0.2)",
      padding: "18px 20px",
    }}>
      <div style={{ display: "flex", gap: 14 }}>
        <div style={{ width: 44, height: 44, borderRadius: 10, background: "rgba(255,255,255,0.05)", flexShrink: 0 }} />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ height: 15, width: "55%", borderRadius: 6, background: "rgba(255,255,255,0.06)" }} />
          <div style={{ height: 11, width: "35%", borderRadius: 6, background: "rgba(255,255,255,0.04)" }} />
          <div style={{ height: 11, width: "85%", borderRadius: 6, background: "rgba(255,255,255,0.04)" }} />
          <div style={{ display: "flex", gap: 6, marginTop: 2 }}>
            {[55, 75, 60, 80].map((w, i) => (
              <div key={i} style={{ height: 22, width: w, borderRadius: 6, background: "rgba(255,255,255,0.04)" }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [showApplyFor, setShowApplyFor] = useState<string | null>(null);
  const [applyLoading, setApplyLoading] = useState(false);
  const [applicationForm, setApplicationForm] = useState({
    jobId: "", fullName: "", email: "", phone: "", coverLetter: "",
  });

  const loadJobs = async () => {
    setLoading(true);
    try {
      const [jobRes, appRes] = await Promise.all([
        fetch("/api/jobs"),
        fetch("/api/jobs?scope=applications"),
      ]);
      if (!jobRes.ok || !appRes.ok) {
        setStatusMsg("Failed to load jobs. Please try again.");
        return;
      }
      const [jobData, appData] = await Promise.all([
        jobRes.json(), appRes.json(),
      ]) as [Job[], Application[]];
      setJobs(jobData);
      setApplications(appData);
    } catch {
      setStatusMsg("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadJobs(); }, []);

  const apply = async () => {
    setApplyLoading(true);
    const res = await fetch("/api/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...applicationForm, jobId: showApplyFor,
        phone: applicationForm.phone || undefined,
        coverLetter: applicationForm.coverLetter || undefined,
      }),
    });
    setApplyLoading(false);
    if (!res.ok) { setStatusMsg((await res.json()).error ?? "Error."); return; }
    setShowApplyFor(null);
    setApplicationForm({ jobId: "", fullName: "", email: "", phone: "", coverLetter: "" });
    await loadJobs();
  };

  const filteredJobs = useMemo(() => jobs.filter((j) => {
    const matchesType =
      filterType === "All" ? true :
      filterType === "Remote" ? j.remoteFriendly :
      j.type === filterType;
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q ||
      j.title.toLowerCase().includes(q) ||
      j.company.toLowerCase().includes(q) ||
      j.skills.some((s) => s.toLowerCase().includes(q));
    return matchesType && matchesSearch;
  }), [jobs, filterType, searchQuery]);

  const appliedJobIds = new Set(applications.map((a) => a.job.id));
  const applyJob = jobs.find((j) => j.id === showApplyFor);

  return (
    <div className="space-y-6 fade-in-up">

      {/* ── Header ── */}
      <div>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <span style={{
            width: 36, height: 36, borderRadius: 10,
            background: "rgba(245,158,11,0.15)",
            border: "1px solid rgba(245,158,11,0.3)",
            display: "inline-flex", alignItems: "center", justifyContent: "center",
          }}>
            <Briefcase size={18} style={{ color: "#f59e0b" }} />
          </span>
          Job Board
        </h1>
        <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginLeft: 46 }}>
          Browse live listings, apply instantly, and track your pipeline.
        </p>
      </div>

      {/* ── Search + Filters ── */}
      <div style={{
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: 14, padding: "14px 16px",
        display: "flex", flexDirection: "column", gap: 12,
      }}>
        {/* Search */}
        <div style={{ position: "relative" }}>
          <Search size={14} style={{
            position: "absolute", left: 12, top: "50%",
            transform: "translateY(-50%)",
            color: "var(--text-muted)", pointerEvents: "none",
          }} />
          <input
            type="text"
            placeholder="Search by title, company, or skill..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%", boxSizing: "border-box",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(139,92,246,0.2)",
              borderRadius: 10, color: "var(--text-primary)",
              padding: "10px 36px", fontSize: "0.85rem", outline: "none",
            }}
            onFocus={e => (e.currentTarget.style.borderColor = "rgba(139,92,246,0.6)")}
            onBlur={e => (e.currentTarget.style.borderColor = "rgba(139,92,246,0.2)")}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} style={{
              position: "absolute", right: 10, top: "50%",
              transform: "translateY(-50%)", background: "none",
              border: "none", cursor: "pointer",
              color: "var(--text-muted)", display: "flex", alignItems: "center",
            }}>
              <X size={14} />
            </button>
          )}
        </div>

        {/* Filter pills + result count */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
          <Filter size={12} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
          {FILTERS.map((f) => {
            const active = filterType === f;
            return (
              <button key={f} onClick={() => setFilterType(f)} style={{
                padding: "4px 12px", borderRadius: 99,
                fontSize: "0.75rem", fontWeight: 600, cursor: "pointer",
                transition: "all 0.15s",
                background: active ? "rgba(139,92,246,0.2)" : "transparent",
                border: `1px solid ${active ? "rgba(139,92,246,0.55)" : "rgba(255,255,255,0.1)"}`,
                color: active ? "#c4b5fd" : "var(--text-muted)",
              }}>
                {FILTER_LABELS[f]}
              </button>
            );
          })}
          <span style={{
            marginLeft: "auto", fontSize: "0.72rem",
            color: "var(--text-muted)", whiteSpace: "nowrap",
          }}>
            {loading ? "Loading…" : `${filteredJobs.length} result${filteredJobs.length !== 1 ? "s" : ""}`}
          </span>
        </div>
      </div>

      {statusMsg && (
        <p style={{ fontSize: "0.8rem", color: "#f43f5e" }}>{statusMsg}</p>
      )}

      {/* ── Main grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left: listings */}
        <div className="lg:col-span-2" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {loading ? (
            [1, 2, 3].map((i) => <SkeletonCard key={i} />)
          ) : filteredJobs.length === 0 ? (
            <div style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 14, padding: "48px 24px",
              textAlign: "center",
            }}>
              <Briefcase size={32} style={{ color: "var(--text-muted)", margin: "0 auto 12px", display: "block", opacity: 0.3 }} />
              <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", marginBottom: 8 }}>
                {searchQuery ? `No jobs found for "${searchQuery}"` : "No jobs match this filter."}
              </p>
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} style={{
                  padding: "6px 16px", borderRadius: 8, fontSize: "0.8rem",
                  background: "rgba(139,92,246,0.1)",
                  border: "1px solid rgba(139,92,246,0.3)",
                  color: "#c4b5fd", cursor: "pointer",
                }}>
                  Clear search
                </button>
              )}
            </div>
          ) : (
            filteredJobs.map((job) => {
              const isApplied = appliedJobIds.has(job.id);
              const isSaved = savedIds.includes(job.id);
              const isHovered = hoveredId === job.id;
              const typeColor = JOB_TYPE_COLORS[job.type] ?? "#8b5cf6";
              const typeLabel = JOB_TYPE_LABELS[job.type] ?? job.type;
              const salaryIsKnown = job.salaryRange !== "Not disclosed";

              return (
                <div
                  key={job.id}
                  onMouseEnter={() => setHoveredId(job.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  style={{
                    background: isHovered ? "rgba(139,92,246,0.05)" : "rgba(255,255,255,0.02)",
                    borderTop: `1px solid ${isHovered ? "rgba(139,92,246,0.25)" : "rgba(255,255,255,0.07)"}`,
                    borderRight: `1px solid ${isHovered ? "rgba(139,92,246,0.25)" : "rgba(255,255,255,0.07)"}`,
                    borderBottom: `1px solid ${isHovered ? "rgba(139,92,246,0.25)" : "rgba(255,255,255,0.07)"}`,
                    borderLeft: `3px solid ${typeColor}`,
                    borderRadius: "0 14px 14px 0",
                    padding: "18px 20px",
                    transition: "all 0.2s ease",
                    transform: isHovered ? "translateX(2px)" : "none",
                  }}
                >
                  <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>

                    {/* Logo */}
                    <div style={{
                      width: 46, height: 46, borderRadius: 10, flexShrink: 0,
                      background: job.logo ? "rgba(255,255,255,0.06)" : `${typeColor}18`,
                      border: `1px solid ${typeColor}30`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      overflow: "hidden",
                    }}>
                      {job.logo ? (
                        <img src={job.logo} alt={job.company} style={{ width: 36, height: 36, objectFit: "contain" }} />
                      ) : (
                        <Briefcase size={18} style={{ color: typeColor }} />
                      )}
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>

                      {/* Title + bookmark */}
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 6 }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <h3 style={{
                            fontWeight: 700, fontSize: "0.95rem",
                            color: "var(--text-primary)", marginBottom: 5,
                            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                          }}>
                            {job.title}
                          </h3>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                            <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--text-secondary)" }}>
                              {job.company}
                            </span>
                            <span style={{
                              fontSize: "0.68rem", fontWeight: 700,
                              padding: "2px 8px", borderRadius: 99,
                              background: `${typeColor}18`,
                              border: `1px solid ${typeColor}35`,
                              color: typeColor,
                            }}>
                              {typeLabel}
                            </span>
                            {job.remoteFriendly && (
                              <span style={{
                                fontSize: "0.68rem", fontWeight: 700,
                                padding: "2px 8px", borderRadius: 99,
                                background: "rgba(6,182,212,0.1)",
                                border: "1px solid rgba(6,182,212,0.25)",
                                color: "#06b6d4",
                              }}>
                                Remote
                              </span>
                            )}
                            {isApplied && (
                              <span style={{
                                fontSize: "0.68rem", fontWeight: 700,
                                padding: "2px 8px", borderRadius: 99,
                                background: "rgba(16,185,129,0.1)",
                                border: "1px solid rgba(16,185,129,0.25)",
                                color: "#10b981",
                                display: "inline-flex", alignItems: "center", gap: 3,
                              }}>
                                <CheckCircle size={9} /> Applied
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Bookmark btn */}
                        <button
                          onClick={() => setSavedIds((prev) =>
                            isSaved ? prev.filter((id) => id !== job.id) : [...prev, job.id]
                          )}
                          title={isSaved ? "Unsave" : "Save job"}
                          style={{
                            background: isSaved ? "rgba(139,92,246,0.15)" : "rgba(255,255,255,0.03)",
                            border: `1px solid ${isSaved ? "rgba(139,92,246,0.4)" : "rgba(255,255,255,0.08)"}`,
                            borderRadius: 8, padding: "6px 8px", cursor: "pointer",
                            color: isSaved ? "#8b5cf6" : "var(--text-muted)",
                            display: "flex", alignItems: "center", flexShrink: 0,
                            transition: "all 0.15s",
                          }}
                        >
                          <Bookmark size={13} fill={isSaved ? "currentColor" : "none"} />
                        </button>
                      </div>

                      {/* Meta row */}
                      <div style={{
                        display: "flex", flexWrap: "wrap", gap: 14,
                        fontSize: "0.76rem", marginBottom: 10,
                      }}>
                        <span style={{ display: "flex", alignItems: "center", gap: 3, color: "var(--text-muted)" }}>
                          <MapPin size={11} /> {job.location}
                        </span>
                        <span style={{
                          display: "flex", alignItems: "center", gap: 3,
                          color: salaryIsKnown ? "#10b981" : "var(--text-muted)",
                          fontWeight: salaryIsKnown ? 600 : 400,
                        }}>
                          <DollarSign size={11} /> {job.salaryRange}
                        </span>
                        <span style={{ display: "flex", alignItems: "center", gap: 3, color: "var(--text-muted)" }}>
                          <Clock size={11} /> {typeLabel}
                        </span>
                      </div>

                      {/* Description */}
                      <p style={{
                        fontSize: "0.81rem", color: "var(--text-secondary)",
                        lineHeight: 1.65, marginBottom: 10,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}>
                        {job.description}
                      </p>

                      {/* Skills */}
                      {job.skills.length > 0 && (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 14 }}>
                          {job.skills.slice(0, 6).map((s) => (
                            <span
                              key={s}
                              onClick={() => setSearchQuery(s)}
                              title={`Search "${s}" jobs`}
                              style={{
                                fontSize: "0.7rem", fontWeight: 600,
                                padding: "3px 10px", borderRadius: 6,
                                background: "rgba(139,92,246,0.08)",
                                border: "1px solid rgba(139,92,246,0.18)",
                                color: "#a78bfa", cursor: "pointer",
                                transition: "all 0.15s",
                              }}
                              onMouseEnter={e => {
                                e.currentTarget.style.background = "rgba(139,92,246,0.18)";
                                e.currentTarget.style.borderColor = "rgba(139,92,246,0.4)";
                              }}
                              onMouseLeave={e => {
                                e.currentTarget.style.background = "rgba(139,92,246,0.08)";
                                e.currentTarget.style.borderColor = "rgba(139,92,246,0.18)";
                              }}
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Divider */}
                      <div style={{ height: 1, background: "rgba(255,255,255,0.05)", marginBottom: 12 }} />

                      {/* Actions */}
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        {job.applyLink && (
                          <a
                            href={job.applyLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              padding: "7px 18px", borderRadius: 8,
                              background: "linear-gradient(135deg,#8b5cf6,#6366f1)",
                              color: "#fff", fontSize: "0.8rem", fontWeight: 700,
                              textDecoration: "none",
                              display: "inline-flex", alignItems: "center", gap: 4,
                            }}
                          >
                            Apply ↗
                          </a>
                        )}
                        {!isApplied && (
                          <button
                            onClick={() => {
                              setShowApplyFor(job.id);
                              setApplicationForm((f) => ({ ...f, jobId: job.id }));
                            }}
                            style={{
                              padding: "7px 14px", borderRadius: 8,
                              background: "rgba(255,255,255,0.03)",
                              border: "1px solid rgba(255,255,255,0.1)",
                              color: "var(--text-secondary)",
                              fontSize: "0.8rem", fontWeight: 600,
                              cursor: "pointer", transition: "all 0.15s",
                              display: "flex", alignItems: "center", gap: 6,
                            }}
                            onMouseEnter={e => {
                              e.currentTarget.style.background = "rgba(139,92,246,0.1)";
                              e.currentTarget.style.borderColor = "rgba(139,92,246,0.3)";
                              e.currentTarget.style.color = "#c4b5fd";
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                              e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                              e.currentTarget.style.color = "var(--text-secondary)";
                            }}
                          >
                            <Bookmark size={12} /> Track
                          </button>
                        )}
                        {isApplied && (
                          <span style={{
                            fontSize: "0.75rem", color: "var(--text-muted)",
                            display: "flex", alignItems: "center", gap: 4,
                          }}>
                            <CheckCircle size={12} style={{ color: "#10b981" }} />
                            Tracking this application
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

          {/* Stats grid */}
          <div style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 14, padding: 14,
            display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10,
          }}>
            {[
              { label: "Live Jobs", value: jobs.length, color: "#8b5cf6" },
              { label: "Applied", value: applications.length, color: "#10b981" },
              { label: "Saved", value: savedIds.length, color: "#f59e0b" },
              { label: "Remote", value: jobs.filter(j => j.remoteFriendly).length, color: "#06b6d4" },
            ].map(({ label, value, color }) => (
              <div key={label} style={{
                background: `${color}08`,
                borderRadius: 10, padding: "12px 14px",
                border: `1px solid ${color}20`,
              }}>
                <div style={{
                  fontSize: "0.65rem", color: "var(--text-muted)",
                  fontWeight: 600, marginBottom: 4, textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}>
                  {label}
                </div>
                <div style={{ fontSize: "1.4rem", fontWeight: 800, color }}>
                  {loading ? "—" : value}
                </div>
              </div>
            ))}
          </div>

          {/* Application Tracker */}
          <div style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 14, padding: 16,
          }}>
            <div style={{
              fontSize: "0.75rem", fontWeight: 700,
              color: "var(--text-secondary)", letterSpacing: "0.08em",
              textTransform: "uppercase", marginBottom: 12,
            }}>
              Application Tracker
            </div>
            {applications.length === 0 ? (
              <div style={{ textAlign: "center", padding: "16px 0" }}>
                <Briefcase size={24} style={{
                  color: "var(--text-muted)", margin: "0 auto 8px",
                  display: "block", opacity: 0.3,
                }} />
                <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: 4 }}>
                  No applications yet.
                </p>
                <p style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                  Click "Track" on any job to start.
                </p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {applications.map((app) => {
                  const sc = STATUS_COLOR[app.status] ?? "#8b5cf6";
                  return (
                    <div key={app.id} style={{
                      borderRadius: 10, padding: "10px 12px",
                      background: `${sc}08`,
                      border: `1px solid ${sc}20`,
                      borderLeft: `3px solid ${sc}`,
                    }}>
                      <div style={{
                        fontWeight: 600, fontSize: "0.8rem",
                        color: "var(--text-primary)", marginBottom: 2,
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                      }}>
                        {app.job.title}
                      </div>
                      <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginBottom: 6 }}>
                        {app.job.company}
                      </div>
                      <span style={{
                        fontSize: "0.65rem", fontWeight: 700,
                        padding: "2px 8px", borderRadius: 99,
                        background: `${sc}15`,
                        border: `1px solid ${sc}30`,
                        color: sc,
                      }}>
                        {STATUS_LABEL[app.status] ?? app.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Pipeline bars */}
          {applications.length > 0 && (
            <div style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 14, padding: 16,
            }}>
              <div style={{
                fontSize: "0.75rem", fontWeight: 700,
                color: "var(--text-secondary)", letterSpacing: "0.08em",
                textTransform: "uppercase", marginBottom: 12,
              }}>
                Pipeline
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {Object.entries(STATUS_LABEL).map(([key, label]) => {
                  const count = applications.filter((a) => a.status === key).length;
                  if (count === 0) return null;
                  const color = STATUS_COLOR[key] ?? "#8b5cf6";
                  const pct = Math.round((count / applications.length) * 100);
                  return (
                    <div key={key}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                        <span style={{ fontSize: "0.73rem", color: "var(--text-muted)" }}>{label}</span>
                        <span style={{ fontSize: "0.73rem", fontWeight: 700, color }}>{count}</span>
                      </div>
                      <div style={{ height: 5, borderRadius: 99, background: "rgba(255,255,255,0.06)" }}>
                        <div style={{
                          height: "100%", borderRadius: 99,
                          width: `${pct}%`, background: color,
                          transition: "width 0.6s ease",
                        }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Track modal ── */}
      {showApplyFor && applyJob && (
        <div
          onClick={() => setShowApplyFor(null)}
          style={{
            position: "fixed", inset: 0, zIndex: 9999,
            display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
            paddingLeft: "calc(232px + 16px)",
            background: "rgba(0,0,0,0.8)", backdropFilter: "blur(6px)",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%", maxWidth: 460,
              background: "rgb(14,14,22)",
              border: "1px solid rgba(139,92,246,0.25)",
              borderRadius: 16, padding: 24,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
              <h2 style={{ fontSize: "1.05rem", fontWeight: 800 }}>Track Application</h2>
              <button
                onClick={() => setShowApplyFor(null)}
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 8, padding: "5px 7px",
                  cursor: "pointer", color: "var(--text-muted)", display: "flex",
                }}
              >
                <X size={15} />
              </button>
            </div>
            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: 18 }}>
              {applyJob.title} · {applyJob.company}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <input className="input-field" value={applicationForm.fullName}
                onChange={(e) => setApplicationForm({ ...applicationForm, fullName: e.target.value })}
                placeholder="Full name *" />
              <input className="input-field" value={applicationForm.email}
                onChange={(e) => setApplicationForm({ ...applicationForm, email: e.target.value })}
                placeholder="Email address *" />
              <input className="input-field" value={applicationForm.phone}
                onChange={(e) => setApplicationForm({ ...applicationForm, phone: e.target.value })}
                placeholder="Phone (optional)" />
              <textarea className="input-field" rows={3} value={applicationForm.coverLetter}
                onChange={(e) => setApplicationForm({ ...applicationForm, coverLetter: e.target.value })}
                placeholder="Notes / cover letter (optional)" />
              <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                <button
                  className="btn-primary flex-1 justify-center"
                  onClick={() => void apply()}
                  disabled={applyLoading}
                >
                  {applyLoading ? "Saving..." : "Save Application"}
                </button>
                <button
                  onClick={() => setShowApplyFor(null)}
                  style={{
                    padding: "8px 16px", borderRadius: 8,
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "var(--text-secondary)",
                    fontSize: "0.82rem", cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}