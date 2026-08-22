"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  IconMessageCircle,
  IconX,
  IconSend2,
  IconLoader2,
  IconAlertTriangle,
  IconRefresh,
  IconCopy,
  IconCheck,
  IconTrash,
  IconCompass,
  IconArrowUpRight,
} from "@tabler/icons-react";
import { toast } from "sonner";
import {
  sendChatMessage,
  type ChatMessage,
} from "@/lib/chat-service";

/* ------------------------------------------------------------------ */
/*  Enhanced Markdown-to-JSX renderer (Clean, Zero Emojis)            */
/* ------------------------------------------------------------------ */
function renderMarkdown(text: string): React.ReactNode {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let listBuffer: { type: "ul" | "ol"; items: string[] } | null = null;
  let tableBuffer: string[] | null = null;
  let keyIdx = 0;

  const flushList = () => {
    if (!listBuffer) return;
    const Tag = listBuffer.type === "ul" ? "ul" : "ol";
    const cls =
      listBuffer.type === "ul"
        ? "list-disc pl-5 my-2 space-y-1 text-xs text-neutral-200"
        : "list-decimal pl-5 my-2 space-y-1 text-xs text-neutral-200";
    elements.push(
      <Tag key={keyIdx++} className={cls}>
        {listBuffer.items.map((item, i) => (
          <li key={i}>{inlineFormat(item)}</li>
        ))}
      </Tag>
    );
    listBuffer = null;
  };

  const flushTable = () => {
    if (!tableBuffer || tableBuffer.length < 2) {
      tableBuffer = null;
      return;
    }

    const rows = tableBuffer
      .map((row) =>
        row
          .trim()
          .replace(/^\||\|$/g, "")
          .split("|")
          .map((c) => c.trim())
      )
      .filter((row) => row.some((cell) => cell.length > 0));

    if (rows.length < 2) {
      tableBuffer = null;
      return;
    }

    const headerRow = rows[0];
    const dataRows = rows.slice(1).filter((r) => !r.every((c) => /^:?-+:?$/.test(c)));

    elements.push(
      <div key={keyIdx++} className="overflow-x-auto my-3 rounded-md border border-neutral-800 bg-[#0a0a0a]">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-neutral-800 bg-neutral-900 text-[#c3eeb4] font-mono uppercase text-[10px] tracking-wider">
              {headerRow.map((col, idx) => (
                <th key={idx} className="py-2.5 px-3 font-medium">
                  {inlineFormat(col)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800/70 text-neutral-300">
            {dataRows.map((row, rIdx) => (
              <tr key={rIdx} className="hover:bg-neutral-900/40 transition-colors">
                {row.map((cell, cIdx) => (
                  <td key={cIdx} className="py-2 px-3 align-top leading-relaxed">
                    {inlineFormat(cell)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );

    tableBuffer = null;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Table lines
    if (line.trim().startsWith("|") && line.trim().endsWith("|")) {
      flushList();
      if (!tableBuffer) tableBuffer = [];
      tableBuffer.push(line);
      continue;
    } else if (tableBuffer) {
      flushTable();
    }

    // Headings
    const headingMatch = line.match(/^(#{1,4})\s+(.*)/);
    if (headingMatch) {
      flushList();
      const level = headingMatch[1].length;
      const content = headingMatch[2];
      
      if (level <= 2) {
        elements.push(
          <h3 key={keyIdx++} className="text-sm font-normal font-serif text-[#c3eeb4] mt-4 mb-2 border-b border-neutral-800/80 pb-1 tracking-tight">
            {inlineFormat(content)}
          </h3>
        );
      } else if (level === 3) {
        elements.push(
          <h4 key={keyIdx++} className="text-xs font-semibold text-white mt-3 mb-1 font-sans">
            {inlineFormat(content)}
          </h4>
        );
      } else {
        elements.push(
          <p key={keyIdx++} className="text-[11px] font-medium text-neutral-400 mt-2 mb-0.5 font-mono uppercase tracking-wider">
            {inlineFormat(content)}
          </p>
        );
      }
      continue;
    }

    // Blockquotes / Pro-Tips
    const quoteMatch = line.match(/^\>\s*(.*)/);
    if (quoteMatch) {
      flushList();
      elements.push(
        <div key={keyIdx++} className="my-2.5 p-3 rounded-md border-l-2 border-[#2d9b4c] bg-[#17261a] text-xs text-neutral-200 leading-relaxed font-sans">
          {inlineFormat(quoteMatch[1])}
        </div>
      );
      continue;
    }

    // Horizontal Rules
    if (/^\s*---+\s*$/.test(line)) {
      flushList();
      elements.push(<hr key={keyIdx++} className="my-3 border-neutral-800" />);
      continue;
    }

    // Unordered list items
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
      elements.push(<div key={keyIdx++} className="h-1.5" />);
      continue;
    }

    // Regular paragraph
    flushList();
    elements.push(
      <p key={keyIdx++} className="my-1 leading-relaxed text-xs text-neutral-200">
        {inlineFormat(line)}
      </p>
    );
  }
  flushList();
  flushTable();
  return <>{elements}</>;
}

/** Inline Markdown formatting: **bold**, *italic*, `code` */
function inlineFormat(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
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
        <strong key={idx++} className="font-semibold text-white font-sans">
          {match[2]}
        </strong>
      );
    } else if (match[3]) {
      parts.push(
        <em key={idx++} className="italic text-neutral-300">
          {match[3]}
        </em>
      );
    } else if (match[4]) {
      parts.push(
        <code
          key={idx++}
          className="bg-neutral-900 border border-neutral-800 text-[#c3eeb4] px-1.5 py-0.5 rounded text-[11px] font-mono"
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
/*  Starter Prompts (Clean Editorial Cards, Zero Emojis)              */
/* ------------------------------------------------------------------ */
const STARTER_PROMPTS = [
  { label: "7-Day Japan Route", query: "Plan a curated 7-day multi-city itinerary for Japan covering Tokyo and Kyoto with budget estimates." },
  { label: "Bali vs Thailand", query: "Compare Bali vs Thailand for a 1-week vacation in terms of budget, beaches, and culture." },
  { label: "Rajasthan Heritage Trail", query: "What is the ideal route for a 7-day heritage trip across Rajasthan?" },
  { label: "Amalfi Coast Budget", query: "How much does a luxury 5-day trip to Amalfi Coast typically cost?" },
];

export function TravelAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

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

      const userMessage: ChatMessage = { role: "user", content: text };
      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);
      setIsLoading(true);

      const result = await sendChatMessage(text, messages);

      if (result.error) {
        setLastError(result.error);
        setIsLoading(false);
        return;
      }

      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: result.reply,
      };
      setMessages([...updatedMessages, assistantMessage]);
      setIsLoading(false);
    },
    [inputValue, messages, isLoading]
  );

  const handleCopyMessage = (content: string, index: number) => {
    navigator.clipboard.writeText(content);
    setCopiedIdx(index);
    toast.success("Itinerary copied to clipboard");
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const handleClearChat = () => {
    setMessages([]);
    setLastError(null);
    toast.info("Conversation cleared");
  };

  const handleRetry = useCallback(() => {
    if (messages.length === 0) return;
    const lastUserMsg = [...messages]
      .reverse()
      .find((m) => m.role === "user");
    if (lastUserMsg) {
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

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-[9999] w-14 h-14 rounded-full bg-[#2d9b4c] hover:bg-[#38a454] text-white flex items-center justify-center cursor-pointer transition-colors shadow-2xl group"
            aria-label="Open travel assistant"
            id="travel-assistant-trigger"
          >
            <IconMessageCircle className="w-6 h-6 transition-transform group-hover:scale-110" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
            data-lenis-prevent="true"
            className="fixed bottom-6 right-6 z-[9999] w-[420px] sm:w-[460px] h-[640px] max-h-[85vh] bg-[#131313] border border-neutral-800 rounded-[16px] flex flex-col overflow-hidden shadow-[0_25px_70px_rgba(0,0,0,0.7)]"
            id="travel-assistant-panel"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800/80 bg-[#0d0d0d] shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#2d9b4c] flex items-center justify-center shrink-0">
                  <IconCompass className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-serif text-base font-normal text-white leading-tight">
                    GlobeTrotter Concierge
                  </h3>
                  <p className="text-[10px] text-neutral-400 font-sans tracking-wide">
                    Travel Architect & Route Assistant
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {messages.length > 0 && (
                  <button
                    onClick={handleClearChat}
                    className="p-1.5 rounded-md hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                    title="Clear Conversation"
                  >
                    <IconTrash className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-md hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                  aria-label="Close travel assistant"
                >
                  <IconX className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Scrollable Messages Area */}
            <div
              ref={chatContainerRef}
              data-lenis-prevent="true"
              data-lenis-prevent-wheel="true"
              data-lenis-prevent-touch="true"
              className="flex-1 min-h-0 overflow-y-auto px-5 py-5 space-y-4 overscroll-contain touch-pan-y"
              style={{ scrollbarWidth: "thin", scrollbarColor: "#333 #131313" }}
              id="travel-assistant-messages"
            >
              {/* Clean Editorial Empty State (No Emojis) */}
              {messages.length === 0 && !isLoading && (
                <div className="flex flex-col items-center justify-center h-full text-center px-2 py-4">
                  <div className="w-12 h-12 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center mb-4 text-[#c3eeb4]">
                    <IconCompass className="w-6 h-6" />
                  </div>
                  
                  <h4 className="font-serif text-2xl font-thin text-white mb-2 tracking-tight">
                    Plan Your Next Route
                  </h4>
                  
                  <p className="text-xs text-neutral-400 leading-relaxed max-w-[300px] mb-8 font-light">
                    Ask for multi-city itineraries, itemized budget estimates, destination comparisons, or timing logistics.
                  </p>

                  <div className="grid grid-cols-2 gap-2.5 w-full">
                    {STARTER_PROMPTS.map((prompt) => (
                      <button
                        key={prompt.label}
                        onClick={() => handleSend(prompt.query)}
                        className="text-left px-3.5 py-3 rounded-lg border border-neutral-800 bg-[#181818] hover:bg-neutral-800 hover:border-[#2d9b4c]/60 transition-all cursor-pointer flex flex-col justify-between h-[84px] group"
                      >
                        <span className="text-xs font-normal text-white group-hover:text-[#c3eeb4] transition-colors leading-snug">
                          {prompt.label}
                        </span>
                        <div className="flex items-center justify-end text-neutral-500 group-hover:text-white transition-colors">
                          <IconArrowUpRight className="w-3.5 h-3.5" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Message History */}
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`max-w-[92%] px-4 py-3 text-xs leading-relaxed relative group ${
                      msg.role === "user"
                        ? "bg-[#2d9b4c] text-white rounded-[14px] rounded-br-[2px]"
                        : "bg-[#181818] text-neutral-200 border border-neutral-800/80 rounded-[14px] rounded-bl-[2px]"
                    }`}
                  >
                    {msg.role === "assistant" ? (
                      <>
                        {renderMarkdown(msg.content)}
                        <button
                          onClick={() => handleCopyMessage(msg.content, i)}
                          className="absolute top-2 right-2 p-1 rounded bg-neutral-900/90 text-neutral-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                          title="Copy text"
                        >
                          {copiedIdx === i ? (
                            <IconCheck className="w-3.5 h-3.5 text-[#c3eeb4]" />
                          ) : (
                            <IconCopy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </>
                    ) : (
                      msg.content
                    )}
                  </div>
                </div>
              ))}

              {/* Loading Indicator */}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-[#181818] border border-neutral-800 rounded-[14px] rounded-bl-[2px] px-4 py-3 flex items-center gap-3">
                    <IconLoader2 className="w-4 h-4 text-[#c3eeb4] animate-spin" />
                    <span className="text-xs text-neutral-400 font-sans tracking-wide">
                      Architecting itinerary...
                    </span>
                  </div>
                </div>
              )}

              {/* Error State */}
              {lastError && !isLoading && (
                <div className="flex justify-start">
                  <div className="bg-red-950/40 border border-red-900/50 rounded-[14px] rounded-bl-[2px] px-4 py-3 max-w-[90%]">
                    <div className="flex items-start gap-2">
                      <IconAlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                      <p className="text-xs text-red-300 leading-relaxed font-sans">
                        {lastError}
                      </p>
                    </div>
                    <button
                      onClick={handleRetry}
                      className="flex items-center gap-1.5 mt-2 text-[11px] text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                    >
                      <IconRefresh className="w-3 h-3" />
                      Retry request
                    </button>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="px-5 py-3 border-t border-neutral-800/80 bg-[#0d0d0d] shrink-0">
              <div className="flex items-end gap-2">
                <textarea
                  ref={inputRef}
                  value={inputValue}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about destinations, routes, or budgets..."
                  disabled={isLoading}
                  rows={1}
                  className="flex-1 bg-neutral-900 border border-neutral-800 rounded-[10px] px-4 py-2.5 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-[#2d9b4c] transition-colors resize-none disabled:opacity-50"
                  style={{ maxHeight: "120px" }}
                  id="travel-assistant-input"
                />
                <button
                  onClick={() => handleSend()}
                  disabled={isLoading || !inputValue.trim()}
                  className="shrink-0 w-10 h-10 rounded-[10px] bg-[#2d9b4c] hover:bg-[#38a454] disabled:bg-neutral-800 disabled:text-neutral-600 text-white flex items-center justify-center transition-colors cursor-pointer disabled:cursor-not-allowed shadow-md"
                  aria-label="Send message"
                  id="travel-assistant-send"
                >
                  <IconSend2 className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[10px] text-neutral-500 mt-2 text-center font-sans tracking-wide">
                GlobeTrotter AI Concierge • Real-time travel guidance
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
