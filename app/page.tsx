"use client";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import {
  Zap, Map, TrendingUp, FileText, Users, Briefcase, Bot, CheckSquare,
  ArrowRight, Star, Award, Globe, BookOpen, Code2, Layers, Shield,
  ChevronRight, Play, BarChart3, Clock, Target,
} from "lucide-react";

/* ── Data ──────────────────────────────────────────────────────────────── */
const stats = [
  { label: "Active Learners", value: "42,800+", icon: Users, color: "#8b5cf6" },
  { label: "Roadmaps Created", value: "186,000+", icon: Map, color: "#06b6d4" },
  { label: "Projects Built", value: "94,200+", icon: Code2, color: "#10b981" },
  { label: "Jobs Landed", value: "8,700+", icon: Briefcase, color: "#f59e0b" },
];

const features = [
  {
    icon: Map, title: "AI Roadmap Generator",
    desc: "Get a personalized, step-by-step learning roadmap tailored to your career goal and current skill level.",
    href: "/roadmap", color: "#8b5cf6",
  },
  {
    icon: TrendingUp, title: "Progress Tracker",
    desc: "Visualize your skill growth with radar charts, heatmaps, and streak counters.",
    href: "/progress", color: "#10b981",
  },
  {
    icon: FileText, title: "AI Resume Builder",
    desc: "Build ATS-optimized resumes with AI verification, keyword optimization, and instant PDF export.",
    href: "/resume", color: "#06b6d4",
  },
  {
    icon: CheckSquare, title: "Skill Verification",
    desc: "Prove your skills with adaptive quizzes and earn verified certificates.",
    href: "/quizzes", color: "#f59e0b",
  },
  {
    icon: Users, title: "Global Community",
    desc: "Share projects, answer questions, join study groups, and compete on leaderboards.",
    href: "/community", color: "#f43f5e",
  },
  {
    icon: Bot, title: "AI Career Mentor",
    desc: "Get personalized career advice, interview prep, and skill-gap analysis from your AI mentor.",
    href: "/mentor", color: "#a855f7",
  },
];

const steps = [
  { step: "01", title: "Set Your Goal", desc: "Tell us your dream job, current skills, and time availability.", icon: Globe },
  { step: "02", title: "Get Your Roadmap", desc: "AI generates a custom learning path with curated resources.", icon: Map },
  { step: "03", title: "Learn & Build", desc: "Complete modules, build projects, and verify your skills.", icon: BookOpen },
  { step: "04", title: "Get Hired", desc: "Export your verified resume and connect with job opportunities.", icon: Briefcase },
];

const testimonials = [
  { name: "Sarah K.", role: "Frontend Engineer @ Meta", text: "EduPath's AI roadmap took me from zero to landing my dream job in 8 months.", avatar: "SK", stars: 5, color: "#8b5cf6" },
  { name: "Alex R.", role: "ML Engineer @ Google", text: "The resume verification system helped me get past ATS filters I'd been failing for years.", avatar: "AR", stars: 5, color: "#06b6d4" },
  { name: "Priya M.", role: "Full-Stack Dev @ Startup", text: "The community is incredible. Study groups and mentors kept me accountable.", avatar: "PM", stars: 5, color: "#10b981" },
];

