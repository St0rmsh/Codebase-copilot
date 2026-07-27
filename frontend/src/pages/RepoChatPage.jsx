import { useState } from "react";
import { useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import UserMenu from "../components/UserMenu";
import MessageBubble from "../features/chat/components/MessageBubble";
import ChatInput from "../features/chat/components/ChatInput";
import CodeViewer from "../features/chat/components/CodeViewer";
import { useChat } from "../features/chat/hooks/useChat";
import { useRepoById } from "../features/repo/hooks/useRepoById";

const RepoChatPage = () => {
  const { repoId } = useParams();
  const { repo } = useRepoById(repoId);
  const { messages, loading, send } = useChat(repoId);
  const [activeChunk, setActiveChunk] = useState(null);

  const handleCitationClick = (chunk) => {
    setActiveChunk(chunk);
  };

  return (
    <div className="flex min-h-screen bg-base">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <div className="flex justify-between items-center px-6 py-4 border-b border-border font-mono text-xs text-textMuted tracking-widest2 uppercase">
          <div className="flex items-center gap-3">
            <span>{repo?.fullName || "Loading..."}</span>
            <span className="bg-border px-2 py-1">v1.0.0-stable</span>
          </div>
          <div className="flex items-center gap-6">
            <span>Sync</span>
            <button className="bg-accent text-white px-4 py-2 tracking-widest2">Deploy</button>
            <UserMenu />
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <div className="w-1/2 flex flex-col p-6 overflow-hidden">
            <div className="flex-1 overflow-y-auto pr-2">
              {messages.length === 0 && (
                <p className="font-mono text-xs text-textMuted">
                  Ask a question about this codebase to get started.
                </p>
              )}
              {messages.map((msg, i) => (
                <MessageBubble key={i} message={msg} onCitationClick={handleCitationClick} />
              ))}
              {loading && (
                <p className="font-mono text-xs text-accent animate-pulse">Copilot is thinking...</p>
              )}
            </div>

            <div className="mt-4">
              <ChatInput onSend={send} loading={loading} />
            </div>
          </div>

          <div className="w-1/2 border-l border-border flex flex-col">
            <CodeViewer chunk={activeChunk} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RepoChatPage;