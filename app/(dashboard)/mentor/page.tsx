"use client";
import { useState, useRef, useEffect } from "react";
import {
  Bot, Send, Zap, BookOpen, Briefcase, Code2,
  TrendingUp, Lightbulb, X, RefreshCw, AlertCircle, Sparkles,
  GraduationCap, FileText,
} from "lucide-react";
import { useChat } from "@/hooks/useChat";
import AIPairProgrammer from "@/components/AIPairProgrammer";

/* ─── Suggestion prompt cards ──────────────────────────────────────────── */
const SUGGESTIONS = [
  {
    icon: Briefcase,
    title: "Career Transition",
    prompt: "How do I transition from frontend to full-stack developer?",
    color: "#8b5cf6",
  },
  {
    icon: Code2,
    title: "Portfolio Projects",
    prompt: "What projects should I build to land my first dev job?",
    color: "#06b6d4",
  },
  {
    icon: TrendingUp,
    title: "Interview Prep",
    prompt: "How do I prepare for system design interviews?",
    color: "#10b981",
  },
  {
    icon: GraduationCap,
    title: "FAANG Roadmap",
    prompt: "Create a 3-month interview prep plan for FAANG",
    color: "#f59e0b",
  },
  {
    icon: Zap,
    title: "AI/ML Career",
    prompt: "How do I become an AI/ML engineer?",
    color: "#a855f7",
  },
  {
    icon: Lightbulb,
    title: "Learning Strategy",
    prompt: "What are the best learning strategies for developers?",
    color: "#f43f5e",
  },
];

/* ─── Inline markdown renderer ─────────────────────────────────────────── */
function MarkdownText({ text }: { text: string }) {
  if (!text) return null;
  const lines = text.split("\n");
  return (
    <>
      {lines.map((line, i) => {
        if (line.startsWith("### "))
          return <p key={i} className="font-bold text-sm mt-2 mb-1" style={{ color: "#c4b5fd" }}>{line.slice(4)}</p>;
        if (line.startsWith("## "))
          return <p key={i} className="font-bold text-sm mt-3 mb-1" style={{ color: "#e2d9f3" }}>{line.slice(3)}</p>;
        if (line.startsWith("- ") || line.startsWith("• ") || line.startsWith("* ")) {
          return (
            <p key={i} className="flex gap-2 leading-relaxed" style={{ marginBottom: "2px" }}>
              <span style={{ color: "var(--accent-violet)", flexShrink: 0 }}>•</span>
              <span>{renderInline(line.slice(2))}</span>
            </p>
          );
        }
        const numMatch = line.match(/^(\d+)\.\s(.*)/);
        if (numMatch)
          return (
            <p key={i} className="flex gap-2 leading-relaxed" style={{ marginBottom: "2px" }}>
              <span style={{ color: "var(--accent-violet)", flexShrink: 0, minWidth: "1.2rem" }}>{numMatch[1]}.</span>
              <span>{renderInline(numMatch[2])}</span>
            </p>
          );
        if (!line.trim()) return <div key={i} style={{ height: "6px" }} />;
        return <p key={i} className="leading-relaxed" style={{ marginBottom: "2px" }}>{renderInline(line)}</p>;
      })}
    </>
  );
}

function renderInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*.*?\*\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**"))
      return <strong key={i} style={{ color: "#f1f0ff" }}>{part.slice(2, -2)}</strong>;
    if (part.startsWith("`") && part.endsWith("`"))
      return (
        <code key={i} style={{ background: "rgba(139,92,246,0.2)", color: "#c4b5fd", padding: "1px 6px", borderRadius: 4, fontSize: "0.8em", fontFamily: "monospace" }}>
          {part.slice(1, -1)}
        </code>
      );
    return <span key={i}>{part}</span>;
  });
}

