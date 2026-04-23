"use client";

import { useState, useCallback, useRef } from "react";
import type * as Monaco from "monaco-editor";
import {
  Bot, Loader2, Zap, CheckCircle, AlertTriangle,
  Code2, LayoutPanelLeft,
} from "lucide-react";

import CodeEditor, { detectLanguage, LANGUAGE_MAP } from "./mentor/CodeEditor";
import FileTabs, { type CodeFile, type EditorState } from "./mentor/FileTabs";
import OutputConsole from "./mentor/OutputConsole";
import TrafficLights from "./mentor/TrafficLights";
/* RunResponse is inlined to avoid coupling to server-only module */
interface RunResponse { output: string; error: string; executionTime: number; }

/* ── helpers ───────────────────────────────────────────────────── */
function uid() {
  return Math.random().toString(36).slice(2, 9);
}

function buildInitialState(): EditorState {
  const id = uid();
  return {
    activeFileId: id,
    files: [
      {
        id,
        name:     "index.js",
        language: "javascript",
        content:
          '// Write your JavaScript here\n\nconsole.log("Hello, World!");\n',
      },
    ],
  };
}

const PREVIEW_LANGS = new Set(["html", "css"]);

/* All languages that can run directly in the browser (no server needed) */
const BROWSER_EXEC_LANGS = new Set(["javascript", "typescript", "python"]);

/* ── Shared sandbox core ────────────────────────────────────────────────────
 * Mounts a hidden sandboxed iframe, collects postMessage lines, resolves on
 * the "done" signal or when timeoutMs elapses.
 * ────────────────────────────────────────────────────────────────────────── */
function mountSandbox(
  harness: string,
  timeoutMs: number
): Promise<{ output: string; error: string }> {
  return new Promise((resolve) => {
    const logs:   string[] = [];
    const errors: string[] = [];
    let settled = false;

    const iframe = document.createElement("iframe");
    iframe.setAttribute("sandbox", "allow-scripts");
    iframe.style.cssText =
      "position:fixed;top:-9999px;left:-9999px;width:1px;height:1px;opacity:0;pointer-events:none;";
    document.body.appendChild(iframe);

    const timeoutId = setTimeout(() => {
      if (!settled) {
        settled = true;
        cleanup();
        resolve({
          output: logs.join("\n"),
          error: (errors.length ? errors.join("\n") + "\n" : "") +
                 `[Timed out after ${Math.round(timeoutMs / 1000)}s]`,
        });
      }
    }, timeoutMs);

    function cleanup() {
      clearTimeout(timeoutId);
      window.removeEventListener("message", onMsg);
      try { document.body.removeChild(iframe); } catch { /* gone */ }
    }

    function onMsg(e: MessageEvent) {
      if (!e.data?.__sandbox) return;
      const { type, text } = e.data as { type: string; text?: string };
      if (type === "log" || type === "warn")                logs.push(text ?? "");
      else if (type === "error" || type === "runtimeError") errors.push(text ?? "");
      else if (type === "done" && !settled) {
        settled = true;
        cleanup();
        resolve({ output: logs.join("\n"), error: errors.join("\n") });
      }
    }

    window.addEventListener("message", onMsg);
    iframe.srcdoc = harness;
  });
}

