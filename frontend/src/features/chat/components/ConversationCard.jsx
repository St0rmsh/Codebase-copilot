import ExportChatButton from "./ExportChatButton";

const timeAgo = (dateStr) => {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

const ConversationCard = ({ conversation, onClick }) => (
  <div className="bg-panel border border-border p-4 hover:border-accent/50 transition">
    <button onClick={onClick} className="w-full text-left">
      <div className="flex justify-between items-start mb-2">
        <span className="font-mono text-xs text-accentSoft uppercase tracking-widest2">
          {conversation.isMultiRepo ? "⇄ Compare" : conversation.repoLabel}
        </span>
        <span className="font-mono text-xs text-textMuted shrink-0 ml-3">
          {timeAgo(conversation.updatedAt)}
        </span>
      </div>
      <p className="font-mono text-xs text-white leading-relaxed line-clamp-2">
        {conversation.matchSnippet || conversation.preview}
      </p>
      <p className="font-mono text-xs text-textMuted mt-2">{conversation.messageCount} messages</p>
    </button>
    <div className="mt-3 pt-3 border-t border-border">
      <ExportChatButton conversationId={conversation.id} repoName={conversation.repoLabel} />
    </div>
  </div>
);

export default ConversationCard;