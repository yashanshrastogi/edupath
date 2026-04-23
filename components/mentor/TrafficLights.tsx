"use client";

/**
 * TrafficLights.tsx
 * Three functional macOS-style window control dots:
 *  🔴 Red    → Close active tab (warns if only 1 file)
 *  🟡 Orange → Rename active file (inline input with extension validation)
 *  🟢 Green  → Create new file (popover dialog with language templates)
 *
 * Props are passed down from AIPairProgrammer which owns EditorState.
 */

import { useState, useRef, useEffect } from "react";
import { detectLanguage, LANGUAGE_MAP } from "./CodeEditor";
import type { CodeFile } from "./FileTabs";
import { AlertTriangle, X, Plus } from "lucide-react";

/* ── Starter templates ─────────────────────────────────────────── */
export const STARTER_TEMPLATES: Record<string, string> = {
  javascript:
    '// Write your JavaScript here\n\nconsole.log("Hello, World!");\n',
  typescript:
    '// Write your TypeScript here\n\nconst greet = (name: string): string => {\n  return `Hello, ${name}!`;\n};\n\nconsole.log(greet("World"));\n',
  python:
    'def main():\n    print("Hello, World!")\n\nif __name__ == "__main__":\n    main()\n',
  cpp:
    '#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, World!" << endl;\n    return 0;\n}\n',
  java:
    'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}\n',
  html:
    '<!DOCTYPE html>\n<html>\n<head>\n<title>Hello</title>\n</head>\n<body>\n<h1>Hello World</h1>\n</body>\n</html>',
  css:
    'body {\n  margin: 0;\n  font-family: sans-serif;\n  background: #f0f0f0;\n}\n',
};

const SUPPORTED_EXTENSIONS = Object.keys(LANGUAGE_MAP);

/* ── Props ─────────────────────────────────────────────────────── */
interface TrafficLightsProps {
  activeFile:   CodeFile;
  allFiles:     CodeFile[];
  onCloseFile:  (id: string) => void;
  onRenameFile: (id: string, newName: string) => void;
  onNewFile:    (name: string, content: string, language: string) => void;
}

