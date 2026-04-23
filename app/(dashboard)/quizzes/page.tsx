"use client";

import { useState } from "react";
import { BrainCircuit, Check, CheckCircle, ChevronRight, Play, RefreshCw, Star } from "lucide-react";

type Question = { id: string; prompt: string; options: string[]; difficulty: string };
type QuizResult = { id: string; skill: string; score: number; level: string; feedback: string | null };

const LEVEL_COLORS: Record<string, string> = {
  EXPERT: "#f59e0b",
  ADVANCED: "#8b5cf6",
  INTERMEDIATE: "#06b6d4",
  BEGINNER: "#10b981",
};

export default function QuizzesPage() {
  const [mode, setMode] = useState<"MANUAL" | "RESUME_BASED">("MANUAL");
  const [skill, setSkill] = useState("JavaScript");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<QuizResult | null>(null);
  const [statusMsg, setStatusMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Pagination for questions to make it feel like a real quiz app
  const [currentQIndex, setCurrentQIndex] = useState(0);

  const loadQuestions = async () => {
    setLoading(true);
    setStatusMsg("");
    const response = await fetch(`/api/quizzes?skill=${encodeURIComponent(skill)}&mode=${mode}`);
    setLoading(false);

    if (!response.ok) {
      setStatusMsg("Sign in and connect PostgreSQL to use the quiz system.");
      return;
    }

    const data = await response.json();
    setQuestions(data);
    setAnswers({});
    setResult(null);
    setSubmitted(false);
    setCurrentQIndex(0);
    if (data.length === 0) {
      setStatusMsg("No questions available for this skill yet.");
    }
  };

  const submitQuiz = async () => {
    setLoading(true);
    const response = await fetch("/api/quizzes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        skill,
        mode,
        answers: Object.entries(answers).map(([questionId, selectedIndex]) => ({ questionId, selectedIndex })),
      }),
    });
    setLoading(false);

    if (!response.ok) {
      const payload = await response.json();
      setStatusMsg(payload.error ?? "Unable to submit quiz.");
      return;
    }

    const data = await response.json();
    setResult(data);
    setSubmitted(true);
  };

  const currentQ = questions[currentQIndex];

  return (
    <div className="space-y-6 fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-extrabold font-display mb-1 flex items-center gap-2">
            <BrainCircuit size={24} style={{ color: "var(--accent-emerald)" }} /> Skill Verification
          </h1>
          <p className="text-sm max-w-xl" style={{ color: "var(--text-secondary)" }}>
            Take adaptive assessments to verify your skills. Results appear on your profile and boost your rank.
          </p>
        </div>
      </div>

      {/* Setup / Results Split */}
      {!submitted && questions.length === 0 && (
        <div className="card max-w-2xl mx-auto mt-10">
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-4" style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)" }}>
              <BrainCircuit size={32} style={{ color: "#10b981" }} />
            </div>
            <h2 className="text-xl font-bold font-display">Start Assessment</h2>
            <p className="text-sm mt-2" style={{ color: "var(--text-secondary)" }}>Choose manual skill testing or let our AI scan your saved resume for skills.</p>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex p-1 rounded-xl" style={{ background: "rgba(22,22,31,0.6)", border: "1px solid var(--border-subtle)" }}>
              <button
                className={`flex-1 py-3 text-sm font-semibold rounded-lg transition-all ${mode === "MANUAL" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "text-slate-400"}`}
                onClick={() => setMode("MANUAL")}
              >
                Manual Skill Entry
              </button>
              <button
                className={`flex-1 py-3 text-sm font-semibold rounded-lg transition-all ${mode === "RESUME_BASED" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "text-slate-400"}`}
                onClick={() => setMode("RESUME_BASED")}
              >
                Auto (Resume Scan)
              </button>
            </div>

            <div className="flex gap-2">
              <input
                className="input-field flex-1 text-center font-semibold"
                value={skill}
                onChange={(e) => setSkill(e.target.value)}
                placeholder={mode === "MANUAL" ? "e.g. React, Python, AWS..." : "Confirm skill target..."}
              />
            </div>

            <button className="btn-primary w-full justify-center py-3 text-base mt-2" onClick={() => void loadQuestions()} disabled={loading}>
              {loading ? <RefreshCw className="animate-spin" size={18} /> : <Play size={18} />}
              {loading ? "Generating..." : "Generate Quiz"}
            </button>

            {statusMsg && <div className="text-center text-sm text-rose-400 font-medium">{statusMsg}</div>}
          </div>
        </div>
      )}

      {/* Active Quiz Area */}
      {!submitted && questions.length > 0 && currentQ && (
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="flex items-center justify-between text-sm font-semibold">
            <span style={{ color: "var(--text-muted)" }}>Question {currentQIndex + 1} of {questions.length}</span>
            <span className="badge badge-emerald">{currentQ.difficulty}</span>
          </div>

          {/* Progress Bar */}
          <div className="h-1.5 w-full rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
            <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${((currentQIndex + 1) / questions.length) * 100}%` }} />
          </div>

          <div className="card py-8 px-6 md:px-10">
            <h2 className="text-xl md:text-2xl font-bold font-display leading-relaxed mb-8">{currentQ.prompt}</h2>

            <div className="space-y-3">
              {currentQ.options.map((option, index) => {
                const isSelected = answers[currentQ.id] === index;
                return (
                  <button
                    key={index}
                    onClick={() => setAnswers({ ...answers, [currentQ.id]: index })}
                    className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-4 ${isSelected
                        ? 'border-emerald-500 bg-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                        : 'border-white/10 bg-white/[0.02] hover:border-emerald-500/50 hover:bg-emerald-500/5'
                      }`}
                  >
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${isSelected ? 'border-emerald-500 bg-emerald-500 text-black' : 'border-slate-600'
                      }`}>
                      {isSelected && <Check size={14} strokeWidth={3} />}
                    </div>
                    <span className={`text-[15px] leading-relaxed ${isSelected ? 'text-emerald-100 font-medium' : 'text-slate-300'}`}>
                      {option}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between pt-4">
            <button
              className="btn-ghost"
              onClick={() => setCurrentQIndex(Math.max(0, currentQIndex - 1))}
              disabled={currentQIndex === 0}
              style={{ opacity: currentQIndex === 0 ? 0.3 : 1 }}
            >
              Previous
            </button>

            {currentQIndex < questions.length - 1 ? (
              <button
                className="btn-primary px-8"
                onClick={() => setCurrentQIndex(currentQIndex + 1)}
              >
                Next <ChevronRight size={16} />
              </button>
            ) : (
              <button
                className="btn-primary px-8 bg-emerald-600 hover:bg-emerald-500"
                onClick={() => void submitQuiz()}
                disabled={loading || Object.keys(answers).length !== questions.length}
              >
                {loading ? "Scoring..." : "Submit Answers"} <CheckCircle size={16} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Results View */}
      {submitted && result && (
        <div className="max-w-2xl mx-auto fade-in-up">
          <div className="card text-center relative overflow-hidden" style={{ border: `1px solid ${LEVEL_COLORS[result.level] ?? "#10b981"}` }}>
            <div className="absolute top-0 right-0 p-6 opacity-10">
              <Star size={120} style={{ color: LEVEL_COLORS[result.level] }} />
            </div>

            <div className="relative z-10">
              <h2 className="text-2xl font-bold font-display mb-1">{result.skill} Assessment Complete</h2>
              <p className="text-sm mb-8" style={{ color: "var(--text-secondary)" }}>Your responses have been analyzed.</p>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-black/20 rounded-2xl p-6 border border-white/5">
                  <div className="text-sm font-semibold mb-2" style={{ color: "var(--text-muted)" }}>Final Score</div>
                  <div className="text-5xl font-black font-display tracking-tighter" style={{ color: LEVEL_COLORS[result.level] ?? "#10b981" }}>
                    {result.score}%
                  </div>
                </div>
                <div className="bg-black/20 rounded-2xl p-6 border border-white/5">
                  <div className="text-sm font-semibold mb-2" style={{ color: "var(--text-muted)" }}>Assessed Level</div>
                  <div className="text-2xl mt-3 font-bold font-display" style={{ color: LEVEL_COLORS[result.level] ?? "#10b981" }}>
                    {result.level}
                  </div>
                </div>
              </div>

              {result.feedback && (
                <div className="bg-white/[0.03] rounded-xl p-5 text-left border border-white/5 mb-8">
                  <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                    <BrainCircuit size={15} style={{ color: "var(--accent-violet)" }} /> AI Feedback
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{result.feedback}</p>
                </div>
              )}

              <div className="flex justify-center gap-3">
                <button className="btn-primary" onClick={() => { setSubmitted(false); setQuestions([]); setSkill(""); }}>
                  Take Another Assessment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
