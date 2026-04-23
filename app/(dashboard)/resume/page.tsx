"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Download, FileText, RefreshCw, Sparkles,
  Globe, GlobeLock, Link2, Copy, Check,
  LayoutGrid, BarChart2, Eye,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { ResumeDropzone } from "@/components/resume/ResumeDropzone";
import { ATSScoreReport } from "@/components/resume/ATSScoreReport";
import { SkillTagEditor } from "@/components/resume/SkillTagEditor";
import { ProjectCardEditor, type ProjectEntry } from "@/components/resume/ProjectCardEditor";
import { ResumeStrengthMeter } from "@/components/resume/ResumeStrengthMeter";
import { TemplatePreview, TEMPLATES } from "@/components/resume/TemplatePreview";

// ─── Types ──────────────────────────────────────────────────────────────────────
type Resume = {
  id: string;
  title: string;
  template: string;
  atsScore: number;
  grammarScore: number;
  keywordScore: number;
  isPublic: boolean;
  data: {
    name?: string;
    headline?: string;
    email?: string;
    phone?: string;
    linkedin?: string;
    LinkedIn?: string;
    summary?: string;
    skills?: string[];
    experienceHighlights?: string[];
    education?: string[];
    projects?: string[];
    projectCards?: { title: string; description: string }[];
    granularScores?: { content: number; sections: number; essentials: number; tailoring: number };
    checks?: { parseRate: boolean; quantifyingImpact: boolean; repetition: boolean; spellingGrammar: boolean };
  };
  analyses: Array<{
    summary: string;
    grammarFeedback: string[];
    keywordSuggestions: string[];
    skillSuggestions: string[];
    createdAt?: string;
  }>;
};

type PortfolioData = {
  skills: string[];
  projects: { id: string; title: string; description: string; status: string }[];
  hasActivity: boolean;
};

type ActiveTab = "editor" | "ats" | "preview";

// ─── Helpers ────────────────────────────────────────────────────────────────────
function projectsFromData(data: Resume["data"]): ProjectEntry[] {
  if (data.projectCards?.length) {
    return data.projectCards.map((p, i) => ({
      id: `saved-${i}`,
      title: p.title,
      description: p.description,
    }));
  }
  if (data.projects?.length) {
    return data.projects.map((p, i) => ({ id: `legacy-${i}`, title: p, description: "" }));
  }
  return [];
}

// ─── Section step badge ─────────────────────────────────────────────────────────
function StepBadge({ num, color }: { num: number; color: string }) {
  return (
    <div style={{
      width: 26, height: 26, borderRadius: 8, flexShrink: 0,
      display: "flex", alignItems: "center", justifyContent: "center",
      background: `${color}20`, border: `1px solid ${color}30`,
      color, fontWeight: 800, fontSize: "0.75rem", fontFamily: "Outfit,sans-serif",
    }}>
      {num}
    </div>
  );
}

// ─── Field label+input helper ───────────────────────────────────────────────────
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: "0.73rem", fontWeight: 700, color: "var(--text-muted)", marginBottom: 6, letterSpacing: "0.04em", textTransform: "uppercase" }}>
        {label}
      </label>
      {children}
    </div>
  );
}

const INPUT_STYLE: React.CSSProperties = {
  width: "100%",
  padding: "10px 14px",
  borderRadius: 10,
  border: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(255,255,255,0.04)",
  color: "var(--text-primary)",
  fontSize: "0.875rem",
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 0.15s",
};

const SECTION_CARD: React.CSSProperties = {
  background: "var(--bg-card)",
  border: "1px solid var(--border-subtle)",
  borderRadius: 16,
  padding: "22px 24px",
};

