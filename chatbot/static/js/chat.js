/**
 * Globe Trotter - AI Travel Assistant Chat Controller (Powered by Gemini)
 */

document.addEventListener("DOMContentLoaded", () => {
  const chatToggleBtn = document.getElementById("chat-toggle-btn");
  const chatWindow = document.getElementById("chat-window");
  const chatCloseBtn = document.getElementById("chat-close-btn");
  const chatForm = document.getElementById("chat-form");
  const chatInput = document.getElementById("chat-input");
  const chatMessages = document.getElementById("chat-messages");
  const typingIndicator = document.getElementById("chat-typing-indicator");
  const tripContextBadge = document.getElementById("trip-context-badge");
  const quickChipsContainer = document.getElementById("quick-chips");

  // Multi-turn chat history
  let chatHistory = [];

  // Detect active trip context if available on the current page
  const activeTripId = window.CURRENT_TRIP_ID || document.body.dataset.tripId || null;
  const activeTripTitle = window.CURRENT_TRIP_TITLE || document.body.dataset.tripTitle || null;

  if (activeTripId && tripContextBadge) {
    tripContextBadge.classList.remove("hidden");
    const nameEl = tripContextBadge.querySelector(".trip-name");
    if (nameEl && activeTripTitle) {
      nameEl.textContent = activeTripTitle;
    }
  }

  // Toggle Chat Window
  function toggleChat(forceOpen = null) {
    if (!chatWindow) return;
    const shouldOpen = forceOpen !== null ? forceOpen : chatWindow.classList.contains("hidden");
    if (shouldOpen) {
      chatWindow.classList.remove("hidden");
      chatWindow.classList.add("flex");
      setTimeout(() => chatInput && chatInput.focus(), 150);
      scrollToBottom();
    } else {
      chatWindow.classList.add("hidden");
      chatWindow.classList.remove("flex");
    }
  }

  if (chatToggleBtn) {
    chatToggleBtn.addEventListener("click", () => toggleChat());
  }

  if (chatCloseBtn) {
    chatCloseBtn.addEventListener("click", () => toggleChat(false));
  }

  // Expose global opener for buttons on other pages (e.g., "Ask AI" in builder)
  window.openTravelAI = function (initialPrompt = "") {
    toggleChat(true);
    if (initialPrompt && chatInput) {
      chatInput.value = initialPrompt;
      sendMessage(initialPrompt);
    }
  };

  // Quick Chips Click Handling
  if (quickChipsContainer) {
    quickChipsContainer.addEventListener("click", (e) => {
      const chip = e.target.closest(".quick-chip");
      if (chip) {
        const prompt = chip.dataset.prompt;
        if (prompt) {
          sendMessage(prompt);
        }
      }
    });
  }

  // Form Submit
  if (chatForm) {
    chatForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const message = chatInput.value.trim();
      if (!message) return;
      sendMessage(message);
    });
  }

  // Send Message Routine
  async function sendMessage(userText) {
    if (!userText) return;

    // Clear input
    if (chatInput) chatInput.value = "";

    // Append User Message to UI
    appendMessage("user", userText);
    scrollToBottom();

    // Show Typing Indicator
    if (typingIndicator) typingIndicator.classList.remove("hidden");

    try {
      const payload = {
        message: userText,
        history: chatHistory,
        trip_id: activeTripId
      };

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (typingIndicator) typingIndicator.classList.add("hidden");

      if (data.success && data.response) {
        appendMessage("assistant", data.response, data.provider);
        // Record in chat history
        chatHistory.push({ role: "user", content: userText });
        chatHistory.push({ role: "model", content: data.response });
      } else {
        appendMessage("assistant", "⚠️ " + (data.error || "Sorry, I couldn't process that. Please try again."));
      }
    } catch (err) {
      console.error("Chat error:", err);
      if (typingIndicator) typingIndicator.classList.add("hidden");
      appendMessage("assistant", "⚠️ Network error connecting to AI concierge. Please check your connection.");
    }

    scrollToBottom();
  }

  // Append Message Helper
  function appendMessage(role, text, provider = null) {
    if (!chatMessages) return;

    const isUser = role === "user";
    const msgDiv = document.createElement("div");
    msgDiv.className = `flex ${isUser ? "justify-end" : "justify-start"} mb-4`;

    const bubble = document.createElement("div");
    bubble.className = `max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${
      isUser
        ? "bg-gradient-to-r from-sky-600 to-blue-600 text-white rounded-br-none"
        : "bg-white border border-slate-200 text-slate-800 rounded-bl-none"
    }`;

    if (isUser) {
      bubble.textContent = text;
    } else {
      // Parse markdown using marked.js if available, else plain text
      let htmlContent = "";
      if (window.marked) {
        htmlContent = window.marked.parse(text);
      } else {
        htmlContent = `<p>${escapeHtml(text)}</p>`;
      }

      let footerHtml = "";
      if (provider) {
        const isGemini = provider.includes("gemini");
        footerHtml = `
          <div class="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span class="inline-flex items-center gap-1 font-medium ${isGemini ? 'text-sky-600' : 'text-amber-600'}">
              <i class="fa-solid fa-wand-magic-sparkles"></i> ${isGemini ? 'Gemini 2.5 Flash' : 'Aero Smart Travel'}
            </span>
            <span>Just now</span>
          </div>
        `;
      }

      bubble.innerHTML = `<div class="markdown-body text-sm">${htmlContent}</div>${footerHtml}`;
    }

    msgDiv.appendChild(bubble);
    chatMessages.appendChild(msgDiv);
  }

  function scrollToBottom() {
    if (chatMessages) {
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }
});
