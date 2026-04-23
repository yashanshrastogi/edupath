/**
 * lib/ai.ts — Unified AI client for EduPath
 *
 * Priority order: Groq (primary, fastest) → OpenRouter (fallback, also free)
 *
 * Setup:
 *   Option A (Groq):       add GROQ_API_KEY=gsk_... to .env.local
 *   Option B (OpenRouter): add OPENROUTER_API_KEY=sk-or-v1-... to .env.local
 *
 * Both are 100% free, no credit card required.
 */

import OpenAI from "openai";

function buildClient(): { client: OpenAI; model: string; provider: string } {
  if (process.env.GROQ_API_KEY) {
    return {
      client: new OpenAI({
        apiKey: process.env.GROQ_API_KEY,
        baseURL: "https://api.groq.com/openai/v1",
      }),
      model: process.env.AI_MODEL?.trim() || "llama-3.3-70b-versatile",
      provider: "Groq",
    };
  }

  if (process.env.OPENROUTER_API_KEY) {
    return {
      client: new OpenAI({
        apiKey: process.env.OPENROUTER_API_KEY,
        baseURL: "https://openrouter.ai/api/v1",
        defaultHeaders: {
          "HTTP-Referer": "https://edupath.dev",
          "X-Title": "EduPath",
        },
      }),
      model: process.env.AI_MODEL?.trim() || "meta-llama/llama-3.3-70b-instruct:free",
      provider: "OpenRouter",
    };
  }

  // Neither key found — surface a clear error at runtime
  throw new Error(
    "No AI key found. Add GROQ_API_KEY (https://console.groq.com) " +
      "or OPENROUTER_API_KEY (https://openrouter.ai) to .env.local"
  );
}

// Lazy-initialise so Next.js module loading never throws on missing key —
// only actual AI calls will throw.
let _ai: ReturnType<typeof buildClient> | null = null;

export function getAI() {
  if (!_ai) _ai = buildClient();
  return _ai;
}

/** Convenience re-export: true if any AI key is present */
export function isAIConfigured(): boolean {
  return !!(process.env.GROQ_API_KEY || process.env.OPENROUTER_API_KEY);
}
