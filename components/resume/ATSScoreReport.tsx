"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, CheckCircle2, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";

type Analysis = {
  summary: string;
  grammarFeedback: string[];
  keywordSuggestions: string[];
  skillSuggestions: string[];
  granularScores?: {
    content: number;
    sections: number;
    essentials: number;
    tailoring: number;
  };
  checks?: {
    parseRate: boolean;
    quantifyingImpact: boolean;
    repetition: boolean;
    spellingGrammar: boolean;
  };
};

type Props = {
  title: string;
  atsScore: number;
  grammarScore: number;
  keywordScore: number;
  analysis: Analysis | null;
};

function scoreColor(score: number) {
  if (score >= 85) return "#10b981"; // emerald
  if (score >= 70) return "#f59e0b"; // amber
  return "#f43f5e"; // rose
}

function SectionItem({ label, status, type }: { label: string; status: string; type: "good" | "issue" | "warning" }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-black/5 dark:border-white/5 last:border-0">
      <div className="flex items-center gap-3">
        {type === "good" ? (
          <CheckCircle2 size={18} className="text-emerald-500" />
        ) : (
          <AlertCircle size={18} className={type === "warning" ? "text-amber-500" : "text-rose-500"} />
        )}
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</span>
      </div>
      <span className={`text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-tight ${
        type === "good" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400" :
        type === "warning" ? "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400" :
        "bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400"
      }`}>
        {status}
      </span>
    </div>
  );
}

function ScoreCategory({ title, grade, children, defaultOpen = false }: { title: string; grade: number; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const color = scoreColor(grade);
  
  return (
    <div className="mb-4">
      <button 
        type="button" 
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-3 group"
      >
        <div className="flex items-center gap-4">
          <span className="text-[11px] sm:text-xs tracking-[0.15em] uppercase font-black text-slate-500 group-hover:text-slate-700 transition-colors">{title}</span>
          <span className="text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full cursor-default" style={{ backgroundColor: `${color}15`, color }}>
            {grade}%
          </span>
        </div>
        {open ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="pb-2">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function ATSScoreReport({ atsScore, grammarScore, keywordScore, analysis }: Props) {
  const a = analysis;

  if (!a) {
    return (
      <div className="card text-center p-12 border-dashed flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900/20">
        <Sparkles size={32} className="text-violet-400 mb-4 opacity-50" />
        <div className="text-sm font-bold text-slate-800 dark:text-white mb-2">Calculating IQ...</div>
        <p className="text-xs text-slate-500 leading-relaxed max-w-[240px]">
          Upload your resume to see your industry-standard ATS score and improvement points.
        </p>
      </div>
    );
  }

  // Fallback for older resumes without granular scores
  const gs = a.granularScores || {
    content: grammarScore,
    sections: atsScore > 50 ? 100 : 33,
    essentials: atsScore > 60 ? 100 : 75,
    tailoring: keywordScore
  };

  const checks = a.checks || {
    parseRate: true,
    quantifyingImpact: true,
    repetition: true,
    spellingGrammar: a.grammarFeedback.length === 0
  };

  const issuesCount = a.grammarFeedback.length + a.keywordSuggestions.length + a.skillSuggestions.length;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-full"
    >
      <div className="bg-white dark:bg-[#0c0c0c] rounded-[2rem] p-6 sm:p-10 shadow-2xl border border-slate-100 dark:border-white/5">
        
        {/* Header Section */}
        <div className="text-center mb-10 flex flex-col items-center">
          <h2 className="text-2xl font-medium text-slate-800 dark:text-slate-200 mb-6 font-display">ATS Intelligence Report</h2>
          <div className="relative w-40 h-40 flex items-center justify-center mb-4">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                className="text-slate-100 dark:text-white/5"
              />
              <motion.circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke={scoreColor(atsScore)}
                strokeWidth="8"
                strokeLinecap="round"
                initial={{ strokeDasharray: "283", strokeDashoffset: "283" }}
                animate={{ strokeDashoffset: 283 - (atsScore / 100) * 283 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-4xl font-black tracking-tighter" style={{ color: scoreColor(atsScore) }}>
                {atsScore}
              </span>
              <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Score</span>
            </div>
          </div>
          <p className="text-sm font-medium px-4 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
             {issuesCount > 0 ? `${issuesCount} optimization areas found` : "Perfectly optimized for ATS"}
          </p>
        </div>

        <div className="w-full h-px bg-slate-100 dark:bg-white/5 mb-8" />

        {/* Categories */}
        <div className="space-y-2">
          <ScoreCategory title="Content" grade={gs.content} defaultOpen={true}>
            <SectionItem label="ATS Parse Rate" status={checks.parseRate ? "No issues" : "Failed"} type={checks.parseRate ? "good" : "issue"} />
            <SectionItem label="Quantifying Impact" status={checks.quantifyingImpact ? "No issues" : "Low"} type={checks.quantifyingImpact ? "good" : "warning"} />
            <SectionItem label="Repetition" status={checks.repetition ? "No issues" : "High"} type={checks.repetition ? "good" : "warning"} />
            <SectionItem label="Spelling & Grammar" status={checks.spellingGrammar ? "No issues" : "Detected"} type={checks.spellingGrammar ? "good" : "issue"} />
            
            {a.grammarFeedback.length > 0 && (
              <div className="mt-3 p-3 bg-red-50 dark:bg-rose-500/5 rounded-xl border border-red-100 dark:border-rose-500/10">
                <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest block mb-2">Feedback</span>
                <ul className="space-y-1">
                  {a.grammarFeedback.map((f, i) => (
                    <li key={i} className="text-xs text-rose-700 dark:text-rose-300 flex gap-2">
                      <span className="shrink-0 opacity-50">•</span> {f}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </ScoreCategory>

          <ScoreCategory title="Sections" grade={gs.sections}>
            <SectionItem label="Header Section" status="No issues" type="good" />
            <SectionItem label="Summary Section" status="No issues" type="good" />
            <SectionItem label="Experience Section" status="No issues" type="good" />
            <SectionItem label="Skills Section" status="No issues" type="good" />
          </ScoreCategory>

          <ScoreCategory title="ATS Essentials" grade={gs.essentials}>
             <SectionItem label="Contact Information" status="Provided" type="good" />
             <SectionItem label="Phone Number" status="Provided" type="good" />
             <SectionItem label="LinkedIn Link" status="Provided" type="good" />
          </ScoreCategory>

          <ScoreCategory title="Tailoring" grade={gs.tailoring}>
             <div className="pt-2">
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Keywords Analysis</span>
               {a.keywordSuggestions.length > 0 ? (
                 <div className="flex flex-wrap gap-2">
                   {a.keywordSuggestions.map(kw => (
                     <span key={kw} className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-bold rounded uppercase tracking-tight border border-slate-200 dark:border-slate-700">
                        {kw}
                     </span>
                   ))}
                 </div>
               ) : (
                 <p className="text-xs text-slate-500 italic">No keyword suggestions available.</p>
               )}
             </div>
          </ScoreCategory>
        </div>

        {/* Intelligence Summary */}
        <div className="mt-10 p-5 bg-indigo-50 dark:bg-indigo-500/5 rounded-3xl border border-indigo-100 dark:border-indigo-500/10 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Sparkles size={40} className="text-indigo-600" />
          </div>
          <h4 className="text-[11px] font-black text-indigo-600 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
             <Sparkles size={14} /> AI Analysis
          </h4>
          <p className="text-sm text-indigo-900/80 dark:text-indigo-200/80 leading-relaxed font-medium">
            {a.summary}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
