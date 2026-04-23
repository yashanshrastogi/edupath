'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import {
  Mail,
  MessageSquare,
  Bug,
  Clock,
  Hash,
  Briefcase,
  GitBranch,
  ChevronDown,
  Send,
  CircleCheck as CheckCircle2,
  ExternalLink,
  Zap,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

type FormState = {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  topic: string;
  message: string;
};

// ─── Data ────────────────────────────────────────────────────────────────────

const CONTACT_CARDS = [
  {
    icon: <Mail className="w-5 h-5" />,
    color: 'bg-cyan-500/10 text-cyan-400',
    label: 'Email Us',
    value: 'hello@edupath.dev',
    href: 'mailto:hello@edupath.dev',
  },
  {
    icon: <MessageSquare className="w-5 h-5" />,
    color: 'bg-violet-500/10 text-violet-400',
    label: 'Discord Community',
    value: 'discord.gg/edupath',
    href: '#',
  },
  {
    icon: <Bug className="w-5 h-5" />,
    color: 'bg-emerald-500/10 text-emerald-400',
    label: 'Bug Reports',
    value: 'github.com/edupath/issues',
    href: '#',
  },
  {
    icon: <Clock className="w-5 h-5" />,
    color: 'bg-amber-500/10 text-amber-400',
    label: 'Response Time',
    value: 'Usually within 24 hours',
    href: null,
  },
];

const TOPICS = [
  '🐛 Bug Report',
  '💡 Feature Idea',
  '🤝 Partnership',
  '❓ General Question',
  '💼 Enterprise',
  '🎓 Education',
];

const ROLES = [
  'Student / Learner',
  'Developer',
  'Career Changer',
  'Educator / Instructor',
  'Company / Team',
  'Just exploring',
];

const FAQS = [
  {
    q: 'Is EduPath free to use?',
    a: 'EduPath has a generous free tier with access to roadmaps, quizzes, and limited AI mentor sessions. Pro features like unlimited mentoring, resume exports, and job matching require a paid plan.',
  },
  {
    q: 'Which AI models power EduPath?',
    a: 'EduPath uses a combination of open-source LLMs and third-party APIs, carefully selected for speed, accuracy, and cost. We\'re model-agnostic — we pick what works best for each feature.',
  },
  {
    q: 'Can I use EduPath for my students or team?',
    a: 'Yes! We offer education and enterprise plans with team dashboards, progress tracking, and custom roadmaps. Reach out using the form with the "Enterprise" or "Education" topic selected.',
  },
  {
    q: 'How do I report a bug?',
    a: 'You can report bugs via the form above (select "Bug Report"), through our GitHub issues page, or directly on Discord. Please include steps to reproduce, your browser, and any error messages.',
  },
  {
    q: 'Do you have an API or public roadmap?',
    a: 'A public API is on our roadmap for 2026. Our public product roadmap is visible on GitHub. If you have specific integration needs, get in touch — we\'d love to hear the use case.',
  },
];

