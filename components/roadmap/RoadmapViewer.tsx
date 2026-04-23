"use client";

import { useState } from "react";
import { BookOpen, CheckCircle, ChevronDown, ChevronRight, PlayCircle, FileText, Award, Terminal, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type RoadmapViewerProps = {
  roadmap: any; // We use any to avoid massive type imports for now, but it's strongly typed from Prisma
  onDeleted?: () => void;
};

export function RoadmapViewer({ roadmap, onDeleted }: RoadmapViewerProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [expandedModuleId, setExpandedModuleId] = useState<string | null>(
    roadmap.modules[0]?.id || null
  );

  const completedModules = roadmap.modules.filter((m: any) => m.status === "COMPLETED").length;
  const progress = Math.round((completedModules / Math.max(roadmap.modules.length, 1)) * 100);

  return (
    <div className="card p-0 overflow-hidden" style={{ borderLeft: "3px solid var(--accent-violet)" }}>
      {/* Header */}
      <div className="p-5 md:p-6 pb-4 relative" style={{ background: "rgba(255,255,255,0.01)" }}>
        <button 
          disabled={isDeleting}
          onClick={async () => {
            if(!confirm("Are you sure you want to permanently delete this roadmap?")) return;
            setIsDeleting(true);
            try {
              const res = await fetch(`/api/roadmaps/${roadmap.id}`, { method: 'DELETE' });
              if(res.ok && onDeleted) onDeleted();
            } finally {
              setIsDeleting(false);
            }
          }}
          title="Delete Roadmap"
          className="absolute top-4 right-4 p-2 text-slate-500 hover:text-rose-400 bg-white/[0.02] hover:bg-white/[0.05] rounded-lg transition-colors"
        >
          <Trash2 size={16} />
        </button>

        <div className="flex flex-wrap items-start justify-between gap-4 mb-3 pr-12">
          <div>
            <h2 className="text-2xl font-bold font-display mb-1">{roadmap.title}</h2>
            <p className="text-sm max-w-2xl" style={{ color: "var(--text-secondary)" }}>{roadmap.summary}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>Estimated Time</div>
            <div className="text-lg font-bold font-display" style={{ color: "var(--accent-cyan)" }}>{roadmap.estimatedWeeks} Weeks</div>
          </div>
        </div>
        <div className="flex items-center gap-3 mt-4">
          <div className="text-sm font-bold" style={{ color: "var(--accent-emerald)" }}>{progress}%</div>
          <div className="flex-1 h-2 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${progress}%`, background: "linear-gradient(90deg, #10b981, #06b6d4)" }}
            />
          </div>
          <span className="badge badge-cyan text-xs inline-flex">{roadmap.status.replace("_", " ")}</span>
        </div>
      </div>

      {/* Curriculum */}
      <div className="border-t divide-y" style={{ borderColor: "var(--border-subtle)" }}>
        {roadmap.modules.map((module: any) => {
          const isExpanded = expandedModuleId === module.id;
          const isComplete = module.status === "COMPLETED";

          return (
            <div key={module.id} className="bg-[rgba(255,255,255,0.005)]">
              {/* Module Header (Clickable) */}
              <button
                onClick={() => setExpandedModuleId(isExpanded ? null : module.id)}
                className="w-full text-left p-5 md:p-6 flex items-start sm:items-center justify-between gap-4 transition-colors hover:bg-white/[0.02]"
              >
                <div className="flex gap-4 items-start sm:items-center">
                  <div className={`mt-1 sm:mt-0 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isComplete ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
                    {isComplete ? <CheckCircle size={16} /> : <BookOpen size={16} />}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      {module.title}
                    </h3>
                    <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
                      Wks {module.weekStart}-{module.weekEnd} • {module.lessons?.length || 0} Lessons
                    </p>
                  </div>
                </div>
                <div className="text-slate-400">
                  {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                </div>
              </button>

              {/* Module Content (Expanded) */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden bg-black/20"
                  >
                    <div className="p-5 md:p-6 md:pl-20 border-t border-white/5 space-y-6">
                      <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                        {module.description}
                      </p>

                      {/* Lessons List */}
                      {module.lessons && module.lessons.length > 0 && (
                        <div className="space-y-3">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Curriculum</h4>
                          {module.lessons.map((lesson: any) => (
                            <div key={lesson.id} className="card p-4 border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-colors group cursor-pointer">
                              <div className="flex justify-between items-start gap-4">
                                <div>
                                  <h5 className="font-semibold text-sm mb-1">{lesson.title}</h5>
                                  <p className="text-xs line-clamp-2" style={{ color: "var(--text-secondary)" }}>{lesson.content}</p>
                                </div>
                                <span className={`badge text-[10px] ${lesson.difficulty === 'BEGINNER' ? 'badge-emerald' : 'badge-violet'}`}>
                                  {lesson.estimatedMins} min
                                </span>
                              </div>
                              
                              {/* Sub-resources */}
                              <div className="flex flex-wrap gap-3 mt-3 pt-3 border-t border-white/5">
                                {lesson.videos?.map((v: any, i: number) => (
                                  <a href={v.youtubeUrl} target="_blank" rel="noopener noreferrer" key={i} className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 font-medium transition-colors">
                                    <PlayCircle size={14} /> {v.title}
                                  </a>
                                ))}
                                {lesson.articles?.map((a: any, i: number) => (
                                  <a href={a.url} target="_blank" rel="noopener noreferrer" key={i} className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors">
                                    <FileText size={14} /> {a.title}
                                  </a>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Practice & Certifications */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {module.practiceProblems && module.practiceProblems.length > 0 && (
                          <div>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Practice Problems</h4>
                            {module.practiceProblems.map((prac: any, i: number) => (
                              <div key={i} className="flex items-center gap-2 p-3 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-200 text-xs mb-2">
                                <Terminal size={14} className="text-orange-400" /> {prac.title}
                              </div>
                            ))}
                          </div>
                        )}
                        {module.certifications && module.certifications.length > 0 && (
                          <div>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Certifications</h4>
                            {module.certifications.map((cert: any, i: number) => (
                              <div key={i} className="flex items-center gap-2 p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-200 text-xs mb-2">
                                <Award size={14} className="text-cyan-400" /> {cert.certificateName} ({cert.provider})
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
