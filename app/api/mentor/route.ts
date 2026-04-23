import { GoogleGenerativeAI } from "@google/generative-ai";
import { buildContextualPrompt, MENTOR_SYSTEM_PROMPT, type UserContext } from "@/lib/mentorprompt";
import { getAI, isAIConfigured } from "@/lib/ai";

type MentorHistoryMessage = {
    role: "user" | "assistant";
    content: string;
};

type MentorRequestBody = {
    message?: string;
    conversationHistory?: MentorHistoryMessage[];
    userContext?: Partial<UserContext>;
};

/**
 * POST /api/mentor
 * Handles AI mentor chat requests with streaming responses.
 * Powered by Groq (llama-3.3-70b-versatile) — 100% free.
 */
export async function POST(request: Request) {
    try {
        const body = (await request.json()) as MentorRequestBody;
        const { message, conversationHistory = [], userContext = {} } = body;

        if (!message || typeof message !== "string") {
            return new Response(
                JSON.stringify({ error: "Message is required" }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        if (!isAIConfigured()) {
            return new Response(
                JSON.stringify({
                    error: "AI service not configured. Add GROQ_API_KEY to .env.local (free at console.groq.com)"
                }),
                { status: 500, headers: { "Content-Type": "application/json" } }
            );
        }

        const { client, model } = getAI();

        const systemPrompt = userContext && Object.keys(userContext).length > 0
            ? buildContextualPrompt(userContext as UserContext)
            : MENTOR_SYSTEM_PROMPT;

        // Build messages array (OpenAI-compatible format)
        const messages: { role: "system" | "user" | "assistant"; content: string }[] = [
            { role: "system", content: systemPrompt },
            ...conversationHistory.map((msg) => ({
                role: msg.role as "user" | "assistant",
                content: msg.content,
            })),
            { role: "user", content: message },
        ];

        // Stream the response
        const streamResponse = await client.chat.completions.create({
            model,
            messages,
            stream: true,
            temperature: 0.7,
            max_tokens: 2048,
        });

        const encoder = new TextEncoder();
        const stream = new ReadableStream({
            async start(controller) {
                try {
                    for await (const chunk of streamResponse) {
                        const text = chunk.choices[0]?.delta?.content ?? "";
                        if (text) {
                            controller.enqueue(
                                encoder.encode(`data: ${JSON.stringify({ text })}\n\n`)
                            );
                        }
                    }
                    controller.enqueue(encoder.encode("data: [DONE]\n\n"));
                    controller.close();
                } catch (error) {
                    console.error("Streaming error:", error);
                    controller.error(error);
                }
            },
        });

        return new Response(stream, {
            headers: {
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
            },
        });

    } catch (error: unknown) {
        console.error("AI Mentor API Error:", error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error";

        if (errorMessage.includes("401") || errorMessage.includes("invalid_api_key")) {
            return new Response(
                JSON.stringify({ error: "Invalid API key. Check GROQ_API_KEY in .env.local" }),
                { status: 401, headers: { "Content-Type": "application/json" } }
            );
        }

        if (errorMessage.includes("429") || errorMessage.includes("quota") || errorMessage.includes("rate_limit")) {
            return new Response(
                JSON.stringify({ error: "Rate limit hit. Groq free tier: 30 req/min. Try again in a moment." }),
                { status: 429, headers: { "Content-Type": "application/json" } }
            );
        }

        return new Response(
            JSON.stringify({
                error: "Failed to process your request. Please try again.",
                details: errorMessage,
            }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
}

/**
 * GET /api/mentor — Health check
 */
export async function GET() {
    let provider = "none";
    let model = "none";
    try {
        const ai = getAI();
        provider = ai.provider;
        model = ai.model;
    } catch { /* not configured */ }

    return new Response(
        JSON.stringify({
            status: "ok",
            service: "AI Mentor",
            configured: isAIConfigured(),
            provider,
            model,
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
    );
}
