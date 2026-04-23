"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Zap } from "lucide-react";

const navLinks = [
  { label: "Roadmap",   href: "/roadmap" },
  { label: "Mentor",    href: "/mentor" },
  { label: "Resume",    href: "/resume" },
  { label: "Quizzes",   href: "/quizzes" },
  { label: "Jobs",      href: "/jobs" },
  { label: "Community", href: "/community" },
  { label: "Projects",  href: "/projects" },
  { label: "About",     href: "/about" },
  { label: "Contact",   href: "/contact" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav style={{
      position: "sticky",
      top: 0,
      zIndex: 50,
      background: "rgba(11,11,18,0.9)",
      backdropFilter: "blur(20px)",
      borderBottom: "1px solid rgba(139,92,246,0.12)",
    }}>
      <div style={{
        maxWidth: 1280,
        margin: "0 auto",
        padding: "0 clamp(16px,4vw,32px)",
        height: 64,
        display: "flex",
        alignItems: "center",
        gap: 16,
      }}>

        {/* Logo */}
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", flexShrink: 0 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: "linear-gradient(135deg,#8b5cf6,#6366f1)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Zap size={18} color="white" fill="white" />
          </div>
          <span style={{ fontFamily: "Outfit,sans-serif", fontWeight: 800, fontSize: "1.1rem", color: "#f0eeff" }}>
            EduPath{" "}
            <span style={{ background: "linear-gradient(135deg,#8b5cf6,#06b6d4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              AI
            </span>
          </span>
        </Link>

        {/* Nav links */}
        <div style={{ display: "flex", alignItems: "center", flex: 1, overflow: "hidden" }}>
          {navLinks.map(({ label, href }) => {
            const isActive = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                style={{
                  padding: "6px 10px",
                  borderRadius: 8,
                  fontSize: "0.82rem",
                  fontWeight: 500,
                  color: isActive ? "#c4b5fd" : "rgba(255,255,255,0.5)",
                  textDecoration: "none",
                  whiteSpace: "nowrap",
                  transition: "color 0.15s",
                  borderBottom: isActive ? "2px solid #8b5cf6" : "2px solid transparent",
                }}
              >
                {label}
              </Link>
            );
          })}
        </div>

        {/* CTA buttons */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <Link href="/login" style={{ textDecoration: "none" }}>
            <button style={{
              padding: "8px 18px", borderRadius: 9,
              border: "1px solid rgba(139,92,246,0.3)",
              background: "transparent", color: "#c4b5fd",
              fontSize: "0.85rem", fontWeight: 600, cursor: "pointer",
            }}>
              Log In
            </button>
          </Link>
          <Link href="/dashboard" style={{ textDecoration: "none" }}>
            <button style={{
              padding: "8px 18px", borderRadius: 9,
              border: "none",
              background: "linear-gradient(135deg,#8b5cf6,#6366f1)",
              color: "#fff", fontSize: "0.85rem", fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 0 20px rgba(139,92,246,0.4)",
              whiteSpace: "nowrap",
            }}>
              Get Started Free
            </button>
          </Link>
        </div>

      </div>
    </nav>
  );
}