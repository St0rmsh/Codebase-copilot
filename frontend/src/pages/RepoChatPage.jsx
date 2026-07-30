import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import UserMenu from "../components/UserMenu";
import MessageBubble from "../features/chat/components/MessageBubble";
import ChatInput from "../features/chat/components/ChatInput";
import CodeViewer from "../features/chat/components/CodeViewer";
import DependencyGraphView from "../features/repo/components/DependencyGraphView";
import TraceSymbolPanel from "../features/repo/components/TraceSymbolPanel";
import OnboardingDocModal from "../features/repo/components/OnboardingDocModal";
import { useChat } from "../features/chat/hooks/useChat";
import { useRepoById } from "../features/repo/hooks/useRepoById";
import { useRepoChunks } from "../features/repo/hooks/useRepoChunks";
import { useDispatch } from "react-redux";
import { rebuildRepo } from "../features/repo/services/repoService";
import { showToast } from "../App/toastSlice";
import ExportChatButton from "../features/chat/components/ExportChatButton";



const TABS = [
  { id: "code", label: "Code" },
  { id: "graph", label: "Dependency Graph" },
  { id: "trace", label: "Trace Symbol" },
];

const RepoChatPage = () => {
  const { repoId } = useParams();
  const { repo } = useRepoById(repoId);
  const { messages, streaming, sendStreaming, conversationId } = useChat(repoId);
  const { loadChunks, findChunksByFile } = useRepoChunks(repoId);
  const [activeChunk, setActiveChunk] = useState(null);
  const [rightPanel, setRightPanel] = useState("code");
  const [docModalOpen, setDocModalOpen] = useState(false);
  const dispatch = useDispatch();
  const [rebuilding, setRebuilding] = useState(false);

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



  const handleDeploy = async () => {
  setRebuilding(true);
  try {
    await rebuildRepo(repoId);
    dispatch(showToast("Repository rebuilt successfully.", "success"));
  } catch {
    dispatch(showToast("Rebuild failed.", "error"));
  } finally {
    setRebuilding(false);
  }
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
           <button onClick={() => setDocModalOpen(true)} className="hover:text-white">
              📄 Onboarding Doc
            </button>
            <ExportChatButton conversationId={conversationId} repoName={repo?.name} />
            <button onClick={handleDeploy} disabled={rebuilding} className="bg-accent text-white px-4 py-2 tracking-widest2 disabled:opacity-50">
              {rebuilding ? "Deploying..." : "Deploy"}
            </button>
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
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setRightPanel(tab.id)}
                  className={`flex-1 py-3 font-mono text-xs tracking-widest2 uppercase ${
                    rightPanel === tab.id ? "text-accent border-b-2 border-accent" : "text-textMuted"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {rightPanel === "code" && <CodeViewer chunk={activeChunk} />}
            {rightPanel === "graph" && (
              <DependencyGraphView repoId={repoId} onNodeClick={handleGraphNodeClick} />
            )}
            {rightPanel === "trace" && <TraceSymbolPanel repoId={repoId} />}
          </div>
        </div>
      </div>

      {docModalOpen && (
        <OnboardingDocModal
          repoId={repoId}
          repoName={repo?.name || "repo"}
          onClose={() => setDocModalOpen(false)}
        />
      )}
    </div>
  );
};

export default RepoChatPage;