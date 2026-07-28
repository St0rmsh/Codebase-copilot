export const streamMultiRepoChatMessage = async (repoIds, question, callbacks) => {
  const { onCitations, onToken, onDone, onError } = callbacks;

  const response = await fetch(`/api/multi-repo-chat/stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ repoIds, question }),
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
        if (payload.type === "citations") onCitations(payload.citedChunks);
        else if (payload.type === "token") onToken(payload.content);
        else if (payload.type === "done") onDone();
        else if (payload.type === "error") onError(payload.message);
      } catch {
        // wait for more data
      }
    }
  }
};