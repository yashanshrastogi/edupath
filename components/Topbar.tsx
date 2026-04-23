"use client";

import { useState, useRef, useEffect } from "react";
import { signOut } from "next-auth/react";
import { Bell, Flame, LogOut, Search, Zap, User } from "lucide-react";

type TopbarProps = {
  user: {
    streak: number;
    level: number;
    xp: number;
    name?: string | null;
  } | null;
};

export default function Topbar({ user }: TopbarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const progressPct = Math.min(100, Math.round(((user?.xp ?? 0) % 1500) / 15));
  const xpInLevel = (user?.xp ?? 0) % 1500;
  const name = user?.name ?? "Guest User";
  const initials = name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "0 16px",
        flexShrink: 0,
        background: "rgb(11,11,18)",
        borderBottom: "1px solid rgba(139,92,246,0.12)",
        height: 60,
        minHeight: 60,
        width: "100%",
      }}
    >
      {/* Search bar */}
      <div style={{ flex: 1, position: "relative", maxWidth: 400 }}>
        <Search size={14} style={{
          position: "absolute", left: 12, top: "50%",
          transform: "translateY(-50%)",
          color: "var(--text-muted)", pointerEvents: "none",
        }} />
        <input
          type="text"
          placeholder="Search roadmaps, resources, community…"
          style={{
            width: "100%",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(139,92,246,0.16)",
            borderRadius: 10,
            color: "var(--text-primary)",
            padding: "8px 12px 8px 34px",
            fontSize: "0.8rem",
            outline: "none",
          }}
          onFocus={e => (e.currentTarget.style.borderColor = "rgba(139,92,246,0.5)")}
          onBlur={e => (e.currentTarget.style.borderColor = "rgba(139,92,246,0.16)")}
        />
      </div>

      <div style={{ flex: 1 }} />

      {/* Streak chip */}
      <div style={{
        display: "flex", alignItems: "center", gap: 6,
        padding: "6px 12px", borderRadius: 8, flexShrink: 0,
        background: (user?.streak ?? 0) > 0 ? "rgba(245,158,11,0.12)" : "rgba(71,85,105,0.12)",
        border: `1px solid ${(user?.streak ?? 0) > 0 ? "rgba(245,158,11,0.28)" : "rgba(71,85,105,0.2)"}`,
      }}>
        <Flame size={14} style={{ color: (user?.streak ?? 0) > 0 ? "#f59e0b" : "#64748b" }} />
        <span style={{
          fontSize: "0.75rem", fontWeight: 700, whiteSpace: "nowrap",
          color: (user?.streak ?? 0) > 0 ? "#fde68a" : "#64748b",
        }}>
          {user?.streak ?? 0} day streak
        </span>
      </div>

      {/* Bell */}
      <button style={{
        position: "relative", display: "flex", alignItems: "center",
        justifyContent: "center", width: 36, height: 36, borderRadius: 8,
        background: "rgba(255,255,255,0.03)",
        border: "1px solid var(--border-subtle)",
        color: "var(--text-secondary)", cursor: "pointer", flexShrink: 0,
      }}>
        <Bell size={15} />
        <span style={{
          position: "absolute", top: 6, right: 6,
          width: 8, height: 8, borderRadius: "50%",
          background: "#f43f5e",
        }} />
      </button>

      {/* User avatar + XP */}
      <div ref={dropdownRef} style={{ position: "relative", flexShrink: 0 }}>
        <button
          onClick={() => setDropdownOpen(o => !o)}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "5px 10px 5px 6px", borderRadius: 10,
            background: dropdownOpen ? "rgba(139,92,246,0.12)" : "rgba(255,255,255,0.03)",
            border: `1px solid ${dropdownOpen ? "rgba(139,92,246,0.4)" : "var(--border-subtle)"}`,
            cursor: "pointer", transition: "all 0.15s",
          }}
        >
          <div style={{
            width: 28, height: 28, borderRadius: "50%",
            background: "linear-gradient(135deg,#8b5cf6,#06b6d4)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "0.65rem", fontWeight: 800, color: "#fff", flexShrink: 0,
          }}>
            {initials}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 3, minWidth: 110 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                <Zap size={10} style={{ color: "#8b5cf6" }} />
                <span style={{ fontSize: "0.68rem", color: "var(--text-muted)", fontWeight: 500 }}>
                  Level {user?.level ?? 1}
                </span>
              </div>
              <span style={{ fontSize: "0.68rem", color: "#8b5cf6", fontWeight: 700 }}>
                {xpInLevel}/1500 XP
              </span>
            </div>
            <div style={{
              height: 5, borderRadius: 99,
              background: "rgba(139,92,246,0.12)", overflow: "hidden",
            }}>
              <div style={{
                height: "100%", borderRadius: 99,
                width: `${progressPct}%`,
                background: "linear-gradient(90deg,#8b5cf6,#06b6d4)",
                transition: "width 1s ease",
              }} />
            </div>
          </div>
        </button>

        {dropdownOpen && (
          <div style={{
            position: "absolute", top: "calc(100% + 8px)", right: 0,
            width: 220, borderRadius: 12, zIndex: 100,
            background: "rgb(16,16,24)",
            border: "1px solid rgba(139,92,246,0.2)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
            overflow: "hidden",
          }}>
            <div style={{
              padding: "14px 16px",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: "50%",
                  background: "linear-gradient(135deg,#8b5cf6,#06b6d4)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "0.75rem", fontWeight: 800, color: "#fff",
                }}>
                  {initials}
                </div>
                <div>
                  <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "#e2e8f0" }}>
                    {name}
                  </div>
                  <div style={{ fontSize: "0.7rem", color: "#475569" }}>
                    Level {user?.level ?? 1} · {user?.xp ?? 0} XP total
                  </div>
                </div>
              </div>
            </div>

            <div style={{ padding: "6px" }}>
              <button
                onClick={() => { setDropdownOpen(false); window.location.href = "/dashboard"; }}
                style={{
                  width: "100%", display: "flex", alignItems: "center", gap: 10,
                  padding: "9px 10px", borderRadius: 8, border: "none",
                  background: "none", color: "#94a3b8", fontSize: "0.82rem",
                  cursor: "pointer", textAlign: "left",
                }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(139,92,246,0.1)")}
                onMouseLeave={e => (e.currentTarget.style.background = "none")}
              >
                <User size={15} />
                View Profile
              </button>

              <button
                onClick={() => void signOut({ callbackUrl: "/login" })}
                style={{
                  width: "100%", display: "flex", alignItems: "center", gap: 10,
                  padding: "9px 10px", borderRadius: 8, border: "none",
                  background: "none", color: "#f87171", fontSize: "0.82rem",
                  cursor: "pointer", textAlign: "left",
                }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(248,113,113,0.1)")}
                onMouseLeave={e => (e.currentTarget.style.background = "none")}
              >
                <LogOut size={15} />
                Sign Out
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}