/* ── JavaScript / TypeScript sandbox ───────────────────────────────────── */
function runJavaScriptInBrowser(code: string) {
  const harness = `<!DOCTYPE html><html><body><script>
(function(){
  var _lg=Function.prototype.bind.call(console.log,  console);
  var _er=Function.prototype.bind.call(console.error,console);
  var _wn=Function.prototype.bind.call(console.warn, console);
  function fmt(a){return Array.prototype.slice.call(a).map(function(v){
    if(v===null)return'null';
    if(v===undefined)return'undefined';
    if(typeof v==='object'){try{return JSON.stringify(v,null,2)}catch(e){return String(v)}}
    return String(v);
  }).join(' ');}
  console.log  =function(){parent.postMessage({__sandbox:true,type:'log',  text:fmt(arguments)},'*');_lg.apply(console,arguments);};
  console.error=function(){parent.postMessage({__sandbox:true,type:'error',text:fmt(arguments)},'*');_er.apply(console,arguments);};
  console.warn =function(){parent.postMessage({__sandbox:true,type:'warn', text:fmt(arguments)},'*');_wn.apply(console,arguments);};
  try{(function(){${code}})();parent.postMessage({__sandbox:true,type:'done'},'*');}
  catch(e){parent.postMessage({__sandbox:true,type:'runtimeError',text:String(e)},'*');
           parent.postMessage({__sandbox:true,type:'done'},'*');}
})();
<\/script></body></html>`;
  return mountSandbox(harness, 6000);
}

/* ── Python sandbox via Pyodide (WebAssembly) ───────────────────────────
 * Pyodide compiles CPython to WASM — runs Python 3.12 entirely in the
 * browser with zero server calls. First load downloads ~10 MB (cached).
 * Timeout is 45 s to accommodate the initial WASM compilation.
 * ────────────────────────────────────────────────────────────────────── */
