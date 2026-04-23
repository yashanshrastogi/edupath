"use client";

/**
 * OutputConsole.tsx
 * Dark terminal-style output panel with Run ▶, execution time, Ctrl+Enter shortcut.
 * Shows stdout in white, stderr in red.
 */

import { useEffect, useRef } from "react";
import { Play, Loader2, Terminal, Clock, ExternalLink } from "lucide-react";

export interface OutputConsoleProps {
  output:        string;
  error:         string;
  executionTime: number | null;
  isRunning:     boolean;
  onRun:         () => void;
  language:      string;
  /** called when language is html/css to open preview panel */
  onPreview?:    () => void;
}

const PREVIEW_LANGS = new Set(["html", "css"]);

export default function OutputConsole({
  output,
  error,
  executionTime,
  isRunning,
  onRun,
  language,
  onPreview,
}: OutputConsoleProps) {
  const outputRef = useRef<HTMLPreElement>(null);
  const isPreview = PREVIEW_LANGS.has(language.toLowerCase());
  const hasContent = Boolean(output || error);

  /* Auto-scroll to bottom when new output arrives */
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output, error]);

  /* Ctrl+Enter triggers run */
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.ctrlKey && e.key === "Enter") {
        e.preventDefault();
        if (!isRunning && !isPreview) onRun();
        if (isPreview && onPreview) onPreview();
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isRunning, isPreview, onRun, onPreview]);

  return (
    <div
      style={{
        display:       "flex",
        flexDirection: "column",
        background:    "#0d1117",
        borderTop:     "1px solid rgba(255,255,255,0.06)",
        flexShrink:    0,
        height:        180,
        minHeight:     120,
      }}
    >
      {/* Header */}
      <div
        style={{
          display:        "flex",
          alignItems:     "center",
          gap:            8,
          padding:        "6px 12px",
          borderBottom:   "1px solid rgba(255,255,255,0.05)",
          background:     "#0d1117",
          flexShrink:     0,
        }}
      >
        <Terminal size={13} style={{ color: "#475569" }} />
        <span
          style={{
            fontSize:   "0.72rem",
            fontWeight: 600,
            color:      "#64748b",
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            flex:       1,
          }}
        >
          Output
        </span>

        {/* Execution time badge */}
        {executionTime !== null && !isRunning && (
          <span
            style={{
              display:     "flex",
              alignItems:  "center",
              gap:         4,
              fontSize:    "0.68rem",
              color:       "#475569",
              background:  "rgba(255,255,255,0.04)",
              padding:     "2px 7px",
              borderRadius: 99,
              border:      "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <Clock size={10} />
            {executionTime}ms
          </span>
        )}

        {/* Run / Preview button */}
        {isPreview ? (
          <button
            onClick={onPreview}
            style={{
              display:    "flex",
              alignItems: "center",
              gap:        5,
              padding:    "4px 10px",
              borderRadius: 6,
              fontSize:   "0.72rem",
              fontWeight: 600,
              border:     "none",
              cursor:     "pointer",
              background: "linear-gradient(135deg,#0ea5e9,#38bdf8)",
              color:      "#fff",
              transition: "opacity 0.2s",
            }}
          >
            <ExternalLink size={11} />
            Open Preview
          </button>
        ) : (
          <button
            onClick={onRun}
            disabled={isRunning}
            style={{
              display:    "flex",
              alignItems: "center",
              gap:        5,
              padding:    "4px 10px",
              borderRadius: 6,
              fontSize:   "0.72rem",
              fontWeight: 600,
              border:     "none",
              cursor:     isRunning ? "not-allowed" : "pointer",
              background: isRunning
                ? "rgba(16,185,129,0.15)"
                : "linear-gradient(135deg,#10b981,#059669)",
              color:      isRunning ? "#34d399" : "#fff",
              transition: "all 0.2s",
              opacity:    isRunning ? 0.8 : 1,
            }}
          >
            {isRunning ? (
              <><Loader2 size={11} className="animate-spin" /> Running…</>
            ) : (
              <><Play size={11} /> Run ▶</>
            )}
          </button>
        )}
      </div>

      {/* Output area */}
      <pre
        ref={outputRef}
        style={{
          flex:       1,
          overflowY:  "auto",
          padding:    "10px 14px",
          margin:     0,
          fontFamily: "'Fira Code', 'Cascadia Code', 'Menlo', monospace",
          fontSize:   "0.8rem",
          lineHeight: 1.6,
          color:      error && !output ? "#f87171" : "#e2e8f0",
          whiteSpace: "pre-wrap",
          wordBreak:  "break-word",
        }}
      >
        {isRunning && (
          <span style={{ color: "#34d399", opacity: 0.8 }}>
            ● Running…{"\n"}
          </span>
        )}

        {!isRunning && !hasContent && (
          <span style={{ color: "#334155", fontStyle: "italic" }}>
            Run your code to see output here.
          </span>
        )}

        {/* stdout */}
        {output && (
          <span style={{ color: "#e2e8f0" }}>{output}</span>
        )}

        {/* stderr */}
        {error && (
          <span style={{ color: "#f87171" }}>
            {output ? "\n\n" : ""}
            {error}
          </span>
        )}
      </pre>
    </div>
  );
}