// ─── Component ───────────────────────────────────────────────────────────────────
export default function ResumePage() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null);
  const [statusMsg, setStatusMsg] = useState("Loading…");
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportingDocx, setExportingDocx] = useState(false);
  const [togglingPublic, setTogglingPublic] = useState(false);
  const [importedFromEduPath, setImportedFromEduPath] = useState(false);
  const [showImportBanner, setShowImportBanner] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>("editor");

  const [form, setForm] = useState({
    title: "My Resume",
    template: TEMPLATES[0] as string,
    name: "",
    headline: "",
    email: "",
    phone: "",
    linkedin: "",
    summary: "",
    experienceHighlights: "",
    education: "",
  });

  const [skills, setSkills] = useState<string[]>([]);
  const [projects, setProjects] = useState<ProjectEntry[]>([]);

  // ── Loaders ────────────────────────────────────────────────────────────────
  const loadResumes = useCallback(async () => {
    const res = await fetch("/api/resumes");
    if (!res.ok) {
      setStatusMsg("Sign in and connect PostgreSQL to use the resume builder.");
      return;
    }
    const data: Resume[] = await res.json() as Resume[];
    setResumes(data);
    setStatusMsg(data.length === 0 ? "No saved resumes yet. Start creating above." : "");
    return data;
  }, []);

  const loadPortfolio = useCallback(async () => {
    try {
      const res = await fetch("/api/resumes/portfolio");
      if (!res.ok) return;
      const data = await res.json() as PortfolioData;
      setPortfolio(data);
      if (data.hasActivity && !importedFromEduPath) setShowImportBanner(true);
    } catch { /* optional */ }
  }, [importedFromEduPath]);

  useEffect(() => {
    void (async () => {
      const data = await loadResumes();
      await loadPortfolio();
      if (data && data.length > 0) {
        const r = data[0];
        const d = r.data;
        setForm({
          title: r.title || "My Resume",
          template: r.template || TEMPLATES[0],
          name: d.name || "",
          headline: d.headline || "",
          email: d.email || "",
          phone: d.phone || "",
          linkedin: d.linkedin || d.LinkedIn || "",
          summary: d.summary || "",
          experienceHighlights: Array.isArray(d.experienceHighlights) ? d.experienceHighlights.join("\n") : "",
          education: Array.isArray(d.education) ? d.education.join("\n") : "",
        });
        setSkills(d.skills || []);
        setProjects(projectsFromData(d));
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Import from EduPath ────────────────────────────────────────────────────
  const importFromEduPath = () => {
    if (!portfolio) return;
    setSkills((prev) => [...new Set([...prev, ...portfolio.skills])]);
    setProjects((prev) => {
      const existingTitles = new Set(prev.map((p) => p.title.toLowerCase()));
      const newProjects = portfolio.projects
        .filter((p) => !existingTitles.has(p.title.toLowerCase()))
        .map((p) => ({ id: p.id, title: p.title, description: p.description, fromEduPath: true }));
      return [...prev, ...newProjects];
    });
    setImportedFromEduPath(true);
    setShowImportBanner(false);
    setStatusMsg("✓ Skills and projects imported from your EduPath portfolio!");
  };

  // ── Save & Analyze ─────────────────────────────────────────────────────────
  const saveResume = async () => {
    setSaving(true);
    setStatusMsg("");
    const res = await fetch("/api/resumes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.title,
        template: form.template,
        data: {
          name: form.name,
          headline: form.headline,
          email: form.email,
          phone: form.phone,
          linkedin: form.linkedin,
          summary: form.summary,
          skills,
          experienceHighlights: form.experienceHighlights.split("\n").map((s) => s.trim()).filter(Boolean),
          education: form.education.split("\n").map((s) => s.trim()).filter(Boolean),
          projects: projects.map((p) => `${p.title}: ${p.description}`),
          projectCards: projects.map((p) => ({ title: p.title, description: p.description })),
        },
      }),
    });

    let payload: Resume | { error?: string } | undefined;
    try { payload = await res.json() as Resume; } catch { /* ignore */ }

    setSaving(false);
    if (!res.ok) {
      setStatusMsg((payload as { error?: string })?.error ?? "Unable to save. Please sign in.");
      return;
    }
    setStatusMsg("✓ Resume saved and analyzed!");
    await loadResumes();
    setActiveTab("ats");
  };

  // ── Toggle Public ──────────────────────────────────────────────────────────
  const togglePublic = async () => {
    const latest = resumes[0];
    if (!latest) { setStatusMsg("Save your resume first before enabling the public link."); return; }
    setTogglingPublic(true);
    const res = await fetch(`/api/resumes/${latest.id}/visibility`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublic: !latest.isPublic }),
    });
    setTogglingPublic(false);
    if (res.ok) {
      await loadResumes();
      setStatusMsg(latest.isPublic ? "Public link disabled." : "✓ Public resume enabled!");
    }
  };

  // ── Copy share link ────────────────────────────────────────────────────────
  const copyShareLink = async () => {
    const latest = resumes[0];
    if (!latest?.isPublic) { setStatusMsg("Enable the Public Resume toggle first."); return; }
    try {
      const profileRes = await fetch("/api/profile");
      if (profileRes.ok) {
        const profileData = await profileRes.json() as { id?: string };
        if (profileData.id) {
          await navigator.clipboard.writeText(`${window.location.origin}/resume/${profileData.id}`);
          setLinkCopied(true);
          setTimeout(() => setLinkCopied(false), 2500);
          return;
        }
      }
    } catch { /* ignore */ }
    await navigator.clipboard.writeText(`${window.location.origin}/api/public/resume/[your-user-id]`);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2500);
  };

  // ── Export PDF ─────────────────────────────────────────────────────────────
  const exportPdf = async () => {
    setExporting(true); setStatusMsg("");
    try {
      const { default: jsPDF } = await import("jspdf");
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const W = 210; let y = 20;
      const expLines = form.experienceHighlights.split("\n").map((s) => s.trim()).filter(Boolean);
      const eduLines = form.education.split("\n").map((s) => s.trim()).filter(Boolean);
      pdf.setFillColor(67, 56, 231);
      pdf.rect(0, 0, W, 38, "F");
      pdf.setTextColor(255, 255, 255);
      pdf.setFont("helvetica", "bold"); pdf.setFontSize(22);
      pdf.text(form.name || "Your Name", 14, 16);
      pdf.setFontSize(11); pdf.setFont("helvetica", "normal");
      pdf.text(form.headline || "Professional Headline", 14, 26);
      pdf.setTextColor(200, 200, 255); pdf.setFontSize(8.5);
      const contact = [form.email, form.phone, form.linkedin].filter(Boolean).join("  •  ") || "contact@example.com";
      pdf.text(contact, 14, 34);
      y = 50;
      const sectionHeader = (title: string) => {
        pdf.setFont("helvetica", "bold"); pdf.setFontSize(9); pdf.setTextColor(67, 56, 231);
        pdf.text(title.toUpperCase(), 14, y); y += 1;
        pdf.setDrawColor(67, 56, 231); pdf.line(14, y, W - 14, y); y += 5;
        pdf.setTextColor(40, 40, 40);
      };
      if (form.summary) {
        sectionHeader("Professional Summary"); pdf.setFont("helvetica", "normal"); pdf.setFontSize(9.5); pdf.setTextColor(60, 60, 60);
        const lines = pdf.splitTextToSize(form.summary, W - 28) as string[];
        pdf.text(lines, 14, y); y += lines.length * 5 + 6;
      }
      if (skills.length > 0) {
        sectionHeader("Core Skills"); pdf.setFont("helvetica", "normal"); pdf.setFontSize(9.5);
        let col = 0; const colW = (W - 28) / 2;
        skills.forEach((skill) => {
          const xPos = 14 + col * (colW + 6);
          pdf.setTextColor(67, 120, 180); pdf.text("✦", xPos, y);
          pdf.setTextColor(50, 50, 50); pdf.text(skill, xPos + 5, y);
          col = col === 0 ? 1 : 0; if (col === 0) y += 5.5;
        }); if (col !== 0) y += 5.5; y += 4;
      }
      if (expLines.length > 0) {
        sectionHeader("Experience"); pdf.setFont("helvetica", "normal"); pdf.setFontSize(9.5);
        expLines.forEach((b) => { const lines = pdf.splitTextToSize(`• ${b}`, W - 28) as string[]; pdf.setTextColor(50, 50, 50); pdf.text(lines, 14, y); y += lines.length * 5.2 + 1.5; }); y += 3;
      }
      if (projects.length > 0) {
        sectionHeader("Projects"); pdf.setFont("helvetica", "normal"); pdf.setFontSize(9.5);
        projects.forEach((p) => {
          pdf.setFont("helvetica", "bold"); pdf.setFontSize(9.5); pdf.setTextColor(40, 40, 40); pdf.text(p.title, 14, y); y += 5;
          if (p.description) { pdf.setFont("helvetica", "normal"); pdf.setFontSize(9); const dLines = pdf.splitTextToSize(p.description, W - 28) as string[]; pdf.setTextColor(70, 70, 70); pdf.text(dLines, 14, y); y += dLines.length * 4.8 + 2; }
        }); y += 2;
      }
      if (eduLines.length > 0) {
        sectionHeader("Education"); pdf.setFont("helvetica", "normal"); pdf.setFontSize(9.5);
        eduLines.forEach((b) => { const lines = pdf.splitTextToSize(`• ${b}`, W - 28) as string[]; pdf.setTextColor(50, 50, 50); pdf.text(lines, 14, y); y += lines.length * 5.2 + 1.5; });
      }
      pdf.setFontSize(7.5); pdf.setTextColor(160, 160, 160);
      pdf.text(`Generated by EduPath AI  •  ${new Date().toLocaleDateString()}`, W / 2, 288, { align: "center" });
      pdf.save(`${form.title.replace(/\s+/g, "-").toLowerCase()}.pdf`);
      setStatusMsg("✓ PDF exported!");
    } catch (err) {
      setStatusMsg("PDF export failed: " + (err instanceof Error ? err.message : "unknown error"));
    } finally { setExporting(false); }
  };

  // ── Export DOCX ────────────────────────────────────────────────────────────
  const exportDocx = async () => {
    setExportingDocx(true); setStatusMsg("");
    try {
      const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle } = await import("docx");
      const expLines = form.experienceHighlights.split("\n").map((s) => s.trim()).filter(Boolean);
      const eduLines = form.education.split("\n").map((s) => s.trim()).filter(Boolean);
      const heading = (text: string) => new Paragraph({ text, heading: HeadingLevel.HEADING_2, spacing: { before: 240, after: 80 }, border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "6366f1" } } });
      const bullet = (text: string) => new Paragraph({ children: [new TextRun({ text: `• ${text}`, size: 20 })], spacing: { after: 60 } });
      const doc = new Document({
        sections: [{ children: [
          new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: form.name || "Your Name", bold: true, size: 36, color: "1e1b4b" })] }),
          new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: form.headline || "", size: 22, color: "6366f1" })] }),
          new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: [form.email, form.phone, form.linkedin].filter(Boolean).join("  •  "), size: 18, color: "6b7280" })], spacing: { after: 240 } }),
          ...(form.summary ? [heading("Professional Summary"), new Paragraph({ children: [new TextRun({ text: form.summary, size: 20 })], spacing: { after: 160 } })] : []),
          ...(skills.length > 0 ? [heading("Skills"), new Paragraph({ children: [new TextRun({ text: skills.join(" • "), size: 20 })], spacing: { after: 160 } })] : []),
          ...(expLines.length > 0 ? [heading("Experience"), ...expLines.map(bullet)] : []),
          ...(projects.length > 0 ? [heading("Projects"), ...projects.flatMap((p) => [
            new Paragraph({ children: [new TextRun({ text: p.title, bold: true, size: 20 })], spacing: { after: 40 } }),
            new Paragraph({ children: [new TextRun({ text: p.description, size: 19, color: "374151" })], spacing: { after: 120 } }),
          ])] : []),
          ...(eduLines.length > 0 ? [heading("Education"), ...eduLines.map(bullet)] : []),
        ]}],
      });
      const blob = await Packer.toBlob(doc);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url;
      a.download = `${form.title.replace(/\s+/g, "-").toLowerCase()}.docx`;
      a.click(); URL.revokeObjectURL(url);
      setStatusMsg("✓ DOCX exported!");
    } catch (err) {
      setStatusMsg("DOCX export failed: " + (err instanceof Error ? err.message : "unknown error"));
    } finally { setExportingDocx(false); }
  };

  // ── Derived ────────────────────────────────────────────────────────────────
  const latestResume = resumes[0];
  const latestAnalysis = latestResume?.analyses?.[0];
  const isPublic = latestResume?.isPublic ?? false;

  const TABS: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { id: "editor", label: "Editor", icon: <LayoutGrid size={14} /> },
    { id: "ats", label: "ATS Report", icon: <BarChart2 size={14} /> },
    { id: "preview", label: "Preview", icon: <Eye size={14} /> },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }} className="fade-in-up">

      {/* ═══════════════════════════════════════════════════════════
          PREMIUM HEADER
      ═══════════════════════════════════════════════════════════ */}
      <div style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border-subtle)",
        borderRadius: 18,
        padding: "16px 24px",
        display: "flex",
        alignItems: "center",
        gap: 24,
        flexWrap: "wrap",
      }}>
        {/* Left: title */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, flex: "0 0 auto" }}>
          <div style={{ width: 38, height: 38, borderRadius: 11, background: "linear-gradient(135deg,#8b5cf6,#6366f1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <FileText size={18} color="white" />
          </div>
          <div>
            <div style={{ fontFamily: "Outfit,sans-serif", fontWeight: 800, fontSize: "1.05rem" }}>AI Resume Builder</div>
            <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>AI-powered · ATS optimized · 5 templates</div>
          </div>
        </div>

        {/* Center: tab bar */}
        <div style={{ display: "flex", gap: 4, flex: 1, justifyContent: "center" }}>
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "8px 18px", borderRadius: 10, border: "none",
                background: activeTab === tab.id ? "rgba(139,92,246,0.15)" : "transparent",
                color: activeTab === tab.id ? "#c4b5fd" : "var(--text-muted)",
                fontWeight: activeTab === tab.id ? 700 : 500,
                fontSize: "0.84rem", cursor: "pointer",
                borderBottom: activeTab === tab.id ? "2px solid #8b5cf6" : "2px solid transparent",
                transition: "all 0.15s",
              }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Right: action buttons */}
        <div style={{ display: "flex", gap: 8, alignItems: "center", flex: "0 0 auto" }}>
          <button
            onClick={() => void exportDocx()}
            disabled={exportingDocx}
            style={{
              display: "flex", alignItems: "center", gap: 6, padding: "8px 16px",
              borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)",
              background: "transparent", color: "var(--text-secondary)",
              fontSize: "0.82rem", fontWeight: 600, cursor: "pointer",
            }}
          >
            {exportingDocx ? <RefreshCw size={13} className="animate-spin" /> : <Download size={13} />}
            DOCX
          </button>
          <button
            onClick={() => void exportPdf()}
            disabled={exporting}
            style={{
              display: "flex", alignItems: "center", gap: 6, padding: "8px 16px",
              borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)",
              background: "transparent", color: "var(--text-secondary)",
              fontSize: "0.82rem", fontWeight: 600, cursor: "pointer",
            }}
          >
            {exporting ? <RefreshCw size={13} className="animate-spin" /> : <Download size={13} />}
            PDF
          </button>
          <button
            onClick={() => void saveResume()}
            disabled={saving}
            style={{
              display: "flex", alignItems: "center", gap: 7,
              padding: "9px 20px", borderRadius: 10, border: "none",
              background: "linear-gradient(135deg,#8b5cf6,#6366f1)",
              color: "#fff", fontWeight: 700, fontSize: "0.84rem",
              cursor: "pointer", boxShadow: "0 4px 16px rgba(139,92,246,0.3)",
            }}
          >
            {saving ? <RefreshCw size={14} className="animate-spin" /> : <Sparkles size={14} />}
            {saving ? "Analyzing…" : "Save & Analyze"}
          </button>
        </div>
      </div>

      {/* Status message */}
      {statusMsg && (
        <div style={{ fontSize: "0.82rem", color: statusMsg.startsWith("✓") ? "#10b981" : "var(--text-muted)", paddingLeft: 4 }}>
          {statusMsg}
        </div>
      )}

      {/* ── EduPath Import Banner ────────────────────────────────────────────── */}
      <AnimatePresence>
        {showImportBanner && portfolio && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              gap: 16, padding: "14px 22px", borderRadius: 14,
              background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.25)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Sparkles size={18} style={{ color: "#c4b5fd", flexShrink: 0 }} />
              <div>
                <div style={{ fontWeight: 700, fontSize: "0.875rem" }}>EduPath activity detected!</div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                  {portfolio.skills.length} skills · {portfolio.projects.length} projects ready to import
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={importFromEduPath} style={{ padding: "7px 14px", borderRadius: 8, border: "none", background: "linear-gradient(135deg,#8b5cf6,#6366f1)", color: "#fff", fontWeight: 700, fontSize: "0.78rem", cursor: "pointer" }}>
                Import from EduPath
              </button>
              <button onClick={() => setShowImportBanner(false)} style={{ padding: "7px 12px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "var(--text-muted)", fontSize: "0.78rem", cursor: "pointer" }}>
                Dismiss
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════════════════════
          TAB CONTENT
      ═══════════════════════════════════════════════════════════ */}
      <AnimatePresence mode="wait">
        {activeTab === "editor" && (
          <motion.div key="editor" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>

            {/* ── Upload zone (compact) ─────────────────────────── */}
            <div style={{ marginBottom: 20 }}>
              <ResumeDropzone
                setStatus={setStatusMsg}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                onComplete={async (parsedResume: any) => {
                  await loadResumes();
                  if (parsedResume?.data) {
                    const d = parsedResume.data as Resume["data"];
                    const g = (k: string) =>
                      (d as Record<string, unknown>)[k] ??
                      (d as Record<string, unknown>)[k.charAt(0).toUpperCase() + k.slice(1)];
                    setForm((prev) => ({
                      ...prev,
                      name: (g("name") as string) || prev.name,
                      headline: (g("headline") as string) || prev.headline,
                      email: (g("email") as string) || prev.email,
                      phone: (g("phone") as string) || prev.phone,
                      linkedin: (g("linkedin") as string) || d.LinkedIn || prev.linkedin,
                      summary: (g("summary") as string) || prev.summary,
                      experienceHighlights: Array.isArray(g("experienceHighlights"))
                        ? (g("experienceHighlights") as string[]).join("\n")
                        : prev.experienceHighlights,
                      education: Array.isArray(g("education"))
                        ? (g("education") as string[]).join("\n")
                        : prev.education,
                    }));
                    if (Array.isArray(d.skills)) setSkills(d.skills);
                    setProjects(projectsFromData(d));
                    setActiveTab("ats");
                  }
                }}
              />
            </div>

            {/* ── Two-column editor: form + live preview ─── */}
            <div style={{ display: "grid", gridTemplateColumns: "55fr 45fr", gap: 20, alignItems: "start" }}>

              {/* LEFT: Form sections */}
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

                {/* Step 1: Personal Info */}
                <div style={SECTION_CARD}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, paddingBottom: 14, borderBottom: "1px solid var(--border-subtle)" }}>
                    <StepBadge num={1} color="#8b5cf6" />
                    <span style={{ fontWeight: 700, fontSize: "0.95rem" }}>Personal Info</span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                    <Field label="Resume Title">
                      <input style={INPUT_STYLE} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                    </Field>
                    <Field label="Template">
                      <select style={INPUT_STYLE} value={form.template} onChange={(e) => setForm({ ...form, template: e.target.value })}>
                        {TEMPLATES.map((t) => <option key={t}>{t}</option>)}
                      </select>
                    </Field>
                    <Field label="Full Name">
                      <input style={INPUT_STYLE} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Satyam Singh Rajput" />
                    </Field>
                    <Field label="Professional Headline">
                      <input style={INPUT_STYLE} value={form.headline} onChange={(e) => setForm({ ...form, headline: e.target.value })} placeholder="Full-Stack Developer" />
                    </Field>
                    <Field label="Email">
                      <input style={INPUT_STYLE} type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@email.com" />
                    </Field>
                    <Field label="Phone">
                      <input style={INPUT_STYLE} type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91 00000 00000" />
                    </Field>
                    <div style={{ gridColumn: "1/-1" }}>
                      <Field label="LinkedIn / Portfolio URL">
                        <input style={INPUT_STYLE} value={form.linkedin} onChange={(e) => setForm({ ...form, linkedin: e.target.value })} placeholder="https://linkedin.com/in/username" />
                      </Field>
                    </div>
                    <div style={{ gridColumn: "1/-1" }}>
                      <Field label="Professional Summary">
                        <textarea style={{ ...INPUT_STYLE, minHeight: 90, resize: "vertical" }} rows={4} value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} placeholder="Brief overview of your professional background and goals…" />
                      </Field>
                    </div>
                  </div>
                </div>

                {/* Step 2: Skills */}
                <div style={SECTION_CARD}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, paddingBottom: 14, borderBottom: "1px solid var(--border-subtle)" }}>
                    <StepBadge num={2} color="#10b981" />
                    <span style={{ fontWeight: 700, fontSize: "0.95rem" }}>Skills</span>
                    {portfolio && !importedFromEduPath && (
                      <button onClick={importFromEduPath} style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 6, border: "1px solid rgba(139,92,246,0.3)", background: "rgba(139,92,246,0.08)", color: "#c4b5fd", fontSize: "0.72rem", fontWeight: 700, cursor: "pointer" }}>
                        <Sparkles size={11} /> Import from EduPath
                      </button>
                    )}
                  </div>
                  <SkillTagEditor skills={skills} onChange={setSkills} />
                </div>

                {/* Step 3: Projects */}
                <div style={SECTION_CARD}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, paddingBottom: 14, borderBottom: "1px solid var(--border-subtle)" }}>
                    <StepBadge num={3} color="#f59e0b" />
                    <span style={{ fontWeight: 700, fontSize: "0.95rem" }}>Projects</span>
                  </div>
                  <ProjectCardEditor projects={projects} onChange={setProjects} />
                </div>

                {/* Step 4: Experience & Education */}
                <div style={SECTION_CARD}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18, paddingBottom: 14, borderBottom: "1px solid var(--border-subtle)" }}>
                    <StepBadge num={4} color="#06b6d4" />
                    <span style={{ fontWeight: 700, fontSize: "0.95rem" }}>Experience &amp; Education</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    <Field label="Experience Highlights (one per line)">
                      <textarea style={{ ...INPUT_STYLE, minHeight: 90, resize: "vertical" }} rows={4} value={form.experienceHighlights}
                        onChange={(e) => setForm({ ...form, experienceHighlights: e.target.value })}
                        placeholder="Led team of 5 to build X, reducing load time by 40%&#10;Implemented CI/CD pipeline that cut deployment time by 60%" />
                    </Field>
                    <Field label="Education (one per line)">
                      <textarea style={{ ...INPUT_STYLE, minHeight: 70, resize: "vertical" }} rows={3} value={form.education}
                        onChange={(e) => setForm({ ...form, education: e.target.value })}
                        placeholder="B.Tech Computer Science, XYZ University — 2024" />
                    </Field>
                  </div>
                </div>

                {/* Step 5: Public Toggle */}
                <div style={SECTION_CARD}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18, paddingBottom: 14, borderBottom: "1px solid var(--border-subtle)" }}>
                    <StepBadge num={5} color="#f43f5e" />
                    <span style={{ fontWeight: 700, fontSize: "0.95rem" }}>Public Resume</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      {isPublic ? <Globe size={18} style={{ color: "#10b981" }} /> : <GlobeLock size={18} style={{ color: "var(--text-muted)" }} />}
                      <div>
                        <div style={{ fontWeight: 600, fontSize: "0.875rem" }}>{isPublic ? "Public" : "Private"}</div>
                        <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{isPublic ? "Anyone with the link can view." : "Enable to share with employers."}</div>
                      </div>
                    </div>
                    <button
                      type="button" onClick={() => void togglePublic()}
                      disabled={togglingPublic || !latestResume}
                      title={latestResume ? undefined : "Save your resume first"}
                      style={{ position: "relative", display: "inline-flex", height: 24, width: 44, alignItems: "center", borderRadius: 99, border: "none", cursor: "pointer", background: isPublic ? "#8b5cf6" : "rgba(255,255,255,0.1)", transition: "background 0.2s", flexShrink: 0, opacity: (!latestResume || togglingPublic) ? 0.5 : 1 }}
                    >
                      <span style={{ display: "inline-block", height: 18, width: 18, borderRadius: "50%", background: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,0.3)", transform: isPublic ? "translateX(22px)" : "translateX(3px)", transition: "transform 0.2s" }} />
                    </button>
                  </div>
                  {isPublic && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                      style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderRadius: 10, background: "rgba(255,255,255,0.03)", border: "1px solid var(--border-subtle)" }}>
                      <Link2 size={13} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
                      <span style={{ fontSize: "0.78rem", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "var(--text-secondary)" }}>
                        {typeof window !== "undefined" ? window.location.origin : ""}/resume/…
                      </span>
                      <button onClick={() => void copyShareLink()} style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 10px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "var(--text-muted)", fontSize: "0.73rem", cursor: "pointer", flexShrink: 0 }}>
                        {linkCopied ? <Check size={11} /> : <Copy size={11} />}
                        {linkCopied ? "Copied!" : "Copy"}
                      </button>
                    </motion.div>
                  )}
                </div>

                {/* Resume Strength Meter */}
                <ResumeStrengthMeter
                  skills={skills} projects={projects} experience={form.experienceHighlights}
                  education={form.education} atsScore={latestResume?.atsScore ?? 0}
                  name={form.name} email={form.email} phone={form.phone}
                  linkedin={form.linkedin} summary={form.summary}
                />
              </div>

              {/* RIGHT: Live Preview (sticky) */}
              <div style={{ position: "sticky", top: 20 }}>
                {/* Preview header */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981" }} className="animate-pulse" />
                    <span style={{ fontWeight: 700, fontSize: "0.875rem" }}>Live Preview</span>
                  </div>
                  <span style={{ fontSize: "0.68rem", fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", padding: "3px 8px", borderRadius: 6, background: "rgba(255,255,255,0.06)", color: "var(--text-muted)" }}>
                    A4 Document
                  </span>
                </div>
                {/* Preview frame */}
                <div style={{ borderRadius: 20, overflow: "hidden", border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.03)", padding: "16px" }}>
                  <div style={{ width: "100%", display: "flex", justifyContent: "center", overflowX: "auto" }}>
                    <style>{`
                      @media (max-width: 1024px) { .canvas-scaler { transform: scale(min(1, calc((100vw - 4rem) / 800))) !important; } }
                      @media (min-width: 1024px) { .canvas-scaler { transform: scale(min(1, calc((45vw - 6rem) / 800))) !important; } }
                    `}</style>
                    <TemplatePreview
                      template={form.template}
                      form={{ name: form.name, headline: form.headline, email: form.email, phone: form.phone, linkedin: form.linkedin, summary: form.summary, experienceHighlights: form.experienceHighlights, education: form.education }}
                      skills={skills} projects={projects}
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "ats" && (
          <motion.div key="ats" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            {latestResume ? (
              <ATSScoreReport
                title={latestResume.title}
                atsScore={latestResume.atsScore}
                grammarScore={latestResume.grammarScore}
                keywordScore={latestResume.keywordScore}
                analysis={
                  latestAnalysis
                    ? { ...latestAnalysis, granularScores: latestResume.data?.granularScores, checks: latestResume.data?.checks }
                    : null
                }
              />
            ) : (
              <div style={{ ...SECTION_CARD, textAlign: "center", padding: "64px 32px" }}>
                <BarChart2 size={40} style={{ color: "var(--text-muted)", opacity: 0.3, margin: "0 auto 16px", display: "block" }} />
                <div style={{ fontWeight: 700, fontSize: "1rem", marginBottom: 8 }}>No ATS data yet</div>
                <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", marginBottom: 24 }}>
                  Fill in your resume and click <strong>Save & Analyze</strong> to get your ATS score.
                </p>
                <button onClick={() => setActiveTab("editor")} style={{ padding: "10px 22px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#8b5cf6,#6366f1)", color: "#fff", fontWeight: 700, cursor: "pointer" }}>
                  Go to Editor
                </button>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === "preview" && (
          <motion.div key="preview" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            <div style={{ ...SECTION_CARD, padding: "28px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981" }} className="animate-pulse" />
                  <span style={{ fontWeight: 700, fontSize: "0.97rem" }}>Full Preview</span>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => void exportPdf()} disabled={exporting} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#8b5cf6,#6366f1)", color: "#fff", fontWeight: 700, fontSize: "0.82rem", cursor: "pointer" }}>
                    {exporting ? <RefreshCw size={13} className="animate-spin" /> : <Download size={13} />} Export PDF
                  </button>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "center", background: "rgba(255,255,255,0.02)", borderRadius: 16, padding: "24px", border: "1px solid rgba(255,255,255,0.05)" }}>
                <style>{`
                  .canvas-scaler-full { transform: scale(min(1, calc((100vw - 18rem) / 800))); transform-origin: top center; }
                `}</style>
                <TemplatePreview
                  template={form.template}
                  form={{ name: form.name, headline: form.headline, email: form.email, phone: form.phone, linkedin: form.linkedin, summary: form.summary, experienceHighlights: form.experienceHighlights, education: form.education }}
                  skills={skills} projects={projects}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
