"use client";

import { motion } from "framer-motion";

type Props = {
  value: "leetcode" | "codeforces";
  onChange: (next: "leetcode" | "codeforces") => void;
};

const options: Array<{ id: "leetcode" | "codeforces"; label: string }> = [
  { id: "leetcode", label: "LeetCode" },
  { id: "codeforces", label: "Codeforces" },
];

export function CodingStatsToggle({ value, onChange }: Props) {
  return (
    <div
      className="relative inline-flex items-center rounded-xl p-1"
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
      role="tablist"
      aria-label="Coding stats platform"
    >
      <motion.div
        className="absolute top-1 bottom-1 rounded-lg"
        initial={false}
        animate={{
          left: value === "leetcode" ? 4 : "50%",
          right: value === "leetcode" ? "50%" : 4,
        }}
        transition={{ type: "spring", bounce: 0, duration: 0.35 }}
        style={{
          background: "linear-gradient(90deg, rgba(139,92,246,0.25), rgba(6,182,212,0.18))",
          border: "1px solid rgba(139,92,246,0.25)",
        }}
      />

      {options.map((opt) => {
        const active = opt.id === value;
        return (
          <button
            key={opt.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt.id)}
            className="relative z-10 px-4 py-2 text-xs font-semibold rounded-lg transition-colors"
            style={{
              color: active ? "#f1f0ff" : "var(--text-muted)",
              minWidth: 120,
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

