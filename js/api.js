/**
 * script.js
 * Main UI Controller for handling chat inputs, appending bubbles, 
 * and calling the streaming/non-streaming RagApi client.
 */

// DOM Elements Initialization
const chatContainer = document.getElementById("chat-container");
const chatInput = document.getElementById("chat-input");
const sendButton = document.getElementById("send-btn");

// Event Listeners for User Actions
sendButton.addEventListener("click", handleUserMessage);
chatInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault(); // Prevents line breaks on normal Enter press
    handleUserMessage();
  }
});

/**
 * Core function to handle user message flow
 */
async function handleUserMessage() {
  const messageText = chatInput.value.trim();
  if (!messageText) return; // Empty message block

  // 1. Clear input field instantly for better UX
  chatInput.value = "";

  // 2. Render User Message on screen
  appendMessageBubble(messageText, "user");

  // 3. Check configuration and route request accordingly
  if (RAG_CONFIG.STREAMING_ENABLED) {
    handleStreamingFlow(messageText);
  } else {
    await handleStandardFlow(messageText);
  }
}

/**
 * FLOW A: Real-time Streaming (EventSource / SSE)
 */
function handleStreamingFlow(query) {
  // Create an empty bot bubble that will receive words step-by-step
  const botBubbleElement = appendMessageBubble("", "assistant");

  // Add a quick loading state or visual cursor until token arrives
  botBubbleElement.innerHTML = '<span class="typing-cursor">...</span>';

  let isFirstToken = true;

  // Call the streamMessage client from api.js
  RagApi.streamMessage(query, {
    onToken: (token) => {
      if (isFirstToken) {
        botBubbleElement.textContent = ""; // Clear loader/cursor on first token
        isFirstToken = false;
      }
      // Append token cleanly without parsing dangerous HTML injections
      botBubbleElement.textContent += token;
      scrollToBottom();
    },
    onDone: (finalPayload) => {
      console.log("Streaming complete successfully.");
      // If backend returned goodbye or empty but structured data
      if (!botBubbleElement.textContent) {
        botBubbleElement.textContent = finalPayload.text;
      }
    },
    onError: (err) => {
      console.error("Streaming interface error:", err);
      botBubbleElement.textContent = "Error: Connection lost or backend crash.";
      botBubbleElement.style.color = "red";
    }
  });
}

/**
 * FLOW B: Standard Request/Response (Fallback JSON)
 */
async function handleStandardFlow(query) {
  // Render a localized loading state
  const loadingBubble = appendMessageBubble("Thinking...", "assistant");

  try {
    const response = await RagApi.sendMessage(query);
    // Replace loading message with actual backend data
    loadingBubble.textContent = response.text;
  } catch (err) {
    console.error("Standard workflow error:", err);
    loadingBubble.textContent = `Error: ${err.message || "Failed to reach backend."}`;
    loadingBubble.style.color = "red";
  } finally {
    scrollToBottom();
  }
}

/**
 * UI Utility: Dynamically creates and injects a messaging bubble
 * @param {string} text - Message content
 * @param {'user' | 'assistant'} sender - Role marker
 * @returns {HTMLElement} - The text container node for reactive edits
 */
function appendMessageBubble(text, sender) {
  const rowWrapper = document.createElement("div");
  rowWrapper.className = `message-row ${sender}-row`;

  const bubble = document.createElement("div");
  bubble.className = `message-bubble ${sender}-bubble`;
  bubble.textContent = text; // Safe text rendering injection guard

  rowWrapper.appendChild(bubble);
  chatContainer.appendChild(rowWrapper);

  scrollToBottom();
  return bubble; // Returned so streaming flow can track and modify it
}

/**
 * UI Utility: Smoothly sticks viewport scroll to the latest active text
 */
function scrollToBottom() {
  chatContainer.scrollTop = chatContainer.scrollHeight;
}