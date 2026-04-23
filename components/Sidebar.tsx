"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMobileNav } from "./MobileNavProvider";
import {
  Bot,
  Briefcase,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  Code2,
  FileText,
  FolderCode,
  LayoutDashboard,
  Map,
  Shield,
  TrendingUp,
  Users,
  Grid2X2,
  X,
  UserRound,
} from "lucide-react";

/* ── Nav structure (grouped like image 1) ─────────────────────── */
const NAV_GROUPS = [
  {
    label: "LEARN",
    items: [
      { label: "Roadmap",  href: "/roadmap",       icon: Map },
      { label: "Quizzes",  href: "/quizzes",        icon: CheckSquare, badge: null },
      { label: "Projects", href: "/projects",       icon: FolderCode },
    ],
  },
  {
    label: "TOOLS",
    items: [
      { label: "AI Mentor",    href: "/mentor",       icon: Bot },
      { label: "Resume",       href: "/resume",        icon: FileText },
      { label: "Coding Stats", href: "/coding-stats", icon: Code2 },
    ],
  },
  {
    label: "EXPLORE",
    items: [
      { label: "Jobs",      href: "/jobs",       icon: Briefcase },
      { label: "Community", href: "/community",  icon: Users },
    ],
  },
];

/* Dashboard lives above the groups so it's always first */
const DASHBOARD = { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard };
const PROGRESS  = { label: "Progress",  href: "/progress",  icon: TrendingUp };

type SidebarProps = {
  user: { name: string | null; role: "USER" | "ADMIN"; xp: number } | null;
};

/* ── Single nav item ──────────────────────────────────────────── */
function NavItem({
  href, label, icon: Icon, active, collapsed, badge, isMobile,
}: {
  href: string; label: string;
  icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
  active: boolean; collapsed: boolean; badge?: number | null; isMobile: boolean;
}) {
  return (
    <Link
      href={href}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: collapsed && !isMobile ? "10px 0" : "9px 12px",
        borderRadius: 10,
        textDecoration: "none",
        justifyContent: collapsed && !isMobile ? "center" : "flex-start",
        position: "relative",
        background: active
          ? "rgba(139,92,246,0.15)"
          : "transparent",
        color: active ? "#c4b5fd" : "var(--text-secondary)",
        fontWeight: active ? 700 : 500,
        fontSize: "0.875rem",
        transition: "all 0.15s",
        borderLeft: active ? "3px solid #8b5cf6" : "3px solid transparent",
      }}
    >
      <Icon
        size={18}
        style={{
          flexShrink: 0,
          color: active ? "#c4b5fd" : "#64748b",
        }}
      />
      {(!collapsed || isMobile) && (
        <span style={{ flex: 1, whiteSpace: "nowrap" }}>{label}</span>
      )}
      {(!collapsed || isMobile) && badge != null && badge > 0 && (
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            minWidth: 18,
            height: 18,
            borderRadius: 99,
            background: "#22c55e",
            color: "#fff",
            fontSize: "0.65rem",
            fontWeight: 800,
            padding: "0 5px",
            flexShrink: 0,
          }}
        >
          {badge}
        </span>
      )}
    </Link>
  );
}

/* ── Section label ────────────────────────────────────────────── */
function GroupLabel({ label, hidden }: { label: string; hidden: boolean }) {
  if (hidden) return <div style={{ height: 16 }} />;
  return (
    <div
      style={{
        padding: "10px 12px 4px",
        fontSize: "0.65rem",
        fontWeight: 800,
        letterSpacing: "0.1em",
        color: "#475569",
        userSelect: "none",
      }}
    >
      {label}
    </div>
  );
}

