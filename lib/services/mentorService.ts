/**
 * Mentor Service Layer
 * Wraps AI Mentor API calls with caching, error handling, and retry logic.
 * Keeps pages clean and business logic centralized.
 */

export interface MentorMessage {
    role: "user" | "assistant";
    content: string;
}

// Simple in-memory cache for repeated questions (AI Response Caching)
const responseCache = new Map<string, string>();
const CACHE_MAX_SIZE = 100;

/**
 * Generate a cache key from the user message + context snapshot.
 * Only caches messages without conversation history (standalone Q&A).
 */
function getCacheKey(message: string, contextSnapshot: string): string {
    return `${message.toLowerCase().trim()}::${contextSnapshot}`;
}

/**
 * Trim cache if it exceeds max size (LRU-approximated by clearing oldest half)
 */
function trimCache() {
    if (responseCache.size >= CACHE_MAX_SIZE) {
        const keys = Array.from(responseCache.keys());
        keys.slice(0, Math.floor(CACHE_MAX_SIZE / 2)).forEach(k => responseCache.delete(k));
    }
}

/**
 * Get a cached response if available
 */
export function getCachedResponse(message: string, contextSnapshot: string): string | null {
    const key = getCacheKey(message, contextSnapshot);
    return responseCache.get(key) ?? null;
}

/**
 * Store a response in cache
 */
export function setCachedResponse(message: string, contextSnapshot: string, response: string): void {
    trimCache();
    responseCache.set(getCacheKey(message, contextSnapshot), response);
}

/**
 * Clear the entire response cache
 */
export function clearMentorCache(): void {
    responseCache.clear();
}

/**
 * Format conversation history for the API payload
 */
export function formatHistoryForApi(messages: MentorMessage[]): Array<{ role: string; content: string }> {
    return messages.map(m => ({
        role: m.role,
        content: m.content,
    }));
}

/**
 * Validate a mentor message before sending
 */
export function validateMessage(message: string): { valid: boolean; error?: string } {
    if (!message || typeof message !== "string") {
        return { valid: false, error: "Message cannot be empty" };
    }
    const trimmed = message.trim();
    if (trimmed.length === 0) {
        return { valid: false, error: "Message cannot be blank" };
    }
    if (trimmed.length > 4000) {
        return { valid: false, error: "Message is too long (max 4000 characters)" };
    }
    return { valid: true };
}
