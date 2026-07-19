/**
 * widget.js
 * Owns the launcher button's open/close state and the widget's
 * first-open behavior (welcome message, one-time launcher halo).
 * Delegates actual message rendering to chat.js.
 */

const RagWidget = (() => {
  const OPENED_BEFORE_KEY = "rag_widget_opened_before";

  const root = document.getElementById("rag-chat-widget");
  const launcher = document.getElementById("rag-launcher");
  const windowEl = document.getElementById("rag-window");
  const clearBtn = document.getElementById("rag-clear");

  let isOpen = false;

  function hasOpenedBefore() {
    try {
      return localStorage.getItem(OPENED_BEFORE_KEY) === "true";
    } catch {
      return false;
    }
  }

  function markOpenedBefore() {
    try {
      localStorage.setItem(OPENED_BEFORE_KEY, "true");
    } catch {
      /* ignore storage failures — non-critical */
    }
  }

  function open() {
    isOpen = true;
    root.classList.add("rag-widget--open");
    launcher.setAttribute("aria-expanded", "true");
    windowEl.setAttribute("aria-hidden", "false");

    if (hasOpenedBefore()) {
      root.classList.add("rag-widget--opened-once");
    } else {
      markOpenedBefore();
      // Halo plays once on this very first open, then never again.
      setTimeout(() => root.classList.add("rag-widget--opened-once"), 3400);
    }

    // Restore prior conversation, or greet for the first time.
    const restored = RagChat.restoreHistory();
    if (!restored) {
      RagChat.showWelcomeMessage();
    }

    document.getElementById("rag-input")?.focus();
  }

  function close() {
    isOpen = false;
    root.classList.remove("rag-widget--open");
    launcher.setAttribute("aria-expanded", "false");
    windowEl.setAttribute("aria-hidden", "true");
  }

  function toggle() {
    isOpen ? close() : open();
  }

  function init() {
    launcher.addEventListener("click", toggle);
    clearBtn.addEventListener("click", () => {
      RagChat.clearConversation();
      RagChat.showWelcomeMessage();
    });
  }

  return { init, open, close, toggle };
})();