"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { Bell, Flame, LogOut, Search, Menu, Zap, ChevronUp } from "lucide-react";
import { useMobileNav } from "./MobileNavProvider";

type TopbarProps = {
  user: {
    streak: number;
    level: number;
    xp: number;
    name?: string | null;
  } | null;
};

export default function Topbar({ user }: TopbarProps) {
  const { toggle } = useMobileNav();
  const progressPct = Math.min(100, Math.round(((user?.xp ?? 0) % 1500) / 15));
  const xpInLevel = (user?.xp ?? 0) % 1500;

  return (
    <header
      className="flex items-center gap-3 px-5 flex-shrink-0"
      style={{
        background: "rgba(11,11,18,0.92)",
        borderBottom: "1px solid rgba(139,92,246,0.12)",
        backdropFilter: "blur(24px)",
        height: "var(--topbar-h, 60px)",
        minHeight: "60px",
      }}
    >
      {/* Mobile hamburger */}
      <button
        onClick={toggle}
        className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg"
        style={{ color: "var(--text-secondary)", border: "1px solid var(--border-subtle)" }}
      >
        <Menu size={18} />
      </button>

      {/* Search bar */}
      <div className="hidden md:flex flex-1 max-w-sm relative">
        <Search
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: "var(--text-muted)" }}
        />
        <input
          type="text"
          placeholder="Search roadmaps, resources, community…"
          style={{
            width: "100%",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(139,92,246,0.16)",
            borderRadius: "10px",
            color: "var(--text-primary)",
            padding: "8px 12px 8px 34px",
            fontSize: "0.8rem",
            outline: "none",
            transition: "border-color 0.2s",
          }}
          onFocus={e => (e.currentTarget.style.borderColor = "rgba(139,92,246,0.5)")}
          onBlur={e => (e.currentTarget.style.borderColor = "rgba(139,92,246,0.16)")}
        />
      </div>

      {/* Right cluster */}
      <div className="flex items-center gap-2 ml-auto">

        {/* Streak chip */}
        <div
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
          style={{
            background: (user?.streak ?? 0) > 0
              ? "rgba(245,158,11,0.12)"
              : "rgba(71,85,105,0.12)",
            border: `1px solid ${(user?.streak ?? 0) > 0 ? "rgba(245,158,11,0.28)" : "rgba(71,85,105,0.2)"}`,
          }}
        >
          <Flame size={14} style={{ color: (user?.streak ?? 0) > 0 ? "#f59e0b" : "#64748b" }} />
          <span
            className="text-xs font-bold"
            style={{ color: (user?.streak ?? 0) > 0 ? "#fde68a" : "#64748b" }}
          >
            {user?.streak ?? 0} day streak
          </span>
        </div>

        {/* Bell */}
        <button
          className="relative flex items-center justify-center w-9 h-9 rounded-lg"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid var(--border-subtle)",
            color: "var(--text-secondary)",
          }}
        >
          <Bell size={15} />
          <span
            className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
            style={{ background: "var(--accent-rose)" }}
          />
        </button>

        {/* Sign out */}
        {user && (
          <button
            onClick={() => void signOut({ callbackUrl: "/login" })}
            className="flex items-center justify-center w-9 h-9 rounded-lg"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid var(--border-subtle)",
              color: "var(--text-secondary)",
            }}
            title="Sign out"
          >
            <LogOut size={15} />
          </button>
        )}

        {/* XP Level block */}
        <div
          className="hidden md:flex flex-col gap-1 pl-3"
          style={{ borderLeft: "1px solid var(--border-subtle)", minWidth: "120px" }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Zap size={11} style={{ color: "var(--accent-violet)" }} />
              <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontWeight: 500 }}>
                Level {user?.level ?? 1}
              </span>
            </div>
            <div className="flex items-center gap-1" style={{ fontSize: "0.72rem", color: "var(--accent-violet)", fontWeight: 700 }}>
              <ChevronUp size={10} />
              {xpInLevel}/{1500} XP
            </div>
          </div>
          <div
            className="h-1.5 rounded-full overflow-hidden"
            style={{ background: "rgba(139,92,246,0.12)" }}
          >
            <div
              className="h-full rounded-full"
              style={{
                width: `${progressPct}%`,
                background: "linear-gradient(90deg,#8b5cf6,#06b6d4)",
                transition: "width 1s ease",
              }}
            />
          </div>
        </div>

      </div>
    </header>
  );
}
