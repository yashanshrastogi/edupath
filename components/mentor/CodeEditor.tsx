"use client";

/**
 * CodeEditor.tsx
 * Monaco editor wrapper with dynamic SSR-safe import.
 * Uses @monaco-editor/react (already installed at ^4.7.0).
 * Exports LANGUAGE_MAP and detectLanguage for reuse across the workspace.
 */

import dynamic from "next/dynamic";
import { useRef } from "react";
import type * as Monaco from "monaco-editor";

/* ── Language detection ────────────────────────────────────────── */
export const LANGUAGE_MAP: Record<string, string> = {
  ".js":   "javascript",
  ".jsx":  "javascript",
  ".ts":   "typescript",
  ".tsx":  "typescript",
  ".py":   "python",
  ".cpp":  "cpp",
  ".cc":   "cpp",
  ".c":    "c",
  ".java": "java",
  ".html": "html",
  ".css":  "css",
  ".json": "json",
  ".md":   "markdown",
  ".sh":   "shell",
};

export function detectLanguage(filename: string): string {
  const dotIdx = filename.lastIndexOf(".");
  if (dotIdx === -1) return "plaintext";
  const ext = filename.slice(dotIdx).toLowerCase();
  return LANGUAGE_MAP[ext] ?? "plaintext";
}

/* ── Dynamic Monaco import (SSR disabled) ──────────────────────── */
const MonacoEditor = dynamic(
  () => import("@monaco-editor/react").then((m) => m.default),
  { ssr: false, loading: () => <EditorSkeleton /> }
);

/* ── Skeleton shown while Monaco hydrates ──────────────────────── */
function EditorSkeleton() {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "#0d1117",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#475569",
        fontSize: "0.8rem",
        fontFamily: "monospace",
      }}
    >
      Loading editor…
    </div>
  );
}

/* ── Props ─────────────────────────────────────────────────────── */
export interface CodeEditorProps {
  value: string;
  language: string;
  onChange: (value: string) => void;
  /** optional: expose the editor instance for selection queries */
  onEditorMount?: (editor: Monaco.editor.IStandaloneCodeEditor) => void;
}

/* ── Component ─────────────────────────────────────────────────── */
export default function CodeEditor({
  value,
  language,
  onChange,
  onEditorMount,
}: CodeEditorProps) {
  const editorRef = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null);

  function handleMount(editor: Monaco.editor.IStandaloneCodeEditor) {
    editorRef.current = editor;
    onEditorMount?.(editor);
  }

  return (
    <MonacoEditor
      height="100%"
      theme="vs-dark"
      language={language}
      value={value}
      onChange={(val) => onChange(val ?? "")}
      onMount={handleMount}
      options={{
        minimap:              { enabled: false },
        fontSize:             14,
        lineNumbers:          "on",
        scrollBeyondLastLine: false,
        fontFamily:           "'Fira Code', 'Cascadia Code', 'Menlo', monospace",
        fontLigatures:        true,
        padding:              { top: 12, bottom: 12 },
        wordWrap:             "on",
        renderLineHighlight:  "gutter",
        smoothScrolling:      true,
        cursorBlinking:       "smooth",
        tabSize:              2,
      }}
    />
  );
}
