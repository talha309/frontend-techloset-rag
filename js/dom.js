/**
 * dom.js
 * Pure DOM manipulation helpers. No business logic, no fetch calls.
 */

const RagDom = (() => {
  const messagesEl = document.getElementById("rag-messages");
  const typingEl = document.getElementById("rag-typing");

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  function formatTime(timestamp) {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  /**
   * Renders a single message bubble.
   * message: { role: 'user'|'ai', text, citations, timestamp, isWelcome?, isError? }
   */
  function renderMessage(message) {
    const wrapper = document.createElement("div");
    wrapper.className = `rag-msg rag-msg--${message.role}`;
    if (message.isWelcome) wrapper.classList.add("rag-msg--welcome");
    if (message.isError) wrapper.classList.add("rag-msg--error");

    const bubble = document.createElement("div");
    bubble.className = "rag-msg__bubble";
    bubble.innerHTML = escapeHtml(message.text).replace(/\n/g, "<br>");

    if (message.citations && message.citations.length > 0) {
      const citationsEl = document.createElement("div");
      citationsEl.className = "rag-citations";
      message.citations.forEach((c) => {
        const chip = document.createElement(c.url ? "a" : "span");
        chip.className = "rag-citation-chip";
        chip.textContent = c.label || "source";
        if (c.url) {
          chip.href = c.url;
          chip.target = "_blank";
          chip.rel = "noopener noreferrer";
        }
        citationsEl.appendChild(chip);
      });
      bubble.appendChild(citationsEl);
    }

    if (message.timestamp) {
      const ts = document.createElement("span");
      ts.className = "rag-msg__timestamp";
      ts.textContent = formatTime(message.timestamp);
      bubble.appendChild(ts);
    }

    wrapper.appendChild(bubble);
    messagesEl.appendChild(wrapper);
    return wrapper;
  }

  function clearMessages() {
    messagesEl.innerHTML = "";
  }

  function scrollToBottom() {
    // rAF ensures layout has settled (e.g. after image/font load) before measuring
    requestAnimationFrame(() => {
      messagesEl.scrollTop = messagesEl.scrollHeight;
    });
  }

  function showTyping() {
    typingEl.hidden = false;
    scrollToBottom();
  }

  function hideTyping() {
    typingEl.hidden = true;
  }

  return {
    renderMessage,
    clearMessages,
    scrollToBottom,
    showTyping,
    hideTyping,
  };
})();