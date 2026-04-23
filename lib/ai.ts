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
  throw new Error(
    "No AI key found. Add GROQ_API_KEY or OPENROUTER_API_KEY to .env.local"
  );
}

let _ai: ReturnType<typeof buildClient> | null = null;

export function getAI() {
  if (!_ai) _ai = buildClient();
  return _ai;
}

export function isAIConfigured(): boolean {
  return !!(process.env.GROQ_API_KEY || process.env.OPENROUTER_API_KEY);
}

// Model presets
export const MODELS = {
  resume: "llama-3.3-70b-versatile",
  default: "llama-3.3-70b-versatile",
};

// Helper: call AI and return parsed JSON
export async function groqJSON<T>(
  prompt: string,
  model: string,
  maxTokens = 2048
): Promise<T> {
  const { client } = getAI();
  const completion = await client.chat.completions.create({
    model,
    max_tokens: maxTokens,
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
  });
  const text = completion.choices[0]?.message?.content ?? "{}";
  return JSON.parse(text) as T;
}