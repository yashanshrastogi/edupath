'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Map,
  FileText,
  Bot,
  Zap,
  Briefcase,
  Users,
  ArrowRight,
  Star,
  BookOpen,
  Award,
  Globe,
  Layers,
  CircleCheck as CheckCircle2,
} from 'lucide-react';

// ─── Data ────────────────────────────────────────────────────────────────────

const navLinks = [
  { label: 'Roadmap', href: '/roadmap' },
  { label: 'Mentor', href: '/mentor' },
  { label: 'Resume', href: '/resume' },
  { label: 'Quizzes', href: '/quizzes' },
  { label: 'Jobs', href: '/jobs' },
  { label: 'Community', href: '/community' },
  { label: 'Projects', href: '/projects' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

const STATS = [
  { num: '10K+', label: 'Active Learners' },
  { num: '50+', label: 'Career Roadmaps' },
  { num: '98%', label: 'Satisfaction Rate' },
  { num: '24/7', label: 'AI Mentor Access' },
];

const FEATURES = [
  {
    icon: <Map className="w-5 h-5" />,
    color: 'bg-cyan-500/10 text-cyan-400',
    title: 'AI Roadmap Generator',
    desc: 'Input your current skills and target role. EduPath generates a step-by-step learning roadmap with curated resources, milestones, and estimated timelines — tailored to you.',
  },
  {
    icon: <FileText className="w-5 h-5" />,
    color: 'bg-violet-500/10 text-violet-400',
    title: 'Smart Resume Builder',
    desc: 'Build ATS-optimised resumes with AI assistance. Get real-time scoring, keyword suggestions, and export a polished PDF that evolves as your skills grow.',
  },
  {
    icon: <Bot className="w-5 h-5" />,
    color: 'bg-emerald-500/10 text-emerald-400',
    title: 'AI Mentor Chat',
    desc: 'Ask anything — code reviews, career advice, concept explanations. Your AI mentor remembers your journey, adapts to your learning style, and gives expert-level feedback.',
  },
  {
    icon: <Zap className="w-5 h-5" />,
    color: 'bg-amber-500/10 text-amber-400',
    title: 'Adaptive Quizzes',
    desc: 'Knowledge checks that adapt to your level. Quizzes are generated on-demand for any skill or topic, with instant feedback and explanations that make concepts stick.',
  },
  {
    icon: <Briefcase className="w-5 h-5" />,
    color: 'bg-cyan-500/10 text-cyan-400',
    title: 'Jobs Board',
    desc: 'Curated job listings matched to your current skills and roadmap progress. See exactly which skills you\'re missing for each role and fill the gaps before you apply.',
  },
  {
    icon: <Users className="w-5 h-5" />,
    color: 'bg-violet-500/10 text-violet-400',
    title: 'Community',
    desc: 'Connect with learners on the same roadmap, share progress, ask questions, and celebrate wins together. Learning is faster when you\'re not alone.',
  },
];

const TEAM = [
  {
    initials: '💻',
    name: 'Yashansh Rastogi',
    role: 'Frontend Developer ,\n (Component Architecture)',
    bio: 'Designs and organizes the frontend architecture of the platform. Responsible for building reusable components, structuring the UI framework, and ensuring scalability and maintainability of the frontend codebase.',
    gradient: 'from-cyan-400 to-violet-500',
  },
  {
    initials: '🎨',
    name: 'Archana',
    role: 'Frontend Developer , \n (UI/UX Design)',
    bio: 'Focuses on designing intuitive and visually appealing interfaces. Responsible for user flows, wireframes, design systems, and ensuring a smooth and engaging user experience across the platform.',
    gradient: 'from-violet-400 to-emerald-400',
  },
  {
    initials: '⚙️',
    name: 'Satyam Singh Rajput',
    role: 'Backend Developer ,\n (DataBase Developer)',
    bio: 'Responsible for designing the backend architecture, defining route structures, and implementing core application logic. Ensures the backend is scalable, secure, and efficient.',
    gradient: 'from-emerald-400 to-amber-400',
  },
  {
    initials: '🔌',
    name: 'Yashwant',
    role: 'Backed Developer , \n (Backend API Engineer)',
    bio: 'Develops and manages backend APIs and server-side logic. Responsible for integrating services, handling data communication between frontend and backend, and optimizing API performance.',
    gradient: 'from-emerald-400 to-amber-400',
  },
];

const VALUES = [
  { num: '01', title: 'Learner-First, Always', desc: 'Every feature starts with one question: does this genuinely help someone learn faster?' },
  { num: '02', title: 'Radical Personalisation', desc: 'Generic curricula waste time. We build tools that adapt to the individual, not the average.' },
  { num: '03', title: 'Honest AI', desc: 'Our AI mentor gives real feedback, not flattery. Honest criticism builds better developers.' },
  { num: '04', title: 'Accessible by Default', desc: 'Quality education shouldn\'t require an expensive bootcamp. EduPath is built to be affordable.' },
];

const TIMELINE = [
  {
    year: '2023 — The Problem',
    title: 'Scattered resources, zero direction',
    desc: 'Our founders spent months jumping between YouTube tutorials, docs, and courses with no clear direction. They built what they wished existed.',
    dot: 'bg-cyan-400 shadow-cyan-400/50',
  },
  {
    year: '2024 — The Build',
    title: 'First version shipped',
    desc: 'The initial EduPath launched with roadmap generation and resume builder. 500 users in the first month — entirely organic.',
    dot: 'bg-violet-400 shadow-violet-400/50',
  },
  {
    year: '2025 — The Growth',
    title: 'AI Mentor & Quizzes go live',
    desc: 'Added the AI Mentor and adaptive quiz system. User retention jumped 3x. The platform started to feel like a genuine learning companion.',
    dot: 'bg-emerald-400 shadow-emerald-400/50',
  },
  {
    year: '2026 — Now',
    title: '10,000+ learners and growing',
    desc: 'EduPath now serves thousands of learners across 40+ countries. We\'re just getting started.',
    dot: 'bg-amber-400 shadow-amber-400/50',
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionTag({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-medium tracking-widest uppercase text-cyan-400 mb-3">
      {children}
    </p>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="font-extrabold text-3xl md:text-4xl tracking-tight leading-tight mb-4 text-white"
      style={{ fontFamily: 'Outfit,sans-serif' }}
    >
      {children}
    </h2>
  );
}

function GradientText({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        background: 'linear-gradient(135deg,#8b5cf6,#06b6d4)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
      }}
    >
      {children}
    </span>
  );
}

function Divider() {
  return (
    <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-0" />
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────

function Navbar() {
  return (
    <nav
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        background: 'rgba(11,11,18,0.9)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(139,92,246,0.12)',
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          padding: '0 clamp(16px,4vw,32px)',
          height: 64,
          display: 'flex',
          alignItems: 'center',
          gap: 32,
        }}
      >
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', flexShrink: 0 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'linear-gradient(135deg,#8b5cf6,#6366f1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Zap size={18} color="white" fill="white" />
          </div>
          <span style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 800, fontSize: '1.1rem', color: '#f0eeff' }}>
            EduPath <span style={{ background: 'linear-gradient(135deg,#8b5cf6,#06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>AI</span>
          </span>
        </Link>
        <div style={{ display: 'none' }} className="md:!flex items-center gap-4 flex-1">
          {navLinks.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              style={{
                padding: '6px 14px',
                borderRadius: 8,
                fontSize: '0.85rem',
                fontWeight: 500,
                color: 'var(--text-secondary)',
                textDecoration: 'none',
                transition: 'color 0.15s',
              }}
            >
              {label}
            </Link>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <Link href="/login" style={{ textDecoration: 'none' }}>
            <button
              style={{
                padding: '8px 18px',
                borderRadius: 9,
                border: '1px solid rgba(139,92,246,0.3)',
                background: 'transparent',
                color: '#c4b5fd',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Log In
            </button>
          </Link>
          <Link href="/dashboard" style={{ textDecoration: 'none' }}>
            <button
              style={{
                padding: '8px 18px',
                borderRadius: 9,
                border: 'none',
                background: 'linear-gradient(135deg,#8b5cf6,#6366f1)',
                color: '#fff',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 0 20px rgba(139,92,246,0.4)',
              }}
            >
              Get Started Free
            </button>
          </Link>
        </div>
      </div>
    </nav>
  );
}

// ─── Page sections ────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 pb-24 overflow-hidden" style={{ paddingTop: '160px' }}>
      {/* background glows */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-cyan-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-0 w-[400px] h-[400px] bg-violet-500/5 rounded-full blur-3xl" />
      </div>

      {/* badge */}
      <div className="inline-flex items-center gap-2 border border-cyan-400/20 bg-cyan-400/5 rounded-full px-4 py-1.5 mb-8">
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
        <span className="text-xs font-medium tracking-widest uppercase text-cyan-400">About EduPath</span>
      </div>

      <h1
        className="font-extrabold text-5xl md:text-7xl tracking-tight leading-[1.05] mb-6 text-white"
        style={{ fontFamily: 'Outfit,sans-serif' }}
      >
        Learning that<br />
        <GradientText>moves with you</GradientText>
      </h1>

      <p className="max-w-xl text-slate-400 text-lg leading-relaxed mb-12">
        EduPath is an AI-powered education platform built for developers, students, and career-changers
        who refuse to follow someone else&apos;s script.
      </p>

      <div className="flex flex-wrap gap-10 justify-center">
        {STATS.map(({ num, label }) => (
          <div key={label} className="text-center">
            <div className="font-extrabold text-4xl bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">
              {num}
            </div>
            <div className="text-slate-500 text-sm tracking-wide mt-1">{label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Mission() {
  return (
    <section id="mission" className="max-w-6xl mx-auto px-4 py-32 md:py-40">
      <SectionTag>Our Mission</SectionTag>
      <SectionHeading>
        Education shouldn&apos;t be{' '}
        <GradientText>one-size-fits-all</GradientText>
      </SectionHeading>

      <div className="grid md:grid-cols-2 gap-16 lg:gap-24 items-center mt-12 md:mt-16">
        {/* text */}
        <div className="space-y-5 text-slate-400 leading-relaxed">
          <p>
            Traditional learning platforms hand you a syllabus and expect you to keep up.
            EduPath flips that model. We start with{' '}
            <strong className="text-white font-medium">who you are</strong> — your skills,
            your goals, your timeline — and build the roadmap around you.
          </p>
          <p>
            Whether you&apos;re aiming for your first developer job, levelling up for a promotion,
            or pivoting careers entirely, EduPath&apos;s AI engine generates a{' '}
            <strong className="text-white font-medium">personalised path</strong> that adapts as you grow.
          </p>
          <p>
            Our AI Mentor doesn&apos;t just answer questions — it asks the right ones. Think of it as
            having a{' '}
            <strong className="text-white font-medium">senior developer in your pocket</strong>,
            available at 2am when you&apos;re stuck on a bug.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 mt-2 text-cyan-400 text-sm font-medium hover:gap-3 transition-all"
          >
            Start your path <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* visual */}
        <div className="relative h-80 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] overflow-hidden flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-violet-500/5" />

          {[200, 280, 340].map((size, i) => (
            <div
              key={size}
              className="absolute rounded-full border border-[var(--border-subtle)]"
              style={{
                width: size,
                height: size,
                animation: `spin ${20 + i * 10}s linear infinite ${i % 2 === 1 ? 'reverse' : ''}`,
              }}
            >
              <div
                className={`absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full ${['bg-cyan-400', 'bg-violet-400', 'bg-emerald-400'][i]
                  }`}
              />
            </div>
          ))}

          <div className="relative z-10 w-16 h-16 rounded-full bg-gradient-to-br from-cyan-400 to-violet-500 flex items-center justify-center text-2xl shadow-xl">
            🎓
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </section>
  );
}

function Features() {
  return (
    <section id="features" className="max-w-6xl mx-auto px-4 py-32 md:py-40">
      <SectionTag>What We Build</SectionTag>
      <SectionHeading>
        Every tool you need{' '}
        <GradientText>in one place</GradientText>
      </SectionHeading>
      <p className="text-slate-400 max-w-lg leading-relaxed mb-12">
        Four core features, all powered by AI, all designed to get you from where you are
        to where you want to be.
      </p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {FEATURES.map(({ icon, color, title, desc }) => (
          <div
            key={title}
            className="group bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl p-6 hover:-translate-y-1 transition-all duration-300 hover:border-cyan-400/20 relative overflow-hidden"
          >
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/0 to-transparent group-hover:via-cyan-400/40 transition-all duration-500" />
            <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl mb-4 ${color}`}>
              {icon}
            </div>
            <h3 className="font-bold text-white text-base mb-2">{title}</h3>
            <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Team() {
  return (
    <section id="team" className="max-w-6xl mx-auto px-4 py-32 md:py-40">
      <SectionTag>The Builders</SectionTag>
      <SectionHeading>
        Built by developers,{' '}
        <GradientText>for developers</GradientText>
      </SectionHeading>
      <p className="text-slate-400 max-w-lg leading-relaxed mb-12">
        EduPath was created by a small team who felt the pain of fragmented learning resources
        and decided to fix it.
      </p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {TEAM.map(({ initials, name, role, bio, gradient }) => (
          <div
            key={name}
            className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl p-6 text-center hover:-translate-y-1 hover:border-violet-400/20 transition-all duration-300"
          >
            <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center font-extrabold text-xl text-[#080c14] mx-auto mb-4`}>
              {initials}
            </div>
            <h4 className="font-bold text-white mb-1">{name}</h4>
            <p className="text-cyan-400 text-xs tracking-wider uppercase mb-3 whitespace-pre-line">{role}</p>
            <p className="text-slate-500 text-sm leading-relaxed">{bio}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function ValuesSection() {
  return (
    <section className="max-w-6xl mx-auto px-4 py-32 md:py-40">
      <SectionTag>What Drives Us</SectionTag>
      <SectionHeading>Values we build with</SectionHeading>

      <div className="grid sm:grid-cols-2 gap-4 mt-8">
        {VALUES.map(({ num, title, desc }) => (
          <div
            key={num}
            className="flex gap-4 items-start bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl p-6"
          >
            <span className="font-extrabold text-3xl text-white/10 leading-none flex-shrink-0 min-w-[2.5rem]">
              {num}
            </span>
            <div>
              <h4 className="font-semibold text-white mb-1 text-sm">{title}</h4>
              <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function TimelineSection() {
  return (
    <section id="story" className="max-w-6xl mx-auto px-4 py-32 md:py-40">
      <SectionTag>Our Story</SectionTag>
      <SectionHeading>
        How EduPath{' '}
        <GradientText>came to be</GradientText>
      </SectionHeading>

      <div className="max-w-lg mt-12 md:mt-16 relative pl-8">
        {/* vertical line */}
        <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-cyan-400 via-violet-400 to-transparent" />

        {TIMELINE.map(({ year, title, desc, dot }, i) => (
          <div key={year} className={`relative ${i < TIMELINE.length - 1 ? 'pb-10' : ''}`}>
            <div className={`absolute -left-[2.15rem] top-1 w-3 h-3 rounded-full shadow-lg ${dot}`} />
            <p className="text-xs font-semibold tracking-widest uppercase text-cyan-400 mb-1">{year}</p>
            <h4 className="font-semibold text-white mb-1">{title}</h4>
            <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AboutPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text-primary)' }}>
      <Navbar />

      <Hero />
      <Divider />
      <Mission />
      <Divider />
      <Features />
      <Divider />
      <Team />
      <Divider />
      <ValuesSection />
      <Divider />
      <TimelineSection />

      {/* Footer */}
      <footer className="border-t border-[var(--border-subtle)] py-10 text-center text-slate-500 text-sm">
        <Link
          href="/"
          className="font-extrabold text-base bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent block mb-3"
        >
          EduPath
        </Link>
        <div className="flex justify-center gap-8 lg:gap-10 mb-4">
          {[
            { label: 'Contact', href: '/contact' },
            { label: 'Privacy', href: '/privacy' },
            { label: 'Terms', href: '/terms' },
          ].map(({ label, href }) => (
            <Link key={label} href={href} className="hover:text-cyan-400 transition-colors">
              {label}
            </Link>
          ))}
        </div>
        <p className="text-slate-600 text-xs">© 2026 EduPath. All rights reserved.</p>
      </footer>
    </div>
  );
}
