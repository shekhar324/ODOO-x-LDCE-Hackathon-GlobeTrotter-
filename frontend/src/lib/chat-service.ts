/**
 * Chat service for communicating with the Flask chatbot backend.
 * All Flask API communication is centralized here — no scattered fetch() calls.
 */

const CHATBOT_API_URL =
  process.env.NEXT_PUBLIC_CHATBOT_API_URL || "http://localhost:5000";

const CHAT_ENDPOINT = `${CHATBOT_API_URL}/api/chat`;

/** Timeout for chat requests (ms) */
const REQUEST_TIMEOUT = 30_000;

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatResponse {
  reply: string;
  error?: undefined;
}

export interface ChatError {
  reply?: undefined;
  error: string;
}

/**
 * Send a message to the GlobeTrotter travel assistant.
 *
 * @param message - The user's current message
 * @param history - Prior conversation messages for context
 * @returns The assistant's reply or an error message
 */
export async function sendChatMessage(
  message: string,
  history: ChatMessage[] = []
): Promise<ChatResponse | ChatError> {
  const trimmed = message.trim();

  if (!trimmed) {
    return { error: "Please enter a message." };
  }

  if (trimmed.length > 4000) {
    return { error: "Message is too long. Please keep it under 4,000 characters." };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  try {
    const res = await fetch(CHAT_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: trimmed,
        history: history.map((m) => ({
          role: m.role,
          content: m.content,
        })),
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      const errMsg =
        body?.error || `Server responded with status ${res.status}.`;
      return { error: errMsg };
    }

    const data = await res.json();

    if (data.error) {
      return { error: data.error };
    }

    if (!data.reply || typeof data.reply !== "string") {
      return { error: "Received an unexpected response from the server." };
    }

    return { reply: data.reply };
  } catch (err: unknown) {
    clearTimeout(timeout);

    if (err instanceof DOMException && err.name === "AbortError") {
      return {
        error:
          "The request timed out. The travel assistant may be busy — please try again.",
      };
    }

    if (err instanceof TypeError && err.message.includes("fetch")) {
      return {
        error:
          "Unable to reach the travel assistant. Please make sure the server is running.",
      };
    }

    return {
      error:
        "The travel assistant is temporarily unavailable. Please try again.",
    };
  }
}
