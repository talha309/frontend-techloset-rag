/**
 * api.js
 * Thin client wrapping calls to the FastAPI backend.
 * Reads its base URL / endpoints from RAG_CONFIG (config.js).
 * Exposes a single global: RagApi
 */

const RagApi = (() => {

  /**
   * Standard (non-streaming) request. Hits POST /chat.
   * Backend returns: { success, question, answer }
   * We normalize to: { text }
   */
  async function sendMessage(query) {
    const url = `${RAG_CONFIG.API_BASE_URL}${RAG_CONFIG.CHAT_ENDPOINT}`;

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });

    if (!res.ok) {
      let detail = `HTTP ${res.status}`;
      try {
        const errBody = await res.json();
        detail = errBody.detail || detail;
      } catch (_) {
        // response wasn't JSON, keep the generic detail
      }
      throw new Error(detail);
    }

    const data = await res.json();
    return { text: data.answer };
  }

  /**
   * Streaming request. Hits GET /stream?query=... via SSE (EventSource).
   * Backend sends lines like: "data: <chunk>\n\n" and a final "data: [DONE]\n\n"
   *
   * @param {string} query
   * @param {{ onToken?: (t:string)=>void, onDone?: (payload:{text:string})=>void, onError?: (e:Error)=>void }} handlers
   * @returns {() => void} a cancel function to close the connection early
   */
  function streamMessage(query, { onToken, onDone, onError } = {}) {
    const url = `${RAG_CONFIG.API_BASE_URL}${RAG_CONFIG.STREAM_ENDPOINT}?query=${encodeURIComponent(query)}`;

    let fullText = "";
    let source;

    try {
      source = new EventSource(url);
    } catch (err) {
      onError && onError(err instanceof Error ? err : new Error(String(err)));
      return () => {};
    }

    source.onmessage = (event) => {
      const raw = event.data;

      if (raw === "[DONE]") {
        source.close();
        onDone && onDone({ text: fullText });
        return;
      }

      fullText += raw;
      onToken && onToken(raw);
    };

    source.onerror = () => {
      source.close();
      onError && onError(new Error("Connection lost or backend crash."));
    };

    // Allow the caller to cancel the stream manually if needed
    return () => source.close();
  }

  return { sendMessage, streamMessage };
})();