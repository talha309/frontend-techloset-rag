/**
 * chat.js
 * Orchestrates the send/receive flow. Talks to RagApi for network,
 * RagDom for rendering, and RagStorage for persistence.
 * Owns no DOM references directly beyond what RagDom exposes.
 */

const RagChat = (() => {
  function makeId() {
    return (crypto.randomUUID && crypto.randomUUID()) || `${Date.now()}-${Math.random()}`;
  }

  function persistAndRender(message) {
    RagStorage.append(message);
    RagDom.renderMessage(message);
    RagDom.scrollToBottom();
  }

  /** Restores a previous session's messages from localStorage on load. */
  function restoreHistory() {
    const history = RagStorage.load();
    if (history.length === 0) return false;
    RagDom.clearMessages();
    history.forEach((m) => RagDom.renderMessage(m));
    RagDom.scrollToBottom();
    return true;
  }

  /** Shown once, the very first time the widget is opened in a session. */
  function showWelcomeMessage() {
    const welcome = {
      id: makeId(),
      role: "ai",
      text: RAG_CONFIG.WELCOME_MESSAGE,
      citations: [],
      timestamp: Date.now(),
      isWelcome: true,
    };
    persistAndRender(welcome);
  }

  /** Full send flow: render user bubble, call backend, render AI bubble. */
  async function sendUserMessage(rawText) {
    const text = rawText.trim();
    if (!text) return;

    const userMessage = {
      id: makeId(),
      role: "user",
      text,
      timestamp: Date.now(),
    };
    persistAndRender(userMessage);

    const typingStartedAt = Date.now();
    RagDom.showTyping();

    try {
      const { text: replyText, citations } = await RagApi.sendMessage(text);

      // Keep the typing indicator visible briefly even on a fast reply,
      // so it reads as a deliberate response rather than a flicker.
      const elapsed = Date.now() - typingStartedAt;
      const remaining = Math.max(0, RAG_CONFIG.TYPING_INDICATOR_MIN_MS - elapsed);
      await new Promise((resolve) => setTimeout(resolve, remaining));

      RagDom.hideTyping();

      const aiMessage = {
        id: makeId(),
        role: "ai",
        text: replyText,
        citations,
        timestamp: Date.now(),
      };
      persistAndRender(aiMessage);
    } catch (err) {
      RagDom.hideTyping();
      const errorMessage = {
        id: makeId(),
        role: "ai",
        text: "Something went wrong reaching the assistant. Please try again.",
        timestamp: Date.now(),
        isError: true,
      };
      persistAndRender(errorMessage);
      console.error("RagChat: sendUserMessage failed.", err);
    }
  }

  function clearConversation() {
    RagStorage.clear();
    RagDom.clearMessages();
  }

  return {
    restoreHistory,
    showWelcomeMessage,
    sendUserMessage,
    clearConversation,
  };
})();