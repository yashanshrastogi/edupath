"use client";

/**
 * FileTabs.tsx
 * Horizontal scrollable tab bar for managing open code files.
 * Each tab shows a file-type icon, filename, and a close button.
 * Exports CodeFile and EditorState interfaces for shared use.
 */

import { useRef } from "react";
import {
  FileCode2, FileText, FileJson, FileType2, FileTerminal, File,
  Plus, X,
} from "lucide-react";

/* ── Data Shapes ───────────────────────────────────────────────── */
export interface CodeFile {
  id: string;
  name: string;
  content: string;
  language: string;
}

export interface EditorState {
  files: CodeFile[];
  activeFileId: string;
}

/* ── File icon by language ─────────────────────────────────────── */
function FileIcon({ language, size = 13 }: { language: string; size?: number }) {
  const style = { flexShrink: 0 as const };
  switch (language) {
    case "javascript":
      return <FileCode2  size={size} style={{ ...style, color: "#f7df1e" }} />;
    case "typescript":
      return <FileCode2  size={size} style={{ ...style, color: "#3178c6" }} />;
    case "python":
      return <FileCode2  size={size} style={{ ...style, color: "#3572A5" }} />;
    case "cpp":
    case "c":
      return <FileCode2  size={size} style={{ ...style, color: "#f34b7d" }} />;
    case "java":
      return <FileCode2  size={size} style={{ ...style, color: "#b07219" }} />;
    case "html":
      return <FileType2  size={size} style={{ ...style, color: "#e34c26" }} />;
    case "css":
      return <FileType2  size={size} style={{ ...style, color: "#563d7c" }} />;
    case "json":
      return <FileJson   size={size} style={{ ...style, color: "#cbcb41" }} />;
    case "markdown":
      return <FileText   size={size} style={{ ...style, color: "#083fa1" }} />;
    case "shell":
      return <FileTerminal size={size} style={{ ...style, color: "#89e051" }} />;
    default:
      return <File       size={size} style={{ ...style, color: "#64748b" }} />;
  }
}

/* ── Props ─────────────────────────────────────────────────────── */
interface FileTabsProps {
  files: CodeFile[];
  activeFileId: string;
  onActivate: (id: string) => void;
  onClose: (id: string) => void;
  onAddFile: () => void;
}

/* ── Component ─────────────────────────────────────────────────── */
export default function FileTabs({
  files,
  activeFileId,
  onActivate,
  onClose,
  onAddFile,
}: FileTabsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <div
      style={{
        display:    "flex",
        alignItems: "stretch",
        background: "#161b22",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        flexShrink: 0,
        minHeight:  36,
      }}
    >
      {/* Scrollable tab list */}
      <div
        ref={scrollRef}
        style={{
          display:    "flex",
          alignItems: "stretch",
          overflowX:  "auto",
          flex:       1,
          /* Hide scrollbar cross-browser */
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
        className="hide-scrollbar"
      >
        {files.map((file) => {
          const isActive = file.id === activeFileId;
          return (
            <div
              key={file.id}
              onClick={() => onActivate(file.id)}
              style={{
                display:    "flex",
                alignItems: "center",
                gap:        6,
                padding:    "0 12px",
                cursor:     "pointer",
                userSelect: "none",
                whiteSpace: "nowrap",
                fontSize:   "0.78rem",
                fontFamily: "'Fira Code', monospace",
                color:      isActive ? "#e2e8f0" : "#64748b",
                background: isActive ? "#0d1117" : "transparent",
                borderRight: "1px solid rgba(255,255,255,0.04)",
                borderBottom: isActive
                  ? "2px solid #8b5cf6"
                  : "2px solid transparent",
                transition: "all 0.15s",
                position:   "relative",
                minHeight:  36,
                flexShrink: 0,
              }}
              onMouseEnter={(e) => {
                if (!isActive)
                  (e.currentTarget as HTMLElement).style.color = "#94a3b8";
              }}
              onMouseLeave={(e) => {
                if (!isActive)
                  (e.currentTarget as HTMLElement).style.color = "#64748b";
              }}
            >
              <FileIcon language={file.language} />
              <span>{file.name}</span>

              {/* Close button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClose(file.id);
                }}
                style={{
                  display:    "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width:      16,
                  height:     16,
                  borderRadius: "50%",
                  border:     "none",
                  background: "transparent",
                  color:      "#64748b",
                  cursor:     "pointer",
                  padding:    0,
                  marginLeft: 2,
                  transition: "all 0.15s",
                  flexShrink: 0,
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "rgba(244,63,94,0.2)";
                  (e.currentTarget as HTMLElement).style.color = "#f43f5e";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "transparent";
                  (e.currentTarget as HTMLElement).style.color = "#64748b";
                }}
                title="Close tab"
              >
                <X size={10} />
              </button>
            </div>
          );
        })}
      </div>

      {/* Add file button */}
      <button
        onClick={onAddFile}
        style={{
          display:    "flex",
          alignItems: "center",
          justifyContent: "center",
          width:      36,
          border:     "none",
          background: "transparent",
          color:      "#475569",
          cursor:     "pointer",
          borderLeft: "1px solid rgba(255,255,255,0.04)",
          flexShrink: 0,
          transition: "all 0.15s",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.color = "#c4b5fd";
          (e.currentTarget as HTMLElement).style.background = "rgba(139,92,246,0.1)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.color = "#475569";
          (e.currentTarget as HTMLElement).style.background = "transparent";
        }}
        title="New file"
      >
        <Plus size={15} />
      </button>
    </div>
  );
}
