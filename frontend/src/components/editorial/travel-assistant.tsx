"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  IconMessageCircle,
  IconX,
  IconSend2,
  IconMapPin,
  IconLoader2,
  IconAlertTriangle,
  IconRefresh,
} from "@tabler/icons-react";
import {
  sendChatMessage,
  type ChatMessage,
} from "@/lib/chat-service";

/* ------------------------------------------------------------------ */
/*  Lightweight Markdown-to-JSX renderer                              */
/*  Handles: **bold**, *italic*, `code`, headings, bullets, numbered  */
/*  lists, and line breaks. No external dependency needed.            */
/* ------------------------------------------------------------------ */
function renderMarkdown(text: string): React.ReactNode {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let listBuffer: { type: "ul" | "ol"; items: string[] } | null = null;
  let keyIdx = 0;

  const flushList = () => {
    if (!listBuffer) return;
    const Tag = listBuffer.type === "ul" ? "ul" : "ol";
    const cls =
      listBuffer.type === "ul"
        ? "list-disc pl-5 my-1.5 space-y-0.5"
        : "list-decimal pl-5 my-1.5 space-y-0.5";
    elements.push(
      <Tag key={keyIdx++} className={cls}>
        {listBuffer.items.map((item, i) => (
          <li key={i}>{inlineFormat(item)}</li>
        ))}
      </Tag>
    );
    listBuffer = null;
  };

  for (const raw of lines) {
    const line = raw;

    // Headings
    const headingMatch = line.match(/^(#{1,4})\s+(.*)/);
    if (headingMatch) {
      flushList();
      const level = headingMatch[1].length;
      const content = headingMatch[2];
      const cls =
        level <= 2
          ? "text-sm font-semibold text-white/95 mt-3 mb-1"
          : "text-xs font-semibold text-white/80 mt-2 mb-0.5";
      elements.push(
        <p key={keyIdx++} className={cls}>
          {inlineFormat(content)}
        </p>
      );
      continue;
    }

    // Unordered list items (-, *, •)
    const ulMatch = line.match(/^\s*[-*•]\s+(.*)/);
    if (ulMatch) {
      if (listBuffer?.type !== "ul") {
        flushList();
        listBuffer = { type: "ul", items: [] };
      }
      listBuffer!.items.push(ulMatch[1]);
      continue;
    }

    // Ordered list items
    const olMatch = line.match(/^\s*\d+[.)]\s+(.*)/);
    if (olMatch) {
      if (listBuffer?.type !== "ol") {
        flushList();
        listBuffer = { type: "ol", items: [] };
      }
      listBuffer!.items.push(olMatch[1]);
      continue;
    }

    // Empty line
    if (!line.trim()) {
      flushList();
      elements.push(<br key={keyIdx++} />);
      continue;
    }

    // Regular paragraph
    flushList();
    elements.push(
      <p key={keyIdx++} className="my-0.5 leading-relaxed">
        {inlineFormat(line)}
      </p>
    );
  }
  flushList();
  return <>{elements}</>;
}

/** Inline Markdown formatting: **bold**, *italic*, `code` */
function inlineFormat(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  // Match: **bold**, *italic*, `code`
  const regex = /(\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`)/g;
  let last = 0;
  let match: RegExpExecArray | null;
  let idx = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) {
      parts.push(text.slice(last, match.index));
    }
    if (match[2]) {
      parts.push(
        <strong key={idx++} className="font-semibold text-white/95">
          {match[2]}
        </strong>
      );
    } else if (match[3]) {
      parts.push(
        <em key={idx++} className="italic text-white/80">
          {match[3]}
        </em>
      );
    } else if (match[4]) {
      parts.push(
        <code
          key={idx++}
          className="bg-white/10 text-[#c3eeb4] px-1.5 py-0.5 rounded text-[11px] font-mono"
        >
          {match[4]}
        </code>
      );
    }
    last = match.index + match[0].length;
  }
  if (last < text.length) {
    parts.push(text.slice(last));
  }
  return <>{parts}</>;
}

/* ------------------------------------------------------------------ */
/*  Suggested starter prompts                                         */
/* ------------------------------------------------------------------ */
const STARTER_PROMPTS = [
  "Best time to visit Japan?",
  "Plan a 5-day trip to Italy",
  "Bali vs Thailand for a week",
  "Hidden gems in Portugal",
];

/* ------------------------------------------------------------------ */
/*  TravelAssistant Component                                         */
/* ------------------------------------------------------------------ */
export function TravelAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new messages
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const handleSend = useCallback(
    async (overrideMessage?: string) => {
      const text = (overrideMessage ?? inputValue).trim();
      if (!text || isLoading) return;

      setLastError(null);
      setInputValue("");

      // Add user message
      const userMessage: ChatMessage = { role: "user", content: text };
      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);
      setIsLoading(true);

      // Send to Flask with full history
      const result = await sendChatMessage(text, messages);

      if (result.error) {
        setLastError(result.error);
        setIsLoading(false);
        return;
      }

      // Add assistant reply
      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: result.reply || "",
      };
      setMessages([...updatedMessages, assistantMessage]);
      setIsLoading(false);
    },
    [inputValue, messages, isLoading]
  );

  const handleRetry = useCallback(() => {
    if (messages.length === 0) return;
    const lastUserMsg = [...messages]
      .reverse()
      .find((m) => m.role === "user");
    if (lastUserMsg) {
      // Remove the last user message and retry
      setMessages(messages.slice(0, -1));
      handleSend(lastUserMsg.content);
    }
  }, [messages, handleSend]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Auto-resize textarea
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  };

  return (
    <>
      {/* ── Floating Trigger Button ── */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-[9999] w-14 h-14 rounded-full bg-[#38a454] hover:bg-[#2d9b4c] text-white flex items-center justify-center cursor-pointer transition-colors group"
            aria-label="Open travel assistant"
            id="travel-assistant-trigger"
          >
            <IconMessageCircle className="w-6 h-6 transition-transform group-hover:scale-110" />

            {/* Subtle pulse ring */}
            {messages.length === 0 && (
              <span className="absolute inset-0 rounded-full bg-[#38a454] animate-ping opacity-20 pointer-events-none" />
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Chat Panel ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
            className="fixed bottom-6 right-6 z-[9999] w-[380px] sm:w-[420px] h-[580px] max-h-[80vh] bg-[#131313] border border-neutral-800 rounded-[15px] flex flex-col overflow-hidden"
            style={{ boxShadow: "0 24px 80px rgba(0,0,0,0.5)" }}
            id="travel-assistant-panel"
          >
            {/* ── Header ── */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800 bg-[#0e0e0e] flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#38a454] flex items-center justify-center flex-shrink-0">
                  <IconMapPin className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-serif text-base font-light text-white leading-tight">
                    Travel Assistant
                  </h3>
                  <p className="text-[10px] text-neutral-500 font-sans">
                    GlobeTrotter AI
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-full hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                aria-label="Close travel assistant"
                id="travel-assistant-close"
              >
                <IconX className="w-4 h-4" />
              </button>
            </div>

            {/* ── Messages Area ── */}
            <div
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto px-4 py-4 space-y-3 scroll-smooth"
              id="travel-assistant-messages"
            >
              {/* Empty state */}
              {messages.length === 0 && !isLoading && (
                <div className="flex flex-col items-center justify-center h-full text-center px-4 gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#38a454]/15 flex items-center justify-center">
                    <IconMapPin className="w-6 h-6 text-[#38a454]" />
                  </div>
                  <div>
                    <p className="font-serif text-lg font-light text-white mb-1">
                      Where to next?
                    </p>
                    <p className="text-xs text-neutral-500 leading-relaxed max-w-[260px]">
                      Ask about destinations, plan itineraries, compare trips, or get practical travel advice.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 w-full max-w-[300px] mt-1">
                    {STARTER_PROMPTS.map((prompt) => (
                      <button
                        key={prompt}
                        onClick={() => handleSend(prompt)}
                        className="text-[11px] text-left px-3 py-2.5 rounded-[10px] border border-neutral-800 text-neutral-300 hover:border-[#38a454]/50 hover:text-white transition-colors cursor-pointer leading-snug"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Message history */}
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] px-4 py-3 text-[13px] leading-relaxed ${
                      msg.role === "user"
                        ? "bg-[#38a454] text-white rounded-[14px] rounded-br-[4px]"
                        : "bg-[#1f1f1f] text-neutral-200 border border-neutral-800 rounded-[14px] rounded-bl-[4px]"
                    }`}
                  >
                    {msg.role === "assistant"
                      ? renderMarkdown(msg.content)
                      : msg.content}
                  </div>
                </div>
              ))}

              {/* Loading state */}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-[#1f1f1f] border border-neutral-800 rounded-[14px] rounded-bl-[4px] px-4 py-3 flex items-center gap-2">
                    <IconLoader2 className="w-4 h-4 text-[#38a454] animate-spin" />
                    <span className="text-xs text-neutral-400">
                      Planning...
                    </span>
                  </div>
                </div>
              )}

              {/* Error state */}
              {lastError && !isLoading && (
                <div className="flex justify-start">
                  <div className="bg-red-950/40 border border-red-900/50 rounded-[14px] rounded-bl-[4px] px-4 py-3 max-w-[85%]">
                    <div className="flex items-start gap-2">
                      <IconAlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-red-300 leading-relaxed">
                        {lastError}
                      </p>
                    </div>
                    <button
                      onClick={handleRetry}
                      className="flex items-center gap-1.5 mt-2 text-[11px] text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                    >
                      <IconRefresh className="w-3 h-3" />
                      Try again
                    </button>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* ── Input Area ── */}
            <div className="px-4 py-3 border-t border-neutral-800 bg-[#0e0e0e] flex-shrink-0">
              <div className="flex items-end gap-2">
                <textarea
                  ref={inputRef}
                  value={inputValue}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about any destination..."
                  disabled={isLoading}
                  rows={1}
                  className="flex-1 bg-neutral-900 border border-neutral-800 rounded-[10px] px-4 py-2.5 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-[#38a454]/60 transition-colors resize-none disabled:opacity-50"
                  style={{ maxHeight: "120px" }}
                  id="travel-assistant-input"
                />
                <button
                  onClick={() => handleSend()}
                  disabled={isLoading || !inputValue.trim()}
                  className="flex-shrink-0 w-10 h-10 rounded-[10px] bg-[#38a454] hover:bg-[#2d9b4c] disabled:bg-neutral-800 disabled:text-neutral-600 text-white flex items-center justify-center transition-colors cursor-pointer disabled:cursor-not-allowed"
                  aria-label="Send message"
                  id="travel-assistant-send"
                >
                  <IconSend2 className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[10px] text-neutral-600 mt-2 text-center">
                GlobeTrotter AI may provide general guidance — always verify travel details with official sources.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
