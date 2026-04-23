"use client";

import { useRef, useState } from "react";
import { FileUp, RefreshCw, ShieldAlert } from "lucide-react";

type Props = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onComplete: (parsedResume?: any) => Promise<void> | void;
  setStatus: (msg: string) => void;
};

export function ResumeDropzone({ onComplete, setStatus }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [filename, setFilename] = useState<string | null>(null);

  async function handleFile(file: File) {
    if (file.type !== "application/pdf") {
      setStatus("Please upload a PDF file.");
      return;
    }

    setFilename(file.name);
    setBusy(true);
    setStatus("Parsing PDF...");
    try {
      const form = new FormData();
      form.append("file", file);

      const parseRes = await fetch("/api/resumes/parse", { method: "POST", body: form });
      const parseJson = (await parseRes.json()) as unknown;
      if (!parseRes.ok) {
        const msg =
          typeof parseJson === "object" && parseJson && "error" in parseJson
            ? String((parseJson as { error?: unknown }).error ?? "Unable to parse PDF.")
            : "Unable to parse PDF.";
        setStatus(msg);
        setFilename(null);
        return;
      }

      const parsed = parseJson as { text: string; truncated: boolean };
      setStatus(parsed.truncated ? "PDF parsed (text truncated). Evaluating ATS..." : "PDF parsed. Evaluating ATS...");

      const titleBase = file.name.replace(/\.pdf$/i, "").trim() || "Uploaded Resume";
      const evalRes = await fetch("/api/resumes/ats-evaluate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          title: `${titleBase} (Upload)`,
          rawText: parsed.text,
        }),
      });
      const evalJson = (await evalRes.json()) as unknown;
      if (!evalRes.ok) {
        const msg =
          typeof evalJson === "object" && evalJson && "error" in evalJson
            ? String((evalJson as { error?: unknown }).error ?? "ATS evaluation failed.")
            : "ATS evaluation failed.";
        setStatus(msg);
        setFilename(null);
        return;
      }

      setStatus("Resume uploaded, saved, and evaluated successfully!");
      if (onComplete) {
        await onComplete(evalJson);
      }
    } catch {
      setStatus("Network error. Please retry.");
      setFilename(null);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-sm font-semibold">Upload Resume PDF</div>
          <div className="text-xs" style={{ color: "var(--text-muted)" }}>
            We'll extract text and run a strict ATS evaluation. Your resume + analyses are saved to PostgreSQL.
          </div>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void handleFile(f);
          e.currentTarget.value = "";
        }}
      />

      <div
        onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); setDragging(true); }}
        onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setDragging(true); }}
        onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setDragging(false); }}
        onDrop={(e) => {
          e.preventDefault(); e.stopPropagation(); setDragging(false);
          const f = e.dataTransfer.files?.[0];
          if (f) void handleFile(f);
        }}
        className="rounded-2xl p-5 cursor-pointer transition-colors"
        style={{
          background: dragging ? "rgba(139,92,246,0.10)" : "rgba(255,255,255,0.02)",
          border: dragging ? "1px solid rgba(139,92,246,0.35)" : "1px dashed rgba(255,255,255,0.12)",
        }}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-cyan-500/10 border border-cyan-500/20 text-cyan-500">
              {busy ? <RefreshCw size={18} className="animate-spin" /> : <FileUp size={18} />}
            </div>
            <div>
              <div className="text-sm font-semibold">
                 {busy ? "Uploading PDF..." : filename ? filename : "Drag & drop a PDF here"}
              </div>
              <div className="text-xs" style={{ color: "var(--text-secondary)" }}>
                {busy ? "Extracting intelligence metrics..." : "or click to choose a file (PDF only)"}
              </div>
            </div>
          </div>

          <button type="button" className="btn-primary text-sm shrink-0" disabled={busy} onClick={() => inputRef.current?.click()}>
            {busy ? "Working..." : "Choose PDF"}
          </button>
        </div>

        <div className="mt-4 flex items-start gap-2 text-xs" style={{ color: "var(--text-muted)" }}>
          <ShieldAlert size={14} className="mt-0.5" />
          <span>
            If your PDF is scanned (image-only), text extraction may fail. Use OCR or export a selectable-text PDF.
          </span>
        </div>
      </div>
    </div>
  );
}