function runPythonInBrowser(code: string) {
  const escaped = code
    .replace(/\\/g, "\\\\")
    .replace(/`/g, "\\`")
    .replace(/\$\{/g, "\\${");

  const harness = `<!DOCTYPE html><html><body>
<script type="module">
const PM = (msg) => parent.postMessage({ __sandbox: true, ...msg }, '*');
async function main() {
  try {
    PM({ type: 'log', text: '⏳ Loading Python 3 runtime…' });
    const { loadPyodide } = await import(
      'https://cdn.jsdelivr.net/pyodide/v0.27.3/full/pyodide.mjs'
    );
    const py = await loadPyodide({
      stdout: (t) => PM({ type: 'log',   text: t }),
      stderr: (t) => PM({ type: 'error', text: t }),
    });
    PM({ type: 'log', text: '✅ Ready\\n' });
    await py.runPythonAsync(\`${escaped}\`);
  } catch (e) {
    PM({ type: 'runtimeError', text: String(e) });
  } finally {
    PM({ type: 'done' });
  }
}
main();
<\/script></body></html>`;

  return mountSandbox(harness, 45_000);
}


/* ─────────────────────────────────────────────────────────────── */
/*  Main component                                                  */
/* ─────────────────────────────────────────────────────────────── */
export default function AIPairProgrammer() {
  /* ── Editor state ──────────────────────────────────────────── */
  const [editorState, setEditorState] = useState<EditorState>(buildInitialState);
  const editorRef = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null);

  /* ── AI review state ───────────────────────────────────────── */
  const [isReviewing,   setIsReviewing]   = useState(false);
  const [reviewFeedback, setReviewFeedback] = useState<string | null>(null);
  const [reviewScore,   setReviewScore]   = useState<number | null>(null);
  const [reviewError,   setReviewError]   = useState<string | null>(null);

  /* ── Code execution state ──────────────────────────────────── */
  const [output,        setOutput]        = useState("");
  const [runError,      setRunError]      = useState("");
  const [execTime,      setExecTime]      = useState<number | null>(null);
  const [isRunning,     setIsRunning]     = useState(false);

  /* ── HTML preview state ────────────────────────────────────── */
  const [showPreview,   setShowPreview]   = useState(false);
  const [previewSrc,    setPreviewSrc]    = useState("");

  /* ── Derived values ────────────────────────────────────────── */
  const activeFile = editorState.files.find(f => f.id === editorState.activeFileId)
    ?? editorState.files[0];
  const isPreviewMode = PREVIEW_LANGS.has(activeFile.language);

  /* ════════════════════════════════════════════════════════════  */
  /*  File management                                              */
  /* ════════════════════════════════════════════════════════════  */

  const activateFile = useCallback((id: string) => {
    setEditorState(s => ({ ...s, activeFileId: id }));
    setShowPreview(false);
  }, []);

  const closeFile = useCallback((id: string) => {
    setEditorState(s => {
      if (s.files.length <= 1) return s;
      const remaining = s.files.filter(f => f.id !== id);
      const nextActive =
        s.activeFileId === id
          ? remaining[Math.max(0, s.files.findIndex(f => f.id === id) - 1)]?.id ?? remaining[0].id
          : s.activeFileId;
      return { files: remaining, activeFileId: nextActive };
    });
  }, []);

  const renameFile = useCallback((id: string, newName: string) => {
    setEditorState(s => ({
      ...s,
      files: s.files.map(f =>
        f.id === id
          ? { ...f, name: newName, language: detectLanguage(newName) }
          : f
      ),
    }));
  }, []);

  const updateFileContent = useCallback((id: string, content: string) => {
    setEditorState(s => ({
      ...s,
      files: s.files.map(f => f.id === id ? { ...f, content } : f),
    }));
  }, []);

  const addFile = useCallback((name: string, content: string, language: string) => {
    const id = uid();
    setEditorState(s => ({
      files: [...s.files, { id, name, content, language }],
      activeFileId: id,
    }));
    setShowPreview(false);
  }, []);


  /* ════════════════════════════════════════════════════════════  */
  /*  Code execution                                               */
  /*  JS/TS   → browser iframe sandbox (instant, no API)         */
  /*  Python  → Pyodide WASM (browser, first run ~30s, cached)   */
  /*  C++/Java → show local run instructions                      */
  /* ════════════════════════════════════════════════════════════  */
  async function runCode() {
    if (isRunning) return;
    setIsRunning(true);
    setOutput("");
    setRunError("");
    setExecTime(null);
    setShowPreview(false);

    const lang = activeFile.language.toLowerCase();

    if (lang === "javascript" || lang === "typescript") {
      /* ── Browser-native JS/TS ── no API, instant */
      const start = Date.now();
      try {
        const result = await runJavaScriptInBrowser(activeFile.content);
        setOutput(result.output);
        setRunError(result.error);
        setExecTime(Date.now() - start);
      } catch (err: unknown) {
        setRunError(err instanceof Error ? err.message : "Execution failed.");
      } finally {
        setIsRunning(false);
      }
      return;
    }

    if (lang === "python") {
      /* ── Python via Pyodide WASM ── no API, first run ~30 s (cached after) */
      const start = Date.now();
      try {
        const result = await runPythonInBrowser(activeFile.content);
        setOutput(result.output);
        setRunError(result.error);
        setExecTime(Date.now() - start);
      } catch (err: unknown) {
        setRunError(err instanceof Error ? err.message : "Python execution failed.");
      } finally {
        setIsRunning(false);
      }
      return;
    }

    /* ── C++ / Java / others: honest message ── */
    setOutput("");
    setRunError(
      `${lang.toUpperCase()} requires a local compiler/runtime.\n\n` +
      `To run locally:\n` +
      `  • C++:  g++ main.cpp -o main && ./main\n` +
      `  • Java: javac Main.java && java Main\n\n` +
      `💡 The AI Code Reviewer still works — click "Review full file" →`
    );
    setExecTime(0);
    setIsRunning(false);
  }

  /* ════════════════════════════════════════════════════════════  */
  /*  HTML/CSS Preview                                             */
  /* ════════════════════════════════════════════════════════════  */
  function openPreview() {
    const htmlFile = editorState.files.find(f => f.language === "html");
    const cssFile  = editorState.files.find(f => f.language === "css");
    const jsFile   = editorState.files.find(
      f => f.language === "javascript" || f.language === "typescript"
    );

    const html = htmlFile?.content ?? "<body></body>";
    const css  = cssFile  ? `<style>${cssFile.content}</style>` : "";
    const js   = jsFile   ? `<script>${jsFile.content}</script>` : "";

    // Inject CSS & JS into HTML
    const combined = html
      .replace("</head>", `${css}\n</head>`)
      .replace("</body>", `${js}\n</body>`);

    setPreviewSrc(`data:text/html;charset=utf-8,${encodeURIComponent(combined)}`);
    setShowPreview(true);
  }

  /* ════════════════════════════════════════════════════════════  */
  /*  AI Code Review                                               */
  /* ════════════════════════════════════════════════════════════  */
  async function reviewCode(mode: "selection" | "fullFile") {
    if (isReviewing) return;

    let codeToReview = activeFile.content;

    if (mode === "selection" && editorRef.current) {
      const selection = editorRef.current.getSelection();
      if (selection && !selection.isEmpty()) {
        codeToReview = editorRef.current.getModel()?.getValueInRange(selection) ?? activeFile.content;
      }
    }

    setIsReviewing(true);
    setReviewFeedback(null);
    setReviewScore(null);
    setReviewError(null);

    try {
      const res = await fetch("/api/mentor/review", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ code: codeToReview, language: activeFile.language }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Review failed");
      setReviewFeedback(data.feedback ?? "No feedback returned.");
      setReviewScore(typeof data.score === "number" ? data.score : null);
    } catch (err: unknown) {
      setReviewError(err instanceof Error ? err.message : "AI review failed. Try again.");
    } finally {
      setIsReviewing(false);
    }
  }

  /* ════════════════════════════════════════════════════════════  */
  /*  Render                                                       */
  /* ════════════════════════════════════════════════════════════  */
  return (
    <div
      style={{
        display:       "flex",
        flexDirection: "column",
        height:        "100%",
        background:    "#0d1117",
        borderRadius:  12,
        overflow:      "hidden",
        border:        "1px solid rgba(139,92,246,0.18)",
        boxShadow:     "0 8px 40px rgba(0,0,0,0.5)",
      }}
    >
      {/* ── TOP BAR: Traffic lights + File tabs ──────────────── */}
      <div
        style={{
          display:        "flex",
          alignItems:     "center",
          background:     "#161b22",
          borderBottom:   "1px solid rgba(255,255,255,0.06)",
          flexShrink:     0,
          minHeight:      36,
        }}
      >
        {/* Traffic lights */}
        <div style={{ padding: "0 12px", display: "flex", alignItems: "center" }}>
          <TrafficLights
            activeFile={activeFile}
            allFiles={editorState.files}
            onCloseFile={closeFile}
            onRenameFile={renameFile}
            onNewFile={addFile}
          />
        </div>

        {/* Divider */}
        <div style={{ width: 1, background: "rgba(255,255,255,0.06)", alignSelf: "stretch" }} />

        {/* File tabs (takes remaining space) */}
        <div style={{ flex: 1, overflow: "hidden" }}>
          <FileTabs
            files={editorState.files}
            activeFileId={editorState.activeFileId}
            onActivate={activateFile}
            onClose={closeFile}
            onAddFile={() => {
              // Trigger green dot dialog via a small trick:
              // We just call addFile with a default name and let user rename.
              // Or we could call the green dot — easier to add a file directly:
              const ext = ".js";
              const baseName = "untitled";
              let counter = 1;
              let finalName = `${baseName}${ext}`;
              const names = new Set(editorState.files.map(f => f.name));
              while (names.has(finalName)) {
                finalName = `${baseName}${counter++}${ext}`;
              }
              addFile(finalName, '// Write your code here\n', "javascript");
            }}
          />
        </div>

        {/* Preview toggle badge */}
        {showPreview && (
          <button
            onClick={() => setShowPreview(false)}
            style={{
              padding:    "4px 10px",
              borderRadius: 6,
              background: "rgba(14,165,233,0.15)",
              border:     "1px solid rgba(14,165,233,0.3)",
              color:      "#38bdf8",
              fontSize:   "0.72rem",
              cursor:     "pointer",
              marginRight: 8,
              fontWeight: 600,
            }}
          >
            ← Editor
          </button>
        )}
      </div>

      {/* ── MIDDLE ROW: Editor + AI Panel ────────────────────── */}
      <div
        className="flex-1 flex flex-col md:flex-row overflow-hidden"
        style={{ flex: 1, overflow: "hidden" }}
      >
        {/* Left: Monaco Editor / HTML Preview */}
        <div
          className="md:flex-[0_0_65%]"
          style={{
            flex:      "1 1 0",
            overflow:  "hidden",
            position:  "relative",
            borderRight: "1px solid rgba(255,255,255,0.05)",
            minHeight: 200,
          }}
        >
          {showPreview ? (
            <iframe
              src={previewSrc}
              style={{ width: "100%", height: "100%", border: "none", background: "#fff" }}
              sandbox="allow-scripts"
              title="HTML Preview"
            />
          ) : (
            <CodeEditor
              value={activeFile.content}
              language={activeFile.language}
              onChange={(val) => updateFileContent(activeFile.id, val)}
              onEditorMount={(editor) => { editorRef.current = editor; }}
            />
          )}
        </div>

        {/* Right: AI Code Reviewer panel */}
        <div
          className="md:flex-[0_0_35%]"
          style={{
            display:        "flex",
            flexDirection:  "column",
            overflow:       "hidden",
            background:     "#13141b",
            minWidth:       240,
            minHeight:      200,
          }}
        >
          {/* Panel header */}
          <div
            style={{
              padding:        "10px 14px",
              borderBottom:   "1px solid rgba(139,92,246,0.1)",
              background:     "linear-gradient(90deg,rgba(139,92,246,0.08),transparent)",
              display:        "flex",
              alignItems:     "center",
              gap:            8,
              flexShrink:     0,
            }}
          >
            <Bot size={15} style={{ color: "#8b5cf6" }} />
            <span style={{ fontWeight: 700, fontSize: "0.82rem", color: "#e2e8f0", flex: 1 }}>
              AI Code Reviewer
            </span>
            <LayoutPanelLeft size={13} style={{ color: "#334155" }} />
          </div>

          {/* Action buttons */}
          <div
            style={{
              display:    "flex",
              gap:        6,
              padding:    "8px 12px",
              borderBottom: "1px solid rgba(255,255,255,0.04)",
              flexShrink: 0,
            }}
          >
            <button
              onClick={() => reviewCode("selection")}
              disabled={isReviewing}
              style={{
                flex:       1,
                padding:    "6px 4px",
                borderRadius: 6,
                border:     "1px solid rgba(139,92,246,0.25)",
                background: "rgba(139,92,246,0.08)",
                color:      "#c4b5fd",
                fontSize:   "0.72rem",
                fontWeight: 600,
                cursor:     isReviewing ? "not-allowed" : "pointer",
                opacity:    isReviewing ? 0.6 : 1,
                display:    "flex",
                alignItems: "center",
                justifyContent: "center",
                gap:        4,
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                if (!isReviewing) {
                  (e.currentTarget as HTMLElement).style.background = "rgba(139,92,246,0.18)";
                }
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = "rgba(139,92,246,0.08)";
              }}
            >
              <Code2 size={11} /> Review selected
            </button>
            <button
              onClick={() => reviewCode("fullFile")}
              disabled={isReviewing}
              style={{
                flex:       1,
                padding:    "6px 4px",
                borderRadius: 6,
                border:     "1px solid rgba(139,92,246,0.25)",
                background: "rgba(139,92,246,0.08)",
                color:      "#c4b5fd",
                fontSize:   "0.72rem",
                fontWeight: 600,
                cursor:     isReviewing ? "not-allowed" : "pointer",
                opacity:    isReviewing ? 0.6 : 1,
                display:    "flex",
                alignItems: "center",
                justifyContent: "center",
                gap:        4,
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                if (!isReviewing) {
                  (e.currentTarget as HTMLElement).style.background = "rgba(139,92,246,0.18)";
                }
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = "rgba(139,92,246,0.08)";
              }}
            >
              <Zap size={11} /> Review full file
            </button>
          </div>

          {/* Feedback area — independently scrollable */}
          <div style={{ flex: 1, overflowY: "auto", padding: "12px 14px" }}>

            {/* Idle state */}
            {!isReviewing && !reviewFeedback && !reviewError && (
              <div className="flex flex-col items-center justify-center h-full text-center opacity-40">
                <Zap size={28} className="mb-3 text-violet-400" />
                <p style={{ fontSize: "0.8rem", color: "#64748b" }}>
                  Select code or click &ldquo;Review full file&rdquo; to get AI feedback.
                </p>
              </div>
            )}

            {/* Loading */}
            {isReviewing && (
              <div className="flex flex-col items-center justify-center h-full space-y-3 text-violet-300">
                <Loader2 size={28} className="animate-spin" />
                <p style={{ fontSize: "0.8rem" }} className="animate-pulse">
                  Analyzing code…
                </p>
              </div>
            )}

            {/* Error */}
            {reviewError && !isReviewing && (
              <div
                style={{
                  background: "rgba(244,63,94,0.08)",
                  border:     "1px solid rgba(244,63,94,0.25)",
                  borderRadius: 8,
                  padding:    "10px 12px",
                  color:      "#f87171",
                  fontSize:   "0.8rem",
                  display:    "flex",
                  alignItems: "flex-start",
                  gap:        8,
                }}
              >
                <AlertTriangle size={14} style={{ flexShrink: 0, marginTop: 1 }} />
                {reviewError}
              </div>
            )}

            {/* Score + feedback */}
            {reviewFeedback && !isReviewing && (
              <div className="space-y-3">
                {/* Score card */}
                {reviewScore !== null && (
                  <div
                    style={{
                      background:   "rgba(0,0,0,0.3)",
                      border:       "1px solid rgba(255,255,255,0.06)",
                      borderRadius: 8,
                      padding:      "8px 12px",
                      display:      "flex",
                      alignItems:   "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <span style={{ fontSize: "0.8rem", color: "#94a3b8", fontWeight: 600 }}>
                      Code Quality Score
                    </span>
                    <span
                      style={{
                        fontSize:  "1.1rem",
                        fontWeight: 800,
                        display:   "flex",
                        alignItems: "center",
                        gap:        5,
                        color:
                          reviewScore >= 80
                            ? "#34d399"
                            : reviewScore >= 60
                            ? "#fbbf24"
                            : "#f87171",
                      }}
                    >
                      {reviewScore >= 80
                        ? <CheckCircle size={14} />
                        : <AlertTriangle size={14} />}
                      {reviewScore}/100
                    </span>
                  </div>
                )}

                {/* Markdown feedback */}
                <div style={{ fontSize: "0.8rem", lineHeight: 1.7, color: "#94a3b8" }}>
                  {reviewFeedback.split("\n").map((line, i) => {
                    if (line.startsWith("**") && line.endsWith("**")) {
                      return (
                        <p key={i} style={{ color: "#c4b5fd", fontWeight: 700, margin: "10px 0 4px" }}>
                          {line.replace(/\*\*/g, "")}
                        </p>
                      );
                    }
                    if (line.startsWith("- ")) {
                      return (
                        <p key={i} style={{ display: "flex", gap: 6, marginBottom: 3 }}>
                          <span style={{ color: "#8b5cf6", flexShrink: 0 }}>•</span>
                          <span>{line.slice(2)}</span>
                        </p>
                      );
                    }
                    return line
                      ? <p key={i} style={{ marginBottom: 4 }}>{line}</p>
                      : <div key={i} style={{ height: 4 }} />;
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── BOTTOM: Output Console ──────────────────────────── */}
      <OutputConsole
        output={output}
        error={runError}
        executionTime={execTime}
        isRunning={isRunning}
        onRun={runCode}
        language={activeFile.language}
        onPreview={openPreview}
      />
    </div>
  );
}