/* ── Component ─────────────────────────────────────────────────── */
export default function TrafficLights({
  activeFile,
  allFiles,
  onCloseFile,
  onRenameFile,
  onNewFile,
}: TrafficLightsProps) {
  /* Rename state */
  const [renaming, setRenaming]         = useState(false);
  const [renameValue, setRenameValue]   = useState("");
  const [renameError, setRenameError]   = useState("");
  const renameInputRef = useRef<HTMLInputElement>(null);

  /* New-file dialog state */
  const [showDialog, setShowDialog]     = useState(false);
  const [newFileName, setNewFileName]   = useState("");
  const [newFileError, setNewFileError] = useState("");
  const [detectedLang, setDetectedLang] = useState("javascript");
  const dialogRef  = useRef<HTMLDivElement>(null);
  const newFileRef = useRef<HTMLInputElement>(null);

  /* Focus rename input when it appears */
  useEffect(() => {
    if (renaming) {
      renameInputRef.current?.focus();
      renameInputRef.current?.select();
    }
  }, [renaming]);

  /* Focus new-file input when dialog opens */
  useEffect(() => {
    if (showDialog) {
      setTimeout(() => newFileRef.current?.focus(), 50);
    }
  }, [showDialog]);

  /* Close dialog on outside click */
  useEffect(() => {
    if (!showDialog) return;
    function handleClick(e: MouseEvent) {
      if (dialogRef.current && !dialogRef.current.contains(e.target as Node)) {
        setShowDialog(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showDialog]);

  /* ── Red dot: close active tab ───────────────────────────────── */
  function handleClose() {
    if (allFiles.length <= 1) {
      alert("You need at least one file.");
      return;
    }
    onCloseFile(activeFile.id);
  }

  /* ── Orange dot: start renaming ──────────────────────────────── */
  function handleStartRename() {
    setRenaming(true);
    setRenameValue(activeFile.name);
    setRenameError("");
  }

  function handleRenameConfirm() {
    const name = renameValue.trim();
    if (!name) { setRenameError("File name cannot be empty."); return; }

    const dotIdx = name.lastIndexOf(".");
    if (dotIdx === -1) {
      setRenameError(`Must include extension (e.g. .js .py .html)`);
      return;
    }
    const ext = name.slice(dotIdx).toLowerCase();
    if (!SUPPORTED_EXTENSIONS.includes(ext)) {
      setRenameError(
        `Use a supported extension: ${SUPPORTED_EXTENSIONS.join("  ")}`
      );
      return;
    }
    onRenameFile(activeFile.id, name);
    setRenaming(false);
    setRenameError("");
  }

  /* ── Green dot: new file dialog ──────────────────────────────── */
  function handleNewFileChange(val: string) {
    setNewFileName(val);
    setNewFileError("");
    const lang = detectLanguage(val) as string;
    setDetectedLang(lang !== "plaintext" ? lang : "javascript");
  }

  function handleCreateFile() {
    const name = newFileName.trim();
    if (!name) { setNewFileError("File name is required."); return; }

    const dotIdx = name.lastIndexOf(".");
    if (dotIdx === -1) {
      setNewFileError(`Include an extension (e.g. .js .py .html)`);
      return;
    }
    const ext = name.slice(dotIdx).toLowerCase();
    if (!SUPPORTED_EXTENSIONS.includes(ext)) {
      setNewFileError(
        `Supported: ${SUPPORTED_EXTENSIONS.join("  ")}`
      );
      return;
    }
    const lang    = detectLanguage(name);
    const content = STARTER_TEMPLATES[lang] ?? `// ${name}\n`;
    onNewFile(name, content, lang);
    setShowDialog(false);
    setNewFileName("");
    setNewFileError("");
  }

  /* ── Dot button helpers ──────────────────────────────────────── */
  const dotBase: React.CSSProperties = {
    width: 12, height: 12, borderRadius: "50%",
    border: "none", cursor: "pointer", padding: 0,
    display: "flex", alignItems: "center", justifyContent: "center",
    transition: "all 0.15s", position: "relative",
    flexShrink: 0,
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, position: "relative" }}>

      {/* 🔴 Red */}
      <button
        style={{ ...dotBase, background: "#ff5f57" }}
        onClick={handleClose}
        title="Close tab"
        onMouseEnter={(e) => { (e.currentTarget.firstChild as SVGElement | null)?.setAttribute("style","opacity:1"); }}
        className="group"
      >
        <X size={7} style={{ opacity: 0, color: "#7a1a1a", transition: "opacity 0.15s" }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = "1"}
        />
      </button>

      {/* 🟡 Orange */}
      <button
        style={{ ...dotBase, background: "#ffbd2e" }}
        onClick={handleStartRename}
        title="Rename file"
      />

      {/* 🟢 Green */}
      <div style={{ position: "relative" }}>
        <button
          style={{ ...dotBase, background: "#28c840" }}
          onClick={() => { setShowDialog(!showDialog); setNewFileName(""); setNewFileError(""); }}
          title="New file"
        />

        {/* New file dialog popover */}
        {showDialog && (
          <div
            ref={dialogRef}
            style={{
              position:   "absolute",
              top:        "calc(100% + 8px)",
              left:       0,
              zIndex:     200,
              width:      260,
              background: "#1e1e2e",
              border:     "1px solid rgba(139,92,246,0.3)",
              borderRadius: 12,
              padding:    16,
              boxShadow:  "0 20px 60px rgba(0,0,0,0.6)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#e2e8f0" }}>New File</span>
              <button onClick={() => setShowDialog(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}>
                <X size={14} />
              </button>
            </div>

            {/* Name input */}
            <input
              ref={newFileRef}
              type="text"
              value={newFileName}
              onChange={(e) => handleNewFileChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter")  handleCreateFile();
                if (e.key === "Escape") setShowDialog(false);
              }}
              placeholder="e.g. index.js"
              style={{
                width:      "100%",
                background: "rgba(0,0,0,0.3)",
                border:     `1px solid ${newFileError ? "rgba(244,63,94,0.5)" : "rgba(255,255,255,0.08)"}`,
                borderRadius: 7,
                padding:    "7px 10px",
                color:      "#e2e8f0",
                fontSize:   "0.82rem",
                fontFamily: "monospace",
                outline:    "none",
                boxSizing:  "border-box",
              }}
            />

            {/* Language badge */}
            {newFileName && !newFileError && (
              <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{
                  fontSize: "0.68rem", padding: "2px 7px", borderRadius: 99,
                  background: "rgba(139,92,246,0.2)", color: "#c4b5fd",
                  border: "1px solid rgba(139,92,246,0.3)",
                }}>
                  {detectedLang}
                </span>
              </div>
            )}

            {/* Error */}
            {newFileError && (
              <div style={{ marginTop: 4, display: "flex", alignItems: "center", gap: 5, color: "#f87171", fontSize: "0.7rem" }}>
                <AlertTriangle size={11} /> {newFileError}
              </div>
            )}

            {/* Actions */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12 }}>
              <button
                onClick={handleCreateFile}
                style={{
                  flex: 1, padding: "7px 0", borderRadius: 7,
                  background: "linear-gradient(135deg,#8b5cf6,#6366f1)",
                  border: "none", color: "#fff", fontWeight: 600, fontSize: "0.8rem",
                  cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                }}
              >
                <Plus size={13} /> Create file
              </button>
              <button
                onClick={() => setShowDialog(false)}
                style={{
                  padding: "7px 12px", borderRadius: 7,
                  background: "transparent",
                  border: "1px solid rgba(255,255,255,0.06)",
                  color: "#64748b", fontSize: "0.8rem", cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Inline rename input (replaces filename in tab bar header) */}
      {renaming && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 300,
            background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
          onClick={() => setRenaming(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#1e1e2e",
              border: "1px solid rgba(139,92,246,0.35)",
              borderRadius: 12,
              padding: 20,
              width: 300,
              boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
            }}
          >
            <p style={{ fontSize: "0.82rem", fontWeight: 700, color: "#e2e8f0", marginBottom: 10 }}>
              Rename file
            </p>
            <input
              ref={renameInputRef}
              type="text"
              value={renameValue}
              onChange={(e) => { setRenameValue(e.target.value); setRenameError(""); }}
              onKeyDown={(e) => {
                if (e.key === "Enter")  handleRenameConfirm();
                if (e.key === "Escape") setRenaming(false);
              }}
              style={{
                width: "100%", background: "rgba(0,0,0,0.3)",
                border: `1px solid ${renameError ? "rgba(244,63,94,0.5)" : "rgba(255,255,255,0.08)"}`,
                borderRadius: 7, padding: "7px 10px",
                color: "#e2e8f0", fontSize: "0.82rem", fontFamily: "monospace",
                outline: "none", boxSizing: "border-box",
              }}
            />
            {renameError && (
              <div style={{ marginTop: 4, display: "flex", alignItems: "center", gap: 5, color: "#f87171", fontSize: "0.7rem" }}>
                <AlertTriangle size={11} /> {renameError}
              </div>
            )}
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <button
                onClick={handleRenameConfirm}
                style={{
                  flex: 1, padding: "7px 0", borderRadius: 7,
                  background: "linear-gradient(135deg,#8b5cf6,#6366f1)",
                  border: "none", color: "#fff", fontWeight: 600,
                  fontSize: "0.8rem", cursor: "pointer",
                }}
              >
                Rename
              </button>
              <button
                onClick={() => setRenaming(false)}
                style={{
                  padding: "7px 12px", borderRadius: 7,
                  background: "transparent",
                  border: "1px solid rgba(255,255,255,0.06)",
                  color: "#64748b", fontSize: "0.8rem", cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
