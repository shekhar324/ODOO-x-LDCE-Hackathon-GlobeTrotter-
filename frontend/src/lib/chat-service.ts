/**
 * Chat service for communicating with the travel assistant.
 * Requests are proxied through Next.js API route (/api/chat) to the Flask backend.
 */

const CHAT_ENDPOINT = "/api/chat";

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

    return {
      error:
        "Unable to reach the travel assistant. Please make sure the backend server is running.",
    };
  }
}
