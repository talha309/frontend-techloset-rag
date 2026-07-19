/**
 * storage.js
 * Wraps localStorage so the rest of the app never touches it directly.
 * Message shape: { id, role: 'user' | 'ai', text, citations, timestamp }
 */

const RagStorage = (() => {
  function load() {
    try {
      const raw = localStorage.getItem(RAG_CONFIG.STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (err) {
      console.warn("RagStorage: failed to read history, starting fresh.", err);
      return [];
    }
  }

  function save(messages) {
    try {
      const trimmed = messages.slice(-RAG_CONFIG.STORAGE_MAX_MESSAGES);
      localStorage.setItem(RAG_CONFIG.STORAGE_KEY, JSON.stringify(trimmed));
    } catch (err) {
      // Storage can fail (quota, private mode) — chat should still work in-memory.
      console.warn("RagStorage: failed to persist history.", err);
    }
  }

  function append(message) {
    const history = load();
    history.push(message);
    save(history);
    return history;
  }

  function clear() {
    try {
      localStorage.removeItem(RAG_CONFIG.STORAGE_KEY);
    } catch (err) {
      console.warn("RagStorage: failed to clear history.", err);
    }
  }

  function hasHistory() {
    return load().length > 0;
  }

  return { load, save, append, clear, hasHistory };
})();