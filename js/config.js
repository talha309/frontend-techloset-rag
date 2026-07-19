/**
 * config.js
 * Single source of truth for backend URLs, storage keys, and copy.
 * Nothing else in the app should hardcode these values.
 */

const RAG_CONFIG = {
  // Backend
  API_BASE_URL: "https://backend-techloset-rag-fastapi-production.up.railway.app/docs",
  CHAT_ENDPOINT: "/chat",

  // Matches the exit keywords handled server-side in main.py
  EXIT_KEYWORDS: ["bye", "exit"],

  // localStorage
  STORAGE_KEY: "rag_chat_history_v1",
  STORAGE_MAX_MESSAGES: 200, // trims oldest messages beyond this to keep storage light

  // Copy
  WELCOME_MESSAGE:
    "Hi! I'm your website assistant. Ask me anything about this site and I'll do my best to answer, with sources when I can.",

  // Feature flags
  // STREAMING_ENABLED toggles SSE-based token streaming once the backend
  // exposes a streaming endpoint. api.js already exposes a streamMessage()
  // stub wired for this — flip this flag on when the backend is ready.
  STREAMING_ENABLED: false,
  STREAM_ENDPOINT: "/chat/stream",

  // UX
  TYPING_INDICATOR_MIN_MS: 500, // avoids a jarring flash for very fast responses
};