/* ── Inner sidebar content (shared desktop + mobile) ──────────── */
function SidebarContent({
  isMobile, collapsed, pathname, user, onClose, isAdmin,
}: {
  isMobile: boolean; collapsed: boolean;
  pathname: string; user: SidebarProps["user"];
  onClose: () => void; isAdmin: boolean;
}) {
  const isCollapsed = collapsed && !isMobile;
  const name = user?.name ?? "Guest User";
  const initials = name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>

      {/* ── Logo ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: isCollapsed ? "18px 0" : "18px 16px",
          justifyContent: isCollapsed ? "center" : "flex-start",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: "linear-gradient(135deg,#8b5cf6,#6366f1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Grid2X2 size={18} color="white" />
        </div>

        {!isCollapsed && (
          <span
            style={{
              fontFamily: "Outfit,sans-serif",
              fontWeight: 800,
              fontSize: "1.05rem",
              color: "#f0eeff",
              whiteSpace: "nowrap",
            }}
          >
            EduPath{" "}
            <span
              style={{
                background: "linear-gradient(135deg,#8b5cf6,#06b6d4)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              AI
            </span>
          </span>
        )}

        {isMobile && (
          <button
            onClick={onClose}
            style={{
              marginLeft: "auto",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#64748b",
            }}
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* ── Nav ── */}
      <nav
        style={{
          flex: 1,
          overflowY: "auto",
          padding: isCollapsed ? "8px 8px" : "8px 10px",
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        {/* Dashboard (always first, no group label) */}
        <NavItem
          href={DASHBOARD.href}
          label={DASHBOARD.label}
          icon={DASHBOARD.icon}
          active={pathname === DASHBOARD.href}
          collapsed={collapsed}
          isMobile={isMobile}
        />
        {/* Progress (second, no group label) */}
        <NavItem
          href={PROGRESS.href}
          label={PROGRESS.label}
          icon={PROGRESS.icon}
          active={pathname === PROGRESS.href}
          collapsed={collapsed}
          isMobile={isMobile}
        />

        {/* Grouped sections */}
        {NAV_GROUPS.map(({ label, items }) => (
          <div key={label}>
            <GroupLabel label={label} hidden={isCollapsed} />
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {items.map((item) => (
                <NavItem
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  icon={item.icon}
                  active={pathname === item.href || pathname.startsWith(`${item.href}/`)}
                  collapsed={collapsed}
                  isMobile={isMobile}
                  badge={"badge" in item ? item.badge : undefined}
                />
              ))}
            </div>
          </div>
        ))}

        {/* Admin */}
        {isAdmin && (
          <>
            <GroupLabel label="ADMIN" hidden={isCollapsed} />
            <NavItem
              href="/admin"
              label="Admin"
              icon={Shield}
              active={pathname === "/admin"}
              collapsed={collapsed}
              isMobile={isMobile}
            />
          </>
        )}
      </nav>

      {/* ── User footer ── */}
      <div
        style={{
          borderTop: "1px solid rgba(255,255,255,0.05)",
          padding: isCollapsed ? "14px 0" : "12px 14px",
          display: "flex",
          alignItems: "center",
          gap: 8,
          justifyContent: isCollapsed ? "center" : "flex-start",
          flexShrink: 0,
          overflow: "hidden",
        }}
      >
        {/* Avatar or icon */}
        {isCollapsed ? (
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: "linear-gradient(135deg,#8b5cf6,#06b6d4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.72rem",
              fontWeight: 800,
              color: "#fff",
              flexShrink: 0,
            }}
          >
            {initials}
          </div>
        ) : (
          <>
            <div style={{
              width: 30, height: 30, borderRadius: "50%",
              background: "linear-gradient(135deg,#8b5cf6,#6366f1)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "0.68rem", fontWeight: 800, color: "#fff", flexShrink: 0,
            }}>
              {initials}
            </div>
            <div style={{ flex: 1, minWidth: 0, overflow: "hidden" }}>
              <div
                style={{
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  color: "#e2e8f0",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {name}
              </div>
              <div style={{ fontSize: "0.68rem", color: "#475569", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {user?.role === "ADMIN" ? "Admin" : "Learner"} · ⭐ {user?.xp ?? 0} XP
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ── Root export ──────────────────────────────────────────────── */
export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { isOpen, setIsOpen } = useMobileNav();

  const isAdmin = user?.role === "ADMIN";

  // Close mobile sidebar when route changes
  useEffect(() => { setIsOpen(false); }, [pathname, setIsOpen]);

  // Prevent body scroll when mobile drawer open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
  }, [isOpen]);

  return (
    <>
      {/* ── Desktop sidebar ── */}
      <aside
        className="hidden md:flex relative flex-col h-screen transition-all duration-300 ease-in-out"
        style={{
          width: collapsed ? "72px" : "232px",
          background: "rgba(10,10,16,0.98)",
          borderRight: "1px solid rgba(255,255,255,0.06)",
          flexShrink: 0,
          overflow: "hidden",
        }}
      >
        <SidebarContent
          isMobile={false}
          collapsed={collapsed}
          pathname={pathname}
          user={user}
          onClose={() => setIsOpen(false)}
          isAdmin={isAdmin}
        />

        {/* Collapse toggle — the arrow from image 2 */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{
            position: "absolute",
            right: -12,
            top: 22,
            width: 24,
            height: 24,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(20,20,30,0.95)",
            border: "1px solid rgba(139,92,246,0.35)",
            color: "#8b5cf6",
            cursor: "pointer",
            zIndex: 10,
            boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
            transition: "all 0.2s",
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.background = "#8b5cf6";
            (e.currentTarget as HTMLElement).style.color = "#fff";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.background = "rgba(20,20,30,0.95)";
            (e.currentTarget as HTMLElement).style.color = "#8b5cf6";
          }}
        >
          {collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
        </button>
      </aside>

      {/* ── Mobile overlay drawer ── */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden fixed inset-0 z-40"
              style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
              onClick={() => setIsOpen(false)}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.3 }}
              className="md:hidden fixed top-0 left-0 bottom-0 z-50 w-[240px] shadow-2xl"
              style={{
                background: "rgba(10,10,16,0.99)",
                borderRight: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <SidebarContent
                isMobile={true}
                collapsed={false}
                pathname={pathname}
                user={user}
                onClose={() => setIsOpen(false)}
                isAdmin={isAdmin}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
