import Sidebar from "../components/Sidebar";
import UserMenu from "../components/UserMenu";
import ConversationCard from "../features/chat/components/ConversationCard";
import { useConversationHistory } from "../features/chat/hooks/useConversationHistory";
import { useNavigate } from "react-router-dom";

const HistoryPage = () => {
  const { conversations, loading, query, setQuery } = useConversationHistory();
  const navigate = useNavigate();

  const handleOpen = (conversation) => {
    if (conversation.isMultiRepo) {
      navigate("/compare");
    } else if (conversation.repoId) {
      navigate(`/repo/${conversation.repoId}/chat`);
    } else {
      navigate("/dashboard");
    }
  };

  return (
    <div className="flex min-h-screen bg-base">
      <Sidebar />
      <main className="flex-1 px-10 py-8">
        <div className="flex justify-end mb-6">
          <UserMenu />
        </div>

        <h1 className="font-display text-3xl mb-2">CHAT HISTORY</h1>
        <p className="font-mono text-xs text-textMuted tracking-widest2 uppercase mb-6">
          Search across all past conversations
        </p>

        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search conversations..."
          className="w-full max-w-xl bg-panel border border-border px-4 py-3 font-mono text-sm placeholder:text-textMuted outline-none focus:border-accent mb-8"
        />

        {loading ? (
          <p className="font-mono text-xs text-textMuted animate-pulse">Loading...</p>
        ) : conversations.length === 0 ? (
          <p className="font-mono text-xs text-textMuted">
            {query ? "No matching conversations found." : "No conversations yet."}
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {conversations.map((c) => (
              <ConversationCard key={c.id} conversation={c} onClick={() => handleOpen(c)} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default HistoryPage;