/* ── Component ─────────────────────────────────────────────────────────── */
export default function LandingPage() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>

      {/* ══ TOP NAVBAR ══════════════════════════════════════════════════ */}
      <Navbar />

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 clamp(16px,4vw,32px)" }}>

        {/* ══ HERO ════════════════════════════════════════════════════════ */}
        <section style={{ position: "relative", textAlign: "center", padding: "80px 0 64px", overflow: "hidden" }}>
          {/* Background glows */}
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
            <div style={{ width: 600, height: 400, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(139,92,246,0.18) 0%, transparent 70%)", filter: "blur(40px)" }} />
          </div>

          <div style={{ position: "relative", zIndex: 1 }}>
            {/* Badge */}
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 16px", borderRadius: 99, background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.3)", marginBottom: 28 }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#10b981", display: "inline-block" }} />
              <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "#c4b5fd" }}>AI-Powered Career Platform — Now in Beta</span>
            </div>

            <h1
              style={{
                fontFamily: "Outfit,sans-serif",
                fontWeight: 900,
                fontSize: "clamp(2.4rem, 6vw, 4.5rem)",
                lineHeight: 1.1,
                marginBottom: 20,
                color: "#f0eeff",
              }}
            >
              Launch Your Tech Career
              <br />
              <span style={{ background: "linear-gradient(135deg,#8b5cf6,#6366f1,#06b6d4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                with AI Precision
              </span>
            </h1>

            <p style={{ fontSize: "clamp(1rem,2.5vw,1.2rem)", color: "var(--text-secondary)", maxWidth: 600, margin: "0 auto 36px", lineHeight: 1.7 }}>
              Personalized roadmaps, curated resources, AI mentoring, verified
              skills, and a global community — everything you need to go from
              beginner to hired.
            </p>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 14, justifyContent: "center" }}>
              <Link href="/roadmap" style={{ textDecoration: "none" }}>
                <button
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "13px 28px",
                    borderRadius: 12,
                    border: "none",
                    background: "linear-gradient(135deg,#8b5cf6,#6366f1)",
                    color: "#fff",
                    fontSize: "1rem",
                    fontWeight: 700,
                    cursor: "pointer",
                    boxShadow: "0 0 32px rgba(139,92,246,0.45)",
                  }}
                >
                  <Zap size={18} /> Generate My Roadmap
                </button>
              </Link>
              <Link href="/dashboard" style={{ textDecoration: "none" }}>
                <button
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "13px 28px",
                    borderRadius: 12,
                    border: "1px solid rgba(139,92,246,0.3)",
                    background: "rgba(139,92,246,0.08)",
                    color: "#c4b5fd",
                    fontSize: "1rem",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  View Dashboard <ArrowRight size={16} />
                </button>
              </Link>
            </div>
          </div>
        </section>

        {/* ══ STATS STRIP ══════════════════════════════════════════════════ */}
        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 16, marginBottom: 80 }}>
          {stats.map(({ label, value, icon: Icon, color }) => (
            <div
              key={label}
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border-subtle)",
                borderRadius: 16,
                padding: "20px 24px",
                display: "flex",
                flexDirection: "column",
                gap: 12,
                transition: "border-color 0.2s",
              }}
            >
              <div style={{ width: 40, height: 40, borderRadius: 10, background: `${color}18`, border: `1px solid ${color}30`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon size={20} style={{ color }} />
              </div>
              <div>
                <div style={{ fontFamily: "Outfit,sans-serif", fontWeight: 800, fontSize: "1.6rem", color: "var(--text-primary)", lineHeight: 1 }}>{value}</div>
                <div style={{ fontSize: "0.78rem", color, marginTop: 4, fontWeight: 600 }}>{label}</div>
              </div>
            </div>
          ))}
        </section>

        {/* ══ FEATURES GRID ═══════════════════════════════════════════════ */}
        <section style={{ marginBottom: 80 }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <h2 style={{ fontFamily: "Outfit,sans-serif", fontWeight: 800, fontSize: "clamp(1.6rem,4vw,2.2rem)", marginBottom: 12 }}>
              Everything You Need to Succeed
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "1rem", maxWidth: 520, margin: "0 auto" }}>
              One platform combining the power of Coursera + Kaggle + GitHub + LinkedIn Learning
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 20, paddingBottom: 8 }}>
            {features.map(({ icon: Icon, title, desc, href, color }) => (
              <Link key={title} href={href} style={{ textDecoration: "none" }}>
                <div
                  style={{
                    background: "var(--bg-card)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: 18,
                    padding: "28px 24px",
                    height: "100%",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    display: "flex",
                    flexDirection: "column",
                    gap: 14,
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = `${color}50`;
                    (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)";
                    (e.currentTarget as HTMLElement).style.boxShadow = `0 12px 40px ${color}18`;
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = "var(--border-subtle)";
                    (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                    (e.currentTarget as HTMLElement).style.boxShadow = "none";
                  }}
                >
                  <div style={{ width: 48, height: 48, borderRadius: 14, background: `${color}18`, border: `1px solid ${color}35`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon size={22} style={{ color }} />
                  </div>
                  <div>
                    <h3 style={{ fontFamily: "Outfit,sans-serif", fontWeight: 700, fontSize: "1rem", marginBottom: 8, color: "var(--text-primary)" }}>{title}</h3>
                    <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>{desc}</p>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: "0.8rem", fontWeight: 700, color, marginTop: "auto" }}>
                    Explore <ArrowRight size={13} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ══ HOW IT WORKS ════════════════════════════════════════════════ */}
        <section style={{ marginBottom: 80 }}>
          <h2 style={{ fontFamily: "Outfit,sans-serif", fontWeight: 800, fontSize: "clamp(1.6rem,4vw,2.2rem)", textAlign: "center", marginBottom: 48 }}>
            How EduPath Works
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 28, position: "relative" }}>
            {steps.map(({ step, title, desc, icon: Icon }, i) => (
              <div key={step} style={{ position: "relative", textAlign: "center" }}>
                {/* Connector line */}
                {i < steps.length - 1 && (
                  <div style={{ position: "absolute", top: 32, left: "calc(50% + 32px)", right: "calc(-50% + 32px)", height: 1, background: "linear-gradient(90deg, rgba(139,92,246,0.4), transparent)", display: "none" }} />
                )}
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 18,
                    border: "1px solid rgba(139,92,246,0.3)",
                    background: "rgba(139,92,246,0.08)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 16px",
                  }}
                >
                  <Icon size={26} style={{ color: "var(--accent-violet)" }} />
                </div>
                <div style={{ fontSize: "0.72rem", fontFamily: "JetBrains Mono,monospace", fontWeight: 700, color: "var(--accent-violet)", marginBottom: 6 }}>{step}</div>
                <h3 style={{ fontFamily: "Outfit,sans-serif", fontWeight: 700, fontSize: "1rem", marginBottom: 8 }}>{title}</h3>
                <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ══ TESTIMONIALS ════════════════════════════════════════════════ */}
        <section style={{ marginBottom: 80 }}>
          <h2 style={{ fontFamily: "Outfit,sans-serif", fontWeight: 800, fontSize: "clamp(1.6rem,4vw,2.2rem)", textAlign: "center", marginBottom: 48 }}>
            Loved by Developers Worldwide
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 20 }}>
            {testimonials.map(({ name, role, text, avatar, stars, color }) => (
              <div
                key={name}
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: 18,
                  padding: "28px 24px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 14,
                }}
              >
                {/* Stars */}
                <div style={{ display: "flex", gap: 2 }}>
                  {Array.from({ length: stars }).map((_, i) => (
                    <Star key={i} size={14} style={{ color: "#f59e0b" }} fill="#f59e0b" />
                  ))}
                </div>
                <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: 1.65, fontStyle: "italic", flex: 1 }}>
                  &quot;{text}&quot;
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      background: `linear-gradient(135deg, ${color}, ${color}80)`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.78rem",
                      fontWeight: 700,
                      color: "#fff",
                      flexShrink: 0,
                    }}
                  >
                    {avatar}
                  </div>
                  <div>
                    <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "var(--text-primary)" }}>{name}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ══ CTA BANNER ══════════════════════════════════════════════════ */}
        <section
          style={{
            position: "relative",
            textAlign: "center",
            padding: "64px 24px",
            borderRadius: 24,
            marginBottom: 48,
            overflow: "hidden",
            background: "linear-gradient(135deg, rgba(139,92,246,0.14) 0%, rgba(6,182,212,0.08) 100%)",
            border: "1px solid rgba(139,92,246,0.22)",
          }}
        >
          <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
            <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center, rgba(139,92,246,0.12) 0%, transparent 70%)" }} />
          </div>
          <div style={{ position: "relative", zIndex: 1 }}>
            <Award size={40} style={{ color: "var(--accent-violet)", margin: "0 auto 16px" }} />
            <h2 style={{ fontFamily: "Outfit,sans-serif", fontWeight: 800, fontSize: "clamp(1.4rem,4vw,2rem)", marginBottom: 14 }}>
              Start Your Learning Journey Today
            </h2>
            <p style={{ fontSize: "1rem", color: "var(--text-secondary)", maxWidth: 460, margin: "0 auto 32px", lineHeight: 1.7 }}>
              Join 42,000+ developers building their careers with AI-powered guidance.
            </p>
            <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/roadmap" style={{ textDecoration: "none" }}>
                <button
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "13px 28px",
                    borderRadius: 12,
                    border: "none",
                    background: "linear-gradient(135deg,#8b5cf6,#6366f1)",
                    color: "#fff",
                    fontSize: "1rem",
                    fontWeight: 700,
                    cursor: "pointer",
                    boxShadow: "0 0 28px rgba(139,92,246,0.4)",
                  }}
                >
                  <Layers size={18} /> Get Started Free
                </button>
              </Link>
              <Link href="/community" style={{ textDecoration: "none" }}>
                <button
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "13px 28px",
                    borderRadius: 12,
                    border: "1px solid rgba(139,92,246,0.3)",
                    background: "rgba(139,92,246,0.08)",
                    color: "#c4b5fd",
                    fontSize: "1rem",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  <Users size={16} /> Browse Community
                </button>
              </Link>
            </div>
          </div>
        </section>

        {/* ══ FOOTER ══════════════════════════════════════════════════════ */}
        <footer
          style={{
            borderTop: "1px solid var(--border-subtle)",
            paddingTop: 32,
            paddingBottom: 32,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg,#8b5cf6,#6366f1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Zap size={14} color="white" fill="white" />
            </div>
            <span style={{ fontFamily: "Outfit,sans-serif", fontWeight: 700, fontSize: "0.95rem", color: "var(--text-secondary)" }}>
              EduPath AI — Built for learners everywhere
            </span>
          </div>
          <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
            © 2026 EduPath AI. All rights reserved.
          </span>
        </footer>

      </div>
    </div>
  );
}
