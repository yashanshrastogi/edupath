"use client";

import { useState } from "react";
import { Trash2, Pencil, Sparkles, ChevronUp, ChevronDown, Check, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export type ProjectEntry = {
  id: string;
  title: string;
  description: string;
  fromEduPath?: boolean;
};

interface Props {
  projects: ProjectEntry[];
  onChange: (projects: ProjectEntry[]) => void;
}

function ProjectCard({
  project,
  index,
  total,
  onUpdate,
  onRemove,
  onMoveUp,
  onMoveDown,
}: {
  project: ProjectEntry;
  index: number;
  total: number;
  onUpdate: (p: ProjectEntry) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ title: project.title, description: project.description });
  const [improving, setImproving] = useState(false);
  const [improveError, setImproveError] = useState("");

  const save = () => {
    onUpdate({ ...project, ...draft });
    setEditing(false);
  };

  const cancel = () => {
    setDraft({ title: project.title, description: project.description });
    setEditing(false);
  };

  const improveWithAI = async () => {
    setImproving(true);
    setImproveError("");
    try {
      const res = await fetch("/api/resumes/improve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: draft.description }),
      });
      const data = await res.json() as { improved?: string; error?: string };
      if (data.improved) {
        setDraft((d) => ({ ...d, description: data.improved! }));
      } else {
        setImproveError(data.error ?? "AI improvement failed.");
      }
    } catch {
      setImproveError("Network error.");
    } finally {
      setImproving(false);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="card !p-4 space-y-3"
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-2">
        {editing ? (
          <input
            className="input-field !py-1 text-sm font-semibold flex-1"
            value={draft.title}
            onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
            placeholder="Project title"
          />
        ) : (
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="font-semibold text-sm truncate">{project.title}</span>
            {project.fromEduPath && (
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide"
                style={{ background: "var(--accent-indigo)22", color: "var(--accent-indigo)" }}>
                EduPath
              </span>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={onMoveUp}
            disabled={index === 0}
            className="p-1 rounded hover:opacity-70 disabled:opacity-20 transition-opacity"
            title="Move up"
          >
            <ChevronUp size={14} />
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={index === total - 1}
            className="p-1 rounded hover:opacity-70 disabled:opacity-20 transition-opacity"
            title="Move down"
          >
            <ChevronDown size={14} />
          </button>

          {editing ? (
            <>
              <button type="button" onClick={save} className="p-1 rounded text-emerald-500 hover:opacity-70 transition-opacity" title="Save">
                <Check size={14} />
              </button>
              <button type="button" onClick={cancel} className="p-1 rounded text-rose-500 hover:opacity-70 transition-opacity" title="Cancel">
                <X size={14} />
              </button>
            </>
          ) : (
            <>
              <button type="button" onClick={() => setEditing(true)} className="p-1 rounded hover:opacity-70 transition-opacity" title="Edit"
                style={{ color: "var(--text-secondary)" }}>
                <Pencil size={13} />
              </button>
              <button type="button" onClick={onRemove} className="p-1 rounded text-rose-400 hover:text-rose-600 transition-colors" title="Delete">
                <Trash2 size={13} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Description */}
      {editing ? (
        <div className="space-y-2">
          <textarea
            className="input-field text-xs w-full"
            rows={3}
            value={draft.description}
            onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
            placeholder="Project description…"
          />
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={improveWithAI}
              disabled={improving}
              className="btn-secondary !text-xs !py-1.5 !px-3 flex items-center gap-1.5"
            >
              {improving ? (
                <span className="inline-block w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <Sparkles size={12} />
              )}
              {improving ? "Improving…" : "Improve with AI"}
            </button>
            {improveError && <span className="text-xs text-rose-500">{improveError}</span>}
          </div>
        </div>
      ) : (
        <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
          {project.description || <em className="opacity-50">No description. Click edit to add one.</em>}
        </p>
      )}
    </motion.div>
  );
}

export function ProjectCardEditor({ projects, onChange }: Props) {
  const update = (index: number, updated: ProjectEntry) => {
    const next = [...projects];
    next[index] = updated;
    onChange(next);
  };

  const remove = (index: number) => {
    onChange(projects.filter((_, i) => i !== index));
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const next = [...projects];
    [next[index - 1], next[index]] = [next[index], next[index - 1]];
    onChange(next);
  };

  const moveDown = (index: number) => {
    if (index === projects.length - 1) return;
    const next = [...projects];
    [next[index], next[index + 1]] = [next[index + 1], next[index]];
    onChange(next);
  };

  const addBlank = () => {
    onChange([
      ...projects,
      { id: `custom-${Date.now()}`, title: "New Project", description: "" },
    ]);
  };

  return (
    <div className="space-y-3">
      <AnimatePresence>
        {projects.map((p, i) => (
          <ProjectCard
            key={p.id}
            project={p}
            index={i}
            total={projects.length}
            onUpdate={(updated) => update(i, updated)}
            onRemove={() => remove(i)}
            onMoveUp={() => moveUp(i)}
            onMoveDown={() => moveDown(i)}
          />
        ))}
      </AnimatePresence>

      <button
        type="button"
        onClick={addBlank}
        className="w-full py-2.5 rounded-xl border border-dashed text-xs font-semibold transition-colors hover:opacity-80"
        style={{ borderColor: "var(--border-subtle)", color: "var(--text-muted)" }}
      >
        + Add Project
      </button>
    </div>
  );
}
