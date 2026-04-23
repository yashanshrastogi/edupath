import { notFound } from "next/navigation";
import { Globe, Code2, Briefcase } from "lucide-react";

interface PublicResumeData {
  id: string;
  title: string;
  template: string;
  atsScore: number;
  updatedAt: string;
  data: {
    name?: string;
    headline?: string;
    summary?: string;
    skills?: string[];
    projectCards?: { title: string; description: string }[];
  };
  user: {
    name?: string;
    image?: string;
  };
}

async function getPublicResume(userId: string): Promise<PublicResumeData | null> {
  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const res = await fetch(`${baseUrl}/api/public/resume/${userId}`, {
    cache: "no-store",
  });
  if (!res.ok) return null;
  return res.json() as Promise<PublicResumeData>;
}

function scoreBarColor(score: number) {
  if (score >= 80) return "#10b981";
  if (score >= 55) return "#f59e0b";
  return "#f43f5e";
}

export default async function PublicResumePage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  const resume = await getPublicResume(userId);

  // Returns proper 404 when toggle is OFF or user doesn't exist
  if (!resume) {
    notFound();
  }

  const { data, user } = resume;
  const skills = data.skills ?? [];
  const projects = data.projectCards ?? [];
  const displayName = data.name ?? user?.name ?? "Anonymous";

  return (
    <div
      className="min-h-screen"
      style={{ background: "linear-gradient(135deg, #0f0f1a 0%, #1a1035 50%, #0f172a 100%)" }}
    >
      {/* ── Top nav ─────────────────────────────────────────────────────────── */}
      <nav className="border-b border-white/5 bg-black/20 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <Globe size={16} className="text-indigo-400" />
            <span>EduPath</span>
            <span className="text-white/30">/</span>
            <span className="text-white/70">resume</span>
          </div>
          <a
            href="/"
            className="text-xs font-semibold px-4 py-1.5 rounded-full border border-indigo-500/40 text-indigo-300 hover:bg-indigo-500/10 transition-colors"
          >
            Build Your Own →
          </a>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-12 space-y-10">
        {/* ── Hero ──────────────────────────────────────────────────────────── */}
        <header className="text-center space-y-4">
          {user?.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.image}
              alt={displayName}
              className="w-20 h-20 rounded-full mx-auto border-4 border-indigo-500/30 shadow-xl shadow-indigo-500/20"
            />
          )}
          {!user?.image && (
            <div className="w-20 h-20 rounded-full mx-auto border-4 border-indigo-500/30 bg-gradient-to-br from-indigo-600 to-violet-700 flex items-center justify-center text-2xl font-black text-white shadow-xl shadow-indigo-500/20">
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h1 className="text-4xl font-black text-white tracking-tight">{displayName}</h1>
            {data.headline && (
              <p className="text-lg font-medium text-indigo-300 mt-1">{data.headline}</p>
            )}
          </div>

          {resume.atsScore > 0 && (
            <div
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold"
              style={{
                background: `${scoreBarColor(resume.atsScore)}18`,
                color: scoreBarColor(resume.atsScore),
                border: `1px solid ${scoreBarColor(resume.atsScore)}44`,
              }}
            >
              ATS Score: {resume.atsScore}%
            </div>
          )}
        </header>

        {/* ── Summary ───────────────────────────────────────────────────────── */}
        {data.summary && (
          <section
            className="rounded-2xl p-6"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              backdropFilter: "blur(12px)",
            }}
          >
            <h2 className="text-xs font-black uppercase tracking-widest text-indigo-400 mb-3">
              About
            </h2>
            <p className="text-white/80 leading-relaxed text-sm">{data.summary}</p>
          </section>
        )}

        {/* ── Skills ────────────────────────────────────────────────────────── */}
        {skills.length > 0 && (
          <section>
            <h2 className="text-xs font-black uppercase tracking-widest text-indigo-400 mb-4 flex items-center gap-2">
              <Code2 size={14} /> Skills
            </h2>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1.5 rounded-full text-sm font-semibold"
                  style={{
                    background: "rgba(99,102,241,0.15)",
                    color: "#a5b4fc",
                    border: "1px solid rgba(99,102,241,0.25)",
                  }}
                >
                  {skill}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* ── Projects ──────────────────────────────────────────────────────── */}
        {projects.length > 0 && (
          <section>
            <h2 className="text-xs font-black uppercase tracking-widest text-indigo-400 mb-4 flex items-center gap-2">
              <Briefcase size={14} /> Projects
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {projects.map((p, i) => (
                <div
                  key={i}
                  className="rounded-2xl p-5 space-y-2 transition-transform hover:-translate-y-0.5"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    backdropFilter: "blur(8px)",
                  }}
                >
                  <h3 className="font-bold text-white">{p.title}</h3>
                  {p.description && (
                    <p className="text-sm text-white/60 leading-relaxed">{p.description}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Footer ────────────────────────────────────────────────────────── */}
        <footer className="text-center pt-8 border-t border-white/5 space-y-1">
          <p className="text-xs font-bold text-white/30 uppercase tracking-widest">
            Made with EduPath AI
          </p>
          <p className="text-[11px] text-white/20">
            Last updated {new Date(resume.updatedAt).toLocaleDateString()}
          </p>
        </footer>
      </main>
    </div>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  const resume = await getPublicResume(userId);
  if (!resume) return { title: "Resume Not Found" };

  const name = resume.data.name ?? resume.user?.name ?? "Resume";
  return {
    title: `${name} — Resume | EduPath`,
    description: resume.data.headline ?? `View ${name}'s professional resume on EduPath.`,
  };
}
