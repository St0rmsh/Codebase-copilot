import { useState } from "react";
import { streamMultiRepoChatMessage } from "../services/multiRepoChatService";

export const useMultiRepoChat = (repoIds) => {
  const [messages, setMessages] = useState([]);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState(null);

  const send = async (question) => {
    setError(null);
    setStreaming(true);
    setMessages((prev) => [...prev, { role: "user", content: question }, { role: "assistant", content: "", citedChunks: [] }]);

    await streamMultiRepoChatMessage(repoIds, question, {
      onCitations: (citedChunks) => {
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { ...updated[updated.length - 1], citedChunks };
          return updated;
        });
      },
      onToken: (content) => {
        setMessages((prev) => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          updated[updated.length - 1] = { ...last, content: last.content + content };
          return updated;
        });
      },
      onDone: () => setStreaming(false),
      onError: (message) => {
        setError(message);
        setStreaming(false);
      },
    });
  };

  return { messages, streaming, error, send };
};