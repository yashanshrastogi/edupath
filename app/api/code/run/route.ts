/**
 * Repo analysis summary:
 * AI provider: Groq (openai-compatible client in /lib/ai.ts, Llama 3.3 70B)
 * State management: React hooks (useState/useRef/useEffect) inside components
 * Styling: Inline styles with CSS vars (--accent-violet, --text-primary, etc) + Tailwind classes
 * Monaco: @monaco-editor/react v4.7.0 already installed
 *
 * POST /api/code/run
 * Executes code via the Piston API (emkc.org) and returns output/error/executionTime.
 * Supported: javascript, typescript, python, cpp, java
 * HTML/CSS/JSX is handled client-side via iframe preview — returns 400 for those.
 */

import { NextResponse } from "next/server";

export interface RunRequest {
  language: string;
  code: string;
  stdin?: string;
}

export interface RunResponse {
  output: string;
  error: string;
  executionTime: number;
}

const PISTON_LANGUAGE_MAP: Record<string, { language: string; version: string }> = {
  javascript: { language: "javascript", version: "18.15.0" },
  typescript: { language: "typescript", version: "5.0.3" },
  python:     { language: "python",     version: "3.10.0" },
  cpp:        { language: "c++",        version: "10.2.0" },
  java:       { language: "java",       version: "15.0.2" },
};

const BROWSER_PREVIEW_LANGS = new Set(["html", "css", "jsx"]);

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = (await request.json()) as RunRequest;
    const { language, code, stdin } = body;

    if (!language || !code) {
      return NextResponse.json(
        { error: "language and code are required" },
        { status: 400 }
      );
    }

    if (BROWSER_PREVIEW_LANGS.has(language.toLowerCase())) {
      return NextResponse.json(
        { error: "Use browser preview for HTML/CSS/JSX files." },
        { status: 400 }
      );
    }

    const pistonConfig = PISTON_LANGUAGE_MAP[language.toLowerCase()];
    if (!pistonConfig) {
      return NextResponse.json(
        { error: `Language "${language}" is not supported for execution.` },
        { status: 400 }
      );
    }

    const startTime = Date.now();

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10_000);

    let pistonResponse: Response;
    try {
      pistonResponse = await fetch("https://emkc.org/api/v2/piston/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          language: pistonConfig.language,
          version: pistonConfig.version,
          files: [{ name: `main.${getExtension(language)}`, content: code }],
          stdin: stdin ?? "",
        }),
      });
    } finally {
      clearTimeout(timeoutId);
    }

    const executionTime = Date.now() - startTime;

    if (!pistonResponse.ok) {
      const errText = await pistonResponse.text().catch(() => "Unknown error");
      // Parse Piston whitelist error and return a cleaner message
      const userMsg = errText.includes("whitelist")
        ? `⚠️ The Piston public execution API now requires whitelisting.\n\nFor JavaScript: use browser console (F12).\nFor Python/C++/Java: install locally and run via terminal.\n\nAI Code Review still works — click "Review full file" →`
        : `Execution service error: ${errText}`;
      return NextResponse.json(
        { output: "", error: userMsg, executionTime },
        { status: 502 }
      );
    }

    const pistonData = await pistonResponse.json();

    const run = pistonData?.run ?? pistonData?.compile ?? {};
    const output: string = run.stdout ?? "";
    const error: string  = run.stderr ?? run.output ?? "";

    const result: RunResponse = {
      output: output.trimEnd(),
      error:  error.trimEnd(),
      executionTime,
    };

    return NextResponse.json(result);
  } catch (err: unknown) {
    if (err instanceof Error && err.name === "AbortError") {
      return NextResponse.json(
        { output: "", error: "Execution timed out (10s limit).", executionTime: 10000 },
        { status: 504 }
      );
    }
    console.error("[/api/code/run] Unexpected error:", err);
    return NextResponse.json(
      { output: "", error: "Internal server error. Please try again.", executionTime: 0 },
      { status: 500 }
    );
  }
}

function getExtension(language: string): string {
  const map: Record<string, string> = {
    javascript: "js",
    typescript: "ts",
    python:     "py",
    cpp:        "cpp",
    java:       "java",
  };
  return map[language.toLowerCase()] ?? "txt";
}
