"use client";

import { useState, useRef } from "react";
import { X, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  skills: string[];
  onChange: (skills: string[]) => void;
}

export function SkillTagEditor({ skills, onChange }: Props) {
  const [inputValue, setInputValue] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addSkill = () => {
    const trimmed = inputValue.trim();
    if (trimmed && !skills.includes(trimmed)) {
      onChange([...skills, trimmed]);
    }
    setInputValue("");
    setIsAdding(false);
  };

  const removeSkill = (skill: string) => {
    onChange(skills.filter((s) => s !== skill));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addSkill();
    }
    if (e.key === "Escape") {
      setInputValue("");
      setIsAdding(false);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2 min-h-[36px]">
        <AnimatePresence>
          {skills.map((skill) => (
            <motion.span
              key={skill}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
              style={{
                background: "var(--accent-indigo, #6366f1)22",
                color: "var(--accent-indigo, #6366f1)",
                border: "1px solid var(--accent-indigo, #6366f1)44",
              }}
            >
              {skill}
              <button
                type="button"
                onClick={() => removeSkill(skill)}
                className="hover:opacity-70 transition-opacity"
                aria-label={`Remove ${skill}`}
              >
                <X size={11} strokeWidth={2.5} />
              </button>
            </motion.span>
          ))}
        </AnimatePresence>

        {isAdding ? (
          <motion.input
            ref={inputRef}
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "auto" }}
            className="input-field !py-1 !px-2 text-xs min-w-[120px] max-w-[180px]"
            placeholder="Skill name…"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={addSkill}
            autoFocus
          />
        ) : (
          <button
            type="button"
            onClick={() => {
              setIsAdding(true);
              setTimeout(() => inputRef.current?.focus(), 50);
            }}
            className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border border-dashed transition-colors hover:opacity-80"
            style={{ borderColor: "var(--border-subtle)", color: "var(--text-muted)" }}
          >
            <Plus size={11} /> Add Skill
          </button>
        )}
      </div>

      {skills.length === 0 && !isAdding && (
        <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>
          No skills yet. Import from EduPath or add manually.
        </p>
      )}
    </div>
  );
}
