import { useState } from "react";
import Sidebar from "../components/Sidebar";
import UserMenu from "../components/UserMenu";
import MultiRepoSelector from "../features/repo/components/MultiRepoSelector";
import MultiRepoCitationChip from "../features/chat/components/MultiRepoCitationChip";
import { useMultiRepoChat } from "../features/chat/hooks/useMultiRepoChat";
import MarkdownRenderer from "../components/MarkdownRenderer";


const CompareReposPage = () => {
  const [activeRepoIds, setActiveRepoIds] = useState(null);
  const [input, setInput] = useState("");
  const { messages, streaming, error, send } = useMultiRepoChat(activeRepoIds || []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || streaming) return;
    send(input.trim());
    setInput("");
  };

  if (!activeRepoIds) {
    return (
      <div className="flex min-h-screen bg-base">
        <Sidebar />
        <main className="flex-1 px-10 py-8">
          <div className="flex justify-end mb-6">
            <UserMenu />
          </div>
          <MultiRepoSelector onStart={setActiveRepoIds} />
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-base">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <div className="flex justify-between items-center px-6 py-4 border-b border-border font-mono text-xs text-textMuted tracking-widest2 uppercase">
          <span>Comparing {activeRepoIds.length} repositories</span>
          <div className="flex items-center gap-6">
            <button onClick={() => setActiveRepoIds(null)} className="hover:text-white">
              Change Selection
            </button>
            <UserMenu />
          </div>
        </div>

        <div className="flex-1 flex flex-col p-6 max-w-3xl w-full mx-auto overflow-hidden">
          <div className="flex-1 overflow-y-auto pr-2">
            {messages.length === 0 && (
              <p className="font-mono text-xs text-textMuted">
                Ask a question comparing the selected repositories.
              </p>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"} mb-6`}>
                {msg.role === "assistant" && (
                  <div className="flex items-center gap-2 mb-2 font-mono text-xs text-accent tracking-widest2 uppercase">
                    <span>⚡</span> Copilot Core
                  </div>
                )}
                <div className={`max-w-[90%] px-4 py-3 text-sm ${msg.role === "user" ? "bg-panel border border-border" : ""}`}>
                 {msg.role === "user" ? ( <span className="whitespace-pre-wrap">{msg.content}</span>) : (
                 <>
                <MarkdownRenderer content={msg.content} />
                {streaming && i === messages.length - 1 && (
                <span className="inline-block w-2 h-4 bg-accent ml-0.5 animate-pulse align-middle" />
               )}
    </>
  )}
</div>
                {msg.citedChunks?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {msg.citedChunks.map((chunk, ci) => (
                      <MultiRepoCitationChip key={ci} chunk={chunk} />
                    ))}
                  </div>
                )}
              </div>
            ))}
            {error && <p className="font-mono text-xs text-accent">{error}</p>}
          </div>

          <form onSubmit={handleSubmit} className="border border-border flex items-center px-4 py-3 gap-3 mt-4">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Compare architecture, patterns, dependencies..."
              disabled={streaming}
              className="flex-1 bg-transparent outline-none font-mono text-sm placeholder:text-textMuted"
            />
            <button type="submit" disabled={streaming} className="text-accent disabled:opacity-40">
              ➤
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CompareReposPage;