/* ─── Component ───────────────────────────────────────────────────────── */
export default function MentorPage() {
  const { messages, isLoading, error, sendMessage, cancelRequest, clearChat } = useChat({
    skills: ["HTML/CSS", "JavaScript", "React", "Git"],
    targetRole: "Full-Stack Developer",
    currentLevel: "Intermediate",
    completedRoadmaps: ["Web Fundamentals", "JavaScript Essentials"],
  });

  const [input, setInput] = useState("");
  const [mode, setMode] = useState<"chat" | "code">("chat");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const hasMessages = messages.length > 0;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSend = (text: string) => {
    if (!text.trim() || isLoading) return;
    sendMessage(text);
    setInput("");
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(input); }
    if (e.key === "Escape" && isLoading) cancelRequest();
  };

  /* height = viewport - topbar - page padding (top + bottom) */
  const chatHeight = "calc(100vh - 60px - 48px)";

  return (
    <div style={{ display: "flex", flexDirection: "column", height: chatHeight }}>

      {/* ── Mode toggle bar ───────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
          flexShrink: 0,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        {/* Title */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: "linear-gradient(135deg,#8b5cf6,#a855f7)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Bot size={20} color="white" />
          </div>
          <div>
            <h1 style={{ fontFamily: "Outfit,sans-serif", fontWeight: 800, fontSize: "1.2rem", lineHeight: 1.2 }}>
              AI Career Mentor
            </h1>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.72rem", color: "var(--text-muted)" }}>
              <span
                style={{
                  width: 7, height: 7, borderRadius: "50%",
                  background: isLoading && mode === "chat" ? "#f59e0b" : "#10b981",
                  display: "inline-block",
                }}
              />
              {isLoading && mode === "chat" ? "Thinking…" : "Powered by Groq AI (Llama 3.3 70B)"}
            </div>
          </div>
        </div>

        {/* Right buttons */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {/* Mode tabs */}
          <div
            style={{
              display: "flex",
              background: "rgba(0,0,0,0.3)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 10,
              padding: 3,
              gap: 2,
            }}
          >
            <button
              onClick={() => setMode("chat")}
              style={{
                padding: "6px 14px",
                fontSize: "0.78rem",
                fontWeight: 600,
                borderRadius: 7,
                border: "none",
                cursor: "pointer",
                background: mode === "chat" ? "#7c3aed" : "transparent",
                color: mode === "chat" ? "#fff" : "#64748b",
                transition: "all 0.2s",
              }}
            >
              Chat Mode
            </button>
            <button
              onClick={() => setMode("code")}
              style={{
                padding: "6px 14px",
                fontSize: "0.78rem",
                fontWeight: 600,
                borderRadius: 7,
                border: "none",
                cursor: "pointer",
                background: mode === "code" ? "#7c3aed" : "transparent",
                color: mode === "code" ? "#fff" : "#64748b",
                display: "flex",
                alignItems: "center",
                gap: 5,
                transition: "all 0.2s",
              }}
            >
              <Code2 size={12} /> Pair Programming
            </button>
          </div>

          {mode === "chat" && hasMessages && (
            <button
              onClick={() => { clearChat(); }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "7px 12px",
                fontSize: "0.78rem",
                fontWeight: 500,
                borderRadius: 8,
                border: "1px solid var(--border-subtle)",
                background: "transparent",
                color: "var(--text-secondary)",
                cursor: "pointer",
              }}
            >
              <RefreshCw size={13} /> New Chat
            </button>
          )}
        </div>
      </div>

      {/* ── Code mode ────────────────────────────────────────────────── */}
      {mode === "code" ? (
        <div style={{ flex: 1, overflow: "hidden" }}>
          <AIPairProgrammer />
        </div>
      ) : (
        /* ── Chat mode ───────────────────────────────────────────────── */
        <>
          {/* Error banner */}
          {error && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 14px",
                borderRadius: 10,
                marginBottom: 12,
                background: "rgba(244,63,94,0.1)",
                border: "1px solid rgba(244,63,94,0.3)",
                color: "#fda4af",
                fontSize: "0.82rem",
                flexShrink: 0,
              }}
            >
              <AlertCircle size={14} />
              <span style={{ flex: 1 }}>{error}</span>
              <button onClick={() => cancelRequest()} style={{ opacity: 0.7, background: "none", border: "none", cursor: "pointer", color: "inherit" }}>
                <X size={12} />
              </button>
            </div>
          )}

          {/* ── WELCOME SCREEN (no messages yet) ─────────────────────── */}
          {!hasMessages ? (
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 32,
                paddingBottom: 24,
              }}
            >
              {/* Welcome heading */}
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 20,
                    background: "linear-gradient(135deg,#8b5cf6,#a855f7)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 20px",
                    boxShadow: "0 0 40px rgba(139,92,246,0.4)",
                  }}
                >
                  <Sparkles size={28} color="white" />
                </div>
                <h2
                  style={{
                    fontFamily: "Outfit,sans-serif",
                    fontWeight: 800,
                    fontSize: "clamp(1.5rem,4vw,2rem)",
                    marginBottom: 8,
                    color: "var(--text-primary)",
                  }}
                >
                  Good day, Learner! 👋
                </h2>
                <p style={{ fontSize: "0.95rem", color: "var(--text-secondary)", maxWidth: 400 }}>
                  I&apos;m your AI Career Mentor. Ask me anything about careers, coding, interviews, or learning strategies.
                </p>
              </div>

              {/* 6 prompt cards */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
                  gap: 12,
                  width: "100%",
                  maxWidth: 760,
                }}
              >
                {SUGGESTIONS.map(({ icon: Icon, title, prompt, color }) => (
                  <button
                    key={prompt}
                    onClick={() => handleSend(prompt)}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 12,
                      padding: "14px 16px",
                      borderRadius: 14,
                      border: "1px solid rgba(139,92,246,0.14)",
                      background: "rgba(20,20,32,0.7)",
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = "rgba(139,92,246,0.42)";
                      e.currentTarget.style.background = "rgba(139,92,246,0.07)";
                      e.currentTarget.style.transform = "translateY(-2px)";
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = "rgba(139,92,246,0.14)";
                      e.currentTarget.style.background = "rgba(20,20,32,0.7)";
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                  >
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        background: `${color}20`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        marginTop: 1,
                      }}
                    >
                      <Icon size={15} style={{ color }} />
                    </div>
                    <div>
                      <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: 2 }}>
                        {title}
                      </div>
                      <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", lineHeight: 1.4 }}>
                        {prompt}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* ── Chat messages ─────────────────────────────────────── */
            <div
              style={{ flex: 1, overflowY: "auto", marginBottom: 12, paddingRight: 4 }}
              className="space-y-4"
            >
              {messages.map(m => (
                <div
                  key={m.id}
                  style={{
                    display: "flex",
                    justifyContent: m.role === "user" ? "flex-end" : "flex-start",
                    alignItems: "flex-end",
                    gap: 8,
                  }}
                >
                  {m.role === "assistant" && (
                    <div
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: "50%",
                        background: "linear-gradient(135deg,#8b5cf6,#a855f7)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        marginBottom: 4,
                      }}
                    >
                      <Bot size={14} color="white" />
                    </div>
                  )}
                  <div
                    className={m.role === "user" ? "chat-bubble-user" : "chat-bubble-ai"}
                    style={{ maxWidth: "78%" }}
                  >
                    <div style={{ fontSize: "0.875rem" }}>
                      {m.role === "assistant" ? <MarkdownText text={m.content} /> : <p>{m.content}</p>}
                    </div>
                    <div style={{ fontSize: "0.65rem", marginTop: 6, opacity: 0.5 }}>
                      {m.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {isLoading && (
                <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
                  <div
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: "50%",
                      background: "linear-gradient(135deg,#8b5cf6,#a855f7)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Bot size={14} color="white" />
                  </div>
                  <div className="chat-bubble-ai">
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      {[0, 1, 2].map(i => (
                        <div
                          key={i}
                          style={{
                            width: 7,
                            height: 7,
                            borderRadius: "50%",
                            background: "var(--accent-violet)",
                            animation: `ping 1s ease-in-out ${i * 0.2}s infinite`,
                            opacity: 0.75,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          )}

          {/* ── Input bar ─────────────────────────────────────────────── */}
          <div style={{ flexShrink: 0 }}>
            <div
              style={{
                display: "flex",
                gap: 8,
                alignItems: "center",
                background: "rgba(17,17,25,0.9)",
                border: "1px solid rgba(139,92,246,0.22)",
                borderRadius: 14,
                padding: "8px 8px 8px 16px",
              }}
            >
              <Lightbulb size={14} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything — coding, career, interviews, projects…"
                disabled={isLoading}
                style={{
                  flex: 1,
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  color: "var(--text-primary)",
                  fontSize: "0.9rem",
                  fontFamily: "Inter,sans-serif",
                }}
              />
              {isLoading ? (
                <button
                  onClick={cancelRequest}
                  title="Cancel (Esc)"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    padding: "8px 14px",
                    borderRadius: 10,
                    border: "1px solid var(--border-subtle)",
                    background: "transparent",
                    color: "var(--text-secondary)",
                    cursor: "pointer",
                    fontSize: "0.78rem",
                    flexShrink: 0,
                  }}
                >
                  <X size={14} /> Cancel
                </button>
              ) : (
                <button
                  onClick={() => handleSend(input)}
                  disabled={!input.trim()}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    border: "none",
                    background: input.trim() ? "linear-gradient(135deg,#8b5cf6,#6366f1)" : "rgba(139,92,246,0.15)",
                    color: input.trim() ? "#fff" : "#475569",
                    cursor: input.trim() ? "pointer" : "not-allowed",
                    flexShrink: 0,
                    transition: "all 0.2s",
                  }}
                >
                  <Send size={16} />
                </button>
              )}
            </div>
            <p style={{ textAlign: "center", marginTop: 8, fontSize: "0.68rem", color: "var(--text-muted)" }}>
              Powered by Groq AI (Llama 3.3 70B) · Press Enter to send · Esc to cancel
            </p>
          </div>
        </>
      )}
    </div>
  );
}
