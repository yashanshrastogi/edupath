import { useState, useCallback, useRef } from "react";

export interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
}

export interface UserContext {
    skills?: string[];
    targetRole?: string;
    currentLevel?: string;
    completedRoadmaps?: string[];
    weakAreas?: string[];
}

export function useChat(userContext?: UserContext) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    /**
     * Send a message to the AI mentor
     */
    const sendMessage = useCallback(
        async (content: string) => {
            if (!content.trim() || isLoading) return;

            // Add user message
            const userMessage: Message = {
                id: `user-${Date.now()}`,
                role: "user",
                content: content.trim(),
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, userMessage]);
            setIsLoading(true);
            setError(null);

            // Create assistant message placeholder
            const assistantId = `assistant-${Date.now()}`;
            const assistantMessage: Message = {
                id: assistantId,
                role: "assistant",
                content: "",
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, assistantMessage]);

            try {
                // Create abort controller for cancellation
                abortControllerRef.current = new AbortController();

                // Build conversation history (exclude the current assistant placeholder)
                const conversationHistory = messages.map((msg) => ({
                    role: msg.role,
                    content: msg.content,
                }));

                // Call API with streaming
                const response = await fetch("/api/mentor", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        message: content.trim(),
                        conversationHistory,
                        userContext,
                    }),
                    signal: abortControllerRef.current.signal,
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.error || `HTTP ${response.status}`);
                }

                // Handle streaming response
                const reader = response.body?.getReader();
                const decoder = new TextDecoder();

                if (!reader) {
                    throw new Error("No response body");
                }

                let accumulatedText = "";

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    const chunk = decoder.decode(value, { stream: true });
                    const lines = chunk.split("\n");

                    for (const line of lines) {
                        if (line.startsWith("data: ")) {
                            const data = line.slice(6);

                            if (data === "[DONE]") {
                                break;
                            }

                            try {
                                const parsed = JSON.parse(data);
                                if (parsed.text) {
                                    accumulatedText += parsed.text;

                                    // Update assistant message with accumulated text
                                    setMessages((prev) =>
                                        prev.map((msg) =>
                                            msg.id === assistantId
                                                ? { ...msg, content: accumulatedText }
                                                : msg
                                        )
                                    );
                                }
                            } catch {
                                // Ignore parse errors for incomplete chunks
                            }
                        }
                    }
                }

                setIsLoading(false);
            } catch (err: unknown) {
                if (err instanceof Error && err.name === "AbortError") {
                    setError("Request cancelled");
                } else {
                    console.error("Chat error:", err);
                    setError(err instanceof Error ? err.message : "Failed to send message");
                }

                // Remove the failed assistant message
                setMessages((prev) => prev.filter((msg) => msg.id !== assistantId));
                setIsLoading(false);
            }
        },
        [messages, isLoading, userContext]
    );

    /**
     * Cancel ongoing request
     */
    const cancelRequest = useCallback(() => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
        }
    }, []);

    /**
     * Clear chat history
     */
    const clearChat = useCallback(() => {
        setMessages([]);
        setError(null);
    }, []);

    return {
        messages,
        isLoading,
        error,
        sendMessage,
        cancelRequest,
        clearChat,
    };
}
