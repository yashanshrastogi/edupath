"use client";

import type { ProjectEntry } from "./ProjectCardEditor";

export interface TemplateFormData {
  name: string;
  headline: string;
  email: string;
  phone: string;
  linkedin: string;
  summary: string;
  experienceHighlights: string;
  education: string;
}

interface Props {
  template: string;
  form: TemplateFormData;
  skills: string[];
  projects: ProjectEntry[];
}

// ─── Shared helpers ────────────────────────────────────────────────────────────
const ph = (val: string, fallback: string) => val || fallback;
const contactLine = (f: TemplateFormData) =>
  [f.email, f.phone, f.linkedin].filter(Boolean).join("  •  ") || "yourname@email.com  •  github.com/you";
const splitLines = (s: string) => s.split("\n").map((l) => l.trim()).filter(Boolean);

// ─── 1. Minimal ATS ────────────────────────────────────────────────────────────
function MinimalATS({ form, skills, projects }: Omit<Props, "template">) {
  const exp = splitLines(form.experienceHighlights);
  const edu = splitLines(form.education);
  return (
    <div className="font-sans text-slate-800 h-full flex flex-col" style={{ fontFamily: "Arial, sans-serif" }}>
      <header className="mb-5 pb-4 border-b-2 border-slate-800">
        <h1 className="text-3xl font-bold text-slate-900 uppercase tracking-tight">
          {ph(form.name, "Your Name")}
        </h1>
        <p className="text-sm text-slate-600 mt-0.5">{ph(form.headline, "Professional Title")}</p>
        <p className="text-[11px] text-slate-500 mt-1">{contactLine(form)}</p>
      </header>

      {form.summary && (
        <section className="mb-4">
          <h2 className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">Summary</h2>
          <p className="text-xs text-slate-700 leading-relaxed">{form.summary}</p>
        </section>
      )}

      {skills.length > 0 && (
        <section className="mb-4">
          <h2 className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">Skills</h2>
          <p className="text-xs text-slate-700">{skills.join(" • ")}</p>
        </section>
      )}

      {exp.length > 0 && (
        <section className="mb-4">
          <h2 className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">Experience</h2>
          <ul className="space-y-1">
            {exp.map((e, i) => (
              <li key={i} className="text-xs text-slate-700 flex gap-2">
                <span className="shrink-0">–</span>
                <span>{e}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {projects.length > 0 && (
        <section className="mb-4">
          <h2 className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">Projects</h2>
          {projects.map((p) => (
            <div key={p.id} className="mb-2">
              <p className="text-xs font-bold text-slate-800">{p.title}</p>
              <p className="text-xs text-slate-600">{p.description}</p>
            </div>
          ))}
        </section>
      )}

      {edu.length > 0 && (
        <section>
          <h2 className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">Education</h2>
          <ul className="space-y-1">
            {edu.map((e, i) => (
              <li key={i} className="text-xs text-slate-700">{e}</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

// ─── 2. Modern Professional ────────────────────────────────────────────────────
function ModernProfessional({ form, skills, projects }: Omit<Props, "template">) {
  const exp = splitLines(form.experienceHighlights);
  const edu = splitLines(form.education);
  return (
    <div className="flex flex-col h-full text-slate-800">
      <header className="border-b-[3px] border-indigo-600 pb-6 mb-6">
        <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter leading-none mb-2">
          {ph(form.name, "Your Name")}
        </h1>
        <p className="text-base text-indigo-600 font-bold tracking-wide uppercase">{ph(form.headline, "Professional Title")}</p>
        <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          {contactLine(form).split("  •  ").map((c, i) => <span key={i}>{c}</span>)}
        </div>
      </header>

      {form.summary && (
        <section className="mb-5">
          <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500 mb-2">Professional Profile</h2>
          <p className="text-[11px] text-slate-600 leading-relaxed">{form.summary}</p>
        </section>
      )}

      <div className="grid grid-cols-2 gap-5 mb-5">
        {skills.length > 0 && (
          <section>
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500 mb-2">Core Skills</h2>
            <div className="flex flex-wrap gap-1.5">
              {skills.map((s) => (
                <span key={s} className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[9px] rounded font-bold uppercase border border-indigo-100">
                  {s}
                </span>
              ))}
            </div>
          </section>
        )}
        {edu.length > 0 && (
          <section>
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500 mb-2">Education</h2>
            {edu.map((e, i) => <p key={i} className="text-[11px] font-bold text-slate-700">{e}</p>)}
          </section>
        )}
      </div>

      {exp.length > 0 && (
        <section className="mb-5">
          <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500 mb-2">Experience</h2>
          <ul className="space-y-2">
            {exp.map((e, i) => (
              <li key={i} className="flex gap-3 text-[11px] text-slate-600">
                <div className="w-1 h-1 rounded-full bg-indigo-300 mt-1.5 shrink-0" />
                <span>{e}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {projects.length > 0 && (
        <section>
          <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500 mb-2">Key Projects</h2>
          {projects.map((p) => (
            <div key={p.id} className="mb-2">
              <span className="text-[10px] font-black text-slate-700 uppercase tracking-tight">{p.title}</span>
              <span className="text-[10px] text-slate-500 ml-2">— {p.description}</span>
            </div>
          ))}
        </section>
      )}

      <footer className="mt-auto pt-4 border-t border-slate-100 flex justify-between text-[8px] font-bold text-slate-300 uppercase tracking-widest">
        <span>EduPath AI Resume</span><span>{new Date().getFullYear()}</span>
      </footer>
    </div>
  );
}

// ─── 3. Software Engineer ──────────────────────────────────────────────────────
function SoftwareEngineer({ form, skills, projects }: Omit<Props, "template">) {
  const exp = splitLines(form.experienceHighlights);
  const edu = splitLines(form.education);
  return (
    <div className="flex h-full" style={{ fontFamily: "'Courier New', monospace" }}>
      {/* Sidebar */}
      <div className="w-52 shrink-0 bg-slate-900 text-white p-5 flex flex-col space-y-5">
        <div>
          <h1 className="text-lg font-bold leading-tight">{ph(form.name, "Your Name")}</h1>
          <p className="text-[9px] text-cyan-400 mt-1 uppercase tracking-widest">{ph(form.headline, "Software Engineer")}</p>
        </div>

        {form.email && (
          <div>
            <p className="text-[8px] text-slate-400 uppercase tracking-widest mb-1">Contact</p>
            <p className="text-[9px] text-slate-300 break-all">{form.email}</p>
            {form.phone && <p className="text-[9px] text-slate-300">{form.phone}</p>}
            {form.linkedin && <p className="text-[9px] text-cyan-400 break-all">{form.linkedin}</p>}
          </div>
        )}

        {skills.length > 0 && (
          <div>
            <p className="text-[8px] text-slate-400 uppercase tracking-widest mb-2">Tech Stack</p>
            <div className="flex flex-wrap gap-1">
              {skills.map((s) => (
                <span key={s} className="px-1.5 py-0.5 bg-cyan-500/20 text-cyan-300 text-[8px] rounded font-bold">{s}</span>
              ))}
            </div>
          </div>
        )}

        {edu.length > 0 && (
          <div>
            <p className="text-[8px] text-slate-400 uppercase tracking-widest mb-1">Education</p>
            {edu.map((e, i) => <p key={i} className="text-[9px] text-slate-300">{e}</p>)}
          </div>
        )}
      </div>

      {/* Main content */}
      <div className="flex-1 p-5 space-y-4 overflow-hidden">
        {form.summary && (
          <section>
            <h2 className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500 border-b border-slate-200 pb-1 mb-2">// About</h2>
            <p className="text-[10px] text-slate-600 leading-relaxed">{form.summary}</p>
          </section>
        )}

        {exp.length > 0 && (
          <section>
            <h2 className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500 border-b border-slate-200 pb-1 mb-2">// Experience</h2>
            <ul className="space-y-1.5">
              {exp.map((e, i) => (
                <li key={i} className="flex gap-2 text-[10px] text-slate-700">
                  <span className="text-cyan-500 shrink-0">›</span>{e}
                </li>
              ))}
            </ul>
          </section>
        )}

        {projects.length > 0 && (
          <section>
            <h2 className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500 border-b border-slate-200 pb-1 mb-2">// Projects</h2>
            {projects.map((p) => (
              <div key={p.id} className="mb-2">
                <p className="text-[10px] font-bold text-slate-800">{p.title}</p>
                <p className="text-[9px] text-slate-500">{p.description}</p>
              </div>
            ))}
          </section>
        )}
      </div>
    </div>
  );
}

// ─── 4. AI Engineer ────────────────────────────────────────────────────────────
function AIEngineer({ form, skills, projects }: Omit<Props, "template">) {
  const exp = splitLines(form.experienceHighlights);
  const edu = splitLines(form.education);
  return (
    <div className="flex flex-col h-full text-slate-800" style={{ fontFamily: "system-ui, sans-serif" }}>
      {/* Gradient header */}
      <header className="p-6 mb-5 rounded-2xl text-white" style={{ background: "linear-gradient(135deg, #7c3aed, #2563eb)" }}>
        <h1 className="text-3xl font-black tracking-tight">{ph(form.name, "Your Name")}</h1>
        <p className="text-sm text-violet-200 font-medium mt-1">{ph(form.headline, "AI / ML Engineer")}</p>
        <p className="text-[10px] text-violet-300 mt-2">{contactLine(form)}</p>
      </header>

      {form.summary && (
        <section className="mb-4 p-4 rounded-xl" style={{ background: "rgba(124,58,237,0.05)", border: "1px solid rgba(124,58,237,0.12)" }}>
          <h2 className="text-[9px] font-black uppercase tracking-[0.2em] text-violet-600 mb-2">Profile</h2>
          <p className="text-[10px] text-slate-600 leading-relaxed">{form.summary}</p>
        </section>
      )}

      {skills.length > 0 && (
        <section className="mb-4">
          <h2 className="text-[9px] font-black uppercase tracking-[0.2em] text-violet-600 mb-2">AI / ML Stack</h2>
          <div className="flex flex-wrap gap-1.5">
            {skills.map((s) => (
              <span key={s} className="px-2 py-0.5 rounded-lg text-[9px] font-bold" style={{ background: "rgba(124,58,237,0.1)", color: "#7c3aed" }}>
                {s}
              </span>
            ))}
          </div>
        </section>
      )}

      {exp.length > 0 && (
        <section className="mb-4">
          <h2 className="text-[9px] font-black uppercase tracking-[0.2em] text-violet-600 mb-2">Experience</h2>
          <ul className="space-y-1.5">
            {exp.map((e, i) => (
              <li key={i} className="flex gap-2 text-[10px] text-slate-700">
                <span className="w-1 h-1 rounded-full bg-violet-400 mt-1.5 shrink-0" />
                {e}
              </li>
            ))}
          </ul>
        </section>
      )}

      {projects.length > 0 && (
        <section className="mb-4">
          <h2 className="text-[9px] font-black uppercase tracking-[0.2em] text-violet-600 mb-2">Research & Projects</h2>
          {projects.map((p) => (
            <div key={p.id} className="mb-2 p-2.5 rounded-lg" style={{ background: "rgba(37,99,235,0.04)", border: "1px solid rgba(37,99,235,0.1)" }}>
              <p className="text-[10px] font-bold text-slate-800">{p.title}</p>
              <p className="text-[9px] text-slate-500 mt-0.5">{p.description}</p>
            </div>
          ))}
        </section>
      )}

      {edu.length > 0 && (
        <section>
          <h2 className="text-[9px] font-black uppercase tracking-[0.2em] text-violet-600 mb-1">Education</h2>
          {edu.map((e, i) => <p key={i} className="text-[10px] text-slate-700">{e}</p>)}
        </section>
      )}
    </div>
  );
}

// ─── 5. Academic ───────────────────────────────────────────────────────────────
function Academic({ form, skills, projects }: Omit<Props, "template">) {
  const exp = splitLines(form.experienceHighlights);
  const edu = splitLines(form.education);
  return (
    <div className="flex flex-col h-full text-slate-800" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
      <header className="text-center mb-6 pb-4 border-b-2 border-slate-800">
        <h1 className="text-3xl font-bold text-slate-900">{ph(form.name, "Your Name")}</h1>
        <p className="text-sm text-slate-600 mt-1 italic">{ph(form.headline, "Researcher / Academic Professional")}</p>
        <p className="text-[10px] text-slate-500 mt-1.5">{contactLine(form)}</p>
      </header>

      {form.summary && (
        <section className="mb-4">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-700 mb-2 text-center">Research Interests</h2>
          <p className="text-[11px] text-slate-600 leading-relaxed text-justify">{form.summary}</p>
        </section>
      )}

      {edu.length > 0 && (
        <section className="mb-4">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-700 border-b border-slate-300 pb-1 mb-2">Education</h2>
          {edu.map((e, i) => <p key={i} className="text-[11px] text-slate-700 mb-1">{e}</p>)}
        </section>
      )}

      {exp.length > 0 && (
        <section className="mb-4">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-700 border-b border-slate-300 pb-1 mb-2">Experience</h2>
          <ul className="space-y-1.5">
            {exp.map((e, i) => (
              <li key={i} className="flex gap-2 text-[11px] text-slate-700">
                <span>•</span>{e}
              </li>
            ))}
          </ul>
        </section>
      )}

      {projects.length > 0 && (
        <section className="mb-4">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-700 border-b border-slate-300 pb-1 mb-2">Publications & Projects</h2>
          {projects.map((p) => (
            <div key={p.id} className="mb-2">
              <p className="text-[11px] font-bold italic text-slate-800">{p.title}</p>
              <p className="text-[10px] text-slate-600">{p.description}</p>
            </div>
          ))}
        </section>
      )}

      {skills.length > 0 && (
        <section>
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-700 border-b border-slate-300 pb-1 mb-2">Technical Skills</h2>
          <p className="text-[11px] text-slate-700">{skills.join(", ")}</p>
        </section>
      )}
    </div>
  );
}

// ─── Main exporter ─────────────────────────────────────────────────────────────
export const TEMPLATES = [
  "Minimal ATS",
  "Modern Professional",
  "Software Engineer",
  "AI Engineer",
  "Academic",
] as const;

export function TemplatePreview({ template, form, skills, projects }: Props) {
  const shared = { form, skills, projects };

  return (
    <div
      className="bg-white shadow-2xl shrink-0"
      style={{
        width: "800px",
        height: "1131px",
        transformOrigin: "top center",
      }}
    >
      <div className="p-12 h-full w-full overflow-hidden origin-top canvas-scaler">
        {template === "Minimal ATS" && <MinimalATS {...shared} />}
        {template === "Modern Professional" && <ModernProfessional {...shared} />}
        {template === "Software Engineer" && <SoftwareEngineer {...shared} />}
        {template === "AI Engineer" && <AIEngineer {...shared} />}
        {template === "Academic" && <Academic {...shared} />}
        {/* Fallback */}
        {!TEMPLATES.includes(template as typeof TEMPLATES[number]) && <ModernProfessional {...shared} />}
      </div>
    </div>
  );
}
