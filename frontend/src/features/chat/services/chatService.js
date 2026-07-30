import axiosInstance from "../../../services/axiosInstance";

export const sendChatMessage = async (repoId, question) => {
  const res = await axiosInstance.post(`/repos/${repoId}/chat`, { question });
  return res.data;
};

// Streaming uses raw fetch since it needs to read the response body incrementally
export const streamChatMessage = async (repoId, question, callbacks) => {
  const { onConversationId, onCitations, onToken, onDone, onError } = callbacks;

  const response = await fetch(`/api/repos/${repoId}/chat/stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ question }),
  });

  if (!response.ok || !response.body) {
    onError("Failed to connect to stream");
    return;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split("\n\n");
    buffer = parts.pop();

    for (const part of parts) {
      if (!part.startsWith("data:")) continue;
      const jsonStr = part.slice(5).trim();
      if (!jsonStr) continue;

      try {
        const payload = JSON.parse(jsonStr);
        if (payload.type === "conversation") onConversationId?.(payload.conversationId);
        else if (payload.type === "citations") onCitations(payload.citedChunks);
        else if (payload.type === "token") onToken(payload.content);
        else if (payload.type === "done") onDone();
        else if (payload.type === "error") onError(payload.message);
      } catch {
        // wait for more data
      }
    }
  }
};


