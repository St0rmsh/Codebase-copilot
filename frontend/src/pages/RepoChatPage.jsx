import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import UserMenu from "../components/UserMenu";
import MessageBubble from "../features/chat/components/MessageBubble";
import ChatInput from "../features/chat/components/ChatInput";
import CodeViewer from "../features/chat/components/CodeViewer";
import DependencyGraphView from "../features/repo/components/DependencyGraphView";
import { useChat } from "../features/chat/hooks/useChat";
import { useRepoById } from "../features/repo/hooks/useRepoById";
import { useRepoChunks } from "../features/repo/hooks/useRepoChunks";

const RepoChatPage = () => {
  const { repoId } = useParams();
  const { repo } = useRepoById(repoId);
  const { messages, streaming, sendStreaming } = useChat(repoId);
  const { loadChunks, findChunksByFile } = useRepoChunks(repoId);
  const [activeChunk, setActiveChunk] = useState(null);
  const [rightPanel, setRightPanel] = useState("code");

  useEffect(() => {
    loadChunks();
  }, [loadChunks]);

  const handleCitationClick = (chunk) => {
    setActiveChunk(chunk);
    setRightPanel("code");
  };

  const handleGraphNodeClick = (filePath) => {
    const matches = findChunksByFile(filePath);
    if (matches.length > 0) {
      setActiveChunk(matches[0]);
    } else {
      setActiveChunk({
        filePath,
        code: "// No indexed symbols found in this file (may only contain imports/config).",
        startLine: 1,
      });
    }
    setRightPanel("code");
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
              {messages.map((msg, i) => {
                const isLastMessage = i === messages.length - 1;
                const showCursor = streaming && isLastMessage && msg.role === "assistant";
                return (
                  <MessageBubble
                    key={i}
                    message={msg}
                    onCitationClick={handleCitationClick}
                    showCursor={showCursor}
                  />
                );
              })}
            </div>

            <div className="mt-4">
              <ChatInput onSend={sendStreaming} loading={streaming} />
            </div>
          </div>

          <div className="w-1/2 border-l border-border flex flex-col">
            <div className="flex border-b border-border">
              <button
                onClick={() => setRightPanel("code")}
                className={`flex-1 py-3 font-mono text-xs tracking-widest2 uppercase ${
                  rightPanel === "code" ? "text-accent border-b-2 border-accent" : "text-textMuted"
                }`}
              >
                Code
              </button>
              <button
                onClick={() => setRightPanel("graph")}
                className={`flex-1 py-3 font-mono text-xs tracking-widest2 uppercase ${
                  rightPanel === "graph" ? "text-accent border-b-2 border-accent" : "text-textMuted"
                }`}
              >
                Dependency Graph
              </button>
            </div>

            {rightPanel === "code" ? (
              <CodeViewer chunk={activeChunk} />
            ) : (
              <DependencyGraphView repoId={repoId} onNodeClick={handleGraphNodeClick} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RepoChatPage;