// ─── FAQ Item ─────────────────────────────────────────────────────────────────

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-[var(--border-subtle)] bg-[var(--bg-card)] rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="w-full flex justify-between items-center px-6 py-5 text-left text-sm text-white hover:text-cyan-400 transition-colors"
      >
        <span>{q}</span>
        <ChevronDown
          className={`w-4 h-4 flex-shrink-0 transition-transform duration-300 ${
            open ? 'rotate-180 text-cyan-400' : 'text-slate-500'
          }`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${
          open ? 'max-h-48' : 'max-h-0'
        }`}
      >
        <p className="px-6 pb-5 text-slate-500 text-sm leading-relaxed">{a}</p>
      </div>
    </div>
  );
}

// ─── Contact Form ─────────────────────────────────────────────────────────────

function ContactForm() {
  const [form, setForm] = useState<FormState>({
    firstName: '',
    lastName: '',
    email: '',
    role: '',
    topic: '',
    message: '',
  });
  const [pending, setPending] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function set(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.firstName || !form.email || !form.message) return;
    setPending(true);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setSubmitted(true);
      } else {
        console.error('Contact form error:', await res.text());
      }
    } catch (err) {
      console.error('Contact form network error:', err);
    } finally {
      setPending(false);
    }
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <CheckCircle2 className="w-14 h-14 text-emerald-400 mb-4" />
        <h3 className="font-extrabold text-xl text-white mb-2">Message sent!</h3>
        <p className="text-slate-400 text-sm max-w-xs leading-relaxed">
          Thanks for reaching out. We&apos;ll get back to you within 24 hours. In the meantime,
          feel free to join our{' '}
          <a href="#" className="text-cyan-400 hover:underline">Discord community</a>.
        </p>
        <button
          onClick={() => { setSubmitted(false); setForm({ firstName:'',lastName:'',email:'',role:'',topic:'',message:'' }); }}
          className="mt-6 text-sm text-slate-500 hover:text-white transition-colors"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* name row */}
      <div className="grid grid-cols-2 gap-4">
        {(
          [
            { field: 'firstName', placeholder: 'Aryan', label: 'First name' },
            { field: 'lastName',  placeholder: 'Sharma', label: 'Last name' },
          ] as const
        ).map(({ field, placeholder, label }) => (
          <div key={field} className="flex flex-col gap-1.5">
            <label className="text-xs text-slate-500 tracking-wide">
              {label} <span className="text-cyan-400">*</span>
            </label>
            <input
              type="text"
              placeholder={placeholder}
              value={form[field]}
              onChange={(e) => set(field, e.target.value)}
              required
              className="bg-[#0a1020] border border-white/8 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-400/40 focus:ring-1 focus:ring-cyan-400/20 transition"
            />
          </div>
        ))}
      </div>

      {/* email */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-slate-500 tracking-wide">
          Email address <span className="text-cyan-400">*</span>
        </label>
        <input
          type="email"
          placeholder="aryan@example.com"
          value={form.email}
          onChange={(e) => set('email', e.target.value)}
          required
          className="bg-[#0a1020] border border-white/8 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-400/40 focus:ring-1 focus:ring-cyan-400/20 transition"
        />
      </div>

      {/* role */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-slate-500 tracking-wide">I am a...</label>
        <select
          value={form.role}
          onChange={(e) => set('role', e.target.value)}
          className="bg-[#0a1020] border border-white/8 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400/40 focus:ring-1 focus:ring-cyan-400/20 transition appearance-none cursor-pointer"
        >
          <option value="" disabled>Select your role</option>
          {ROLES.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>

      {/* topic chips */}
      <div className="flex flex-col gap-2">
        <label className="text-xs text-slate-500 tracking-wide">What&apos;s this about?</label>
        <div className="flex flex-wrap gap-2">
          {TOPICS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => set('topic', form.topic === t ? '' : t)}
              className={`px-3 py-1.5 rounded-full text-xs border transition-all ${
                form.topic === t
                  ? 'bg-cyan-400/10 border-cyan-400/40 text-cyan-400'
                  : 'border-white/8 text-slate-500 hover:text-white hover:border-white/20'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* message */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-slate-500 tracking-wide">
          Your message <span className="text-cyan-400">*</span>
        </label>
        <textarea
          placeholder="Tell us what's on your mind — the more detail, the better we can help..."
          value={form.message}
          onChange={(e) => set('message', e.target.value)}
          required
          rows={5}
          className="bg-[#0a1020] border border-white/8 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-400/40 focus:ring-1 focus:ring-cyan-400/20 transition resize-none leading-relaxed"
        />
      </div>

      {/* submit */}
      <div className="flex items-center justify-between pt-1">
        <p className="text-xs text-slate-600">🔒 We never share your info. Ever.</p>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-cyan-400 to-violet-500 text-[#080c14] font-bold text-sm hover:opacity-85 transition-opacity disabled:opacity-50"
        >
          {pending ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-[#080c14]/40 border-t-[#080c14] rounded-full animate-spin" />
              Sending...
            </>
          ) : (
            <>
              Send Message
              <Send className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ContactPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text-primary)' }}>
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 pb-24" style={{ paddingTop: '160px' }}>

        {/* ── Header ── */}
        <div className="text-center mb-24 md:mb-32 relative">
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="w-[600px] h-[400px] bg-cyan-500/5 rounded-full blur-3xl" />
          </div>
          <div className="inline-flex items-center gap-2 border border-cyan-400/20 bg-cyan-400/5 rounded-full px-4 py-1.5 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-xs font-medium tracking-widest uppercase text-cyan-400">Get In Touch</span>
          </div>
          <h1 className="font-extrabold text-5xl md:text-6xl tracking-tight leading-tight mb-4 text-white">
            We&apos;d love to{' '}
            <span className="bg-gradient-to-r from-cyan-400 via-violet-400 to-emerald-400 bg-clip-text text-transparent">
              hear from you
            </span>
          </h1>
          <p className="text-slate-400 text-lg max-w-md mx-auto leading-relaxed">
            Have a question, feature idea, or just want to say hi? We read every message
            and get back within 24 hours.
          </p>
        </div>

        {/* ── Main grid ── */}
        <div className="grid lg:grid-cols-[1fr_1.6fr] gap-16 lg:gap-24 items-start mb-32 md:mb-48">

          {/* Left — info */}
          <div>
            <h2 className="font-extrabold text-xl text-white mb-2">Let&apos;s talk</h2>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Whether you&apos;re a student just starting out, a developer levelling up, or a team
              looking to onboard EduPath — we&apos;re here for it.
            </p>

            {/* contact cards */}
            <div className="space-y-3 mb-8">
              {CONTACT_CARDS.map(({ icon, color, label, value, href }) => (
                <div
                  key={label}
                  className="flex items-center gap-4 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl p-4 hover:border-cyan-400/20 hover:translate-x-1 transition-all duration-200 group"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
                    {icon}
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 tracking-wider uppercase mb-0.5">{label}</p>
                    {href ? (
                      <a
                        href={href}
                        className="text-sm text-white group-hover:text-cyan-400 transition-colors"
                      >
                        {value}
                      </a>
                    ) : (
                      <p className="text-sm text-white">{value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* social */}
            <p className="text-xs text-slate-500 tracking-wider uppercase mb-3">Follow EduPath</p>
            <div className="flex flex-wrap gap-2">
              {[
                { icon: <Hash className="w-3.5 h-3.5" />, label: 'Twitter',      href: '#' },
                { icon: <Briefcase className="w-3.5 h-3.5" />, label: 'LinkedIn',    href: '#' },
                { icon: <GitBranch className="w-3.5 h-3.5" />, label: 'GitHub',        href: '#' },
                { icon: <ExternalLink className="w-3.5 h-3.5" />, label: 'Product Hunt', href: '#' },
              ].map(({ icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/8 bg-[var(--bg-card)] text-slate-400 text-xs hover:text-cyan-400 hover:border-cyan-400/25 transition-all"
                >
                  {icon} {label}
                </a>
              ))}
            </div>
          </div>

          {/* Right — form */}
          <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl p-8 relative overflow-hidden">
            {/* top shimmer line */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />

            <h3 className="font-extrabold text-lg text-white mb-1">Send us a message</h3>
            <p className="text-slate-500 text-sm mb-6">
              Fill in the details below and we&apos;ll get back to you as soon as we can.
            </p>

            <ContactForm />
          </div>
        </div>

        {/* ── Divider ── */}
        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-20" />

        {/* ── FAQ ── */}
        <div>
          <p className="text-xs font-medium tracking-widest uppercase text-cyan-400 mb-2">FAQ</p>
          <h2 className="font-extrabold text-3xl md:text-4xl tracking-tight text-white mb-2">
            Common questions
          </h2>
          <p className="text-slate-400 mb-8">Quick answers to things people usually ask before reaching out.</p>

          <div className="space-y-3 max-w-2xl">
            {FAQS.map(({ q, a }) => (
              <FaqItem key={q} q={q} a={a} />
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border-subtle)] py-10 text-center text-slate-500 text-sm">
        <Link
          href="/"
          className="font-extrabold text-base bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent block mb-3"
        >
          EduPath
        </Link>
        <div className="flex justify-center gap-6 mb-4">
          {[
            { label: 'About',   href: '/about' },
            { label: 'Privacy', href: '/privacy' },
            { label: 'Terms',   href: '/terms' },
            { label: 'hello@edupath.dev', href: 'mailto:hello@edupath.dev' },
          ].map(({ label, href }) => (
            <a key={label} href={href} className="hover:text-cyan-400 transition-colors">
              {label}
            </a>
          ))}
        </div>
        <p className="text-slate-600 text-xs">© 2026 EduPath. All rights reserved.</p>
      </footer>
    </div>
  );
}
