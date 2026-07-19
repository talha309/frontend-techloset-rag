/**
 * main.js
 * App entry point. Wires up event listeners and boots the widget.
 * Keeps chat.js/widget.js free of direct event-binding concerns.
 */

document.addEventListener("DOMContentLoaded", () => {
  RagWidget.init();

  const form = document.getElementById("rag-input-form");
  const input = document.getElementById("rag-input");
  const sendBtn = document.getElementById("rag-send");

  async function handleSend() {
    const text = input.value;
    if (!text.trim()) return;

    input.value = "";
    autosize();
    sendBtn.disabled = true;

    await RagChat.sendUserMessage(text);

    sendBtn.disabled = false;
    input.focus();
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    handleSend();
  });

  // Enter sends; Shift+Enter inserts a newline.
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  });

  // Gentle autosize so the field grows with longer questions, capped by CSS max-height.
  function autosize() {
    input.style.height = "auto";
    input.style.height = `${input.scrollHeight}px`;
  }
  input.addEventListener("input", autosize);
});