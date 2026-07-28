import CitationChip from "./CitationChip";
import MarkdownRenderer from "../../../components/MarkdownRenderer";

const MessageBubble = ({ message, onCitationClick, showCursor }) => {
  const isUser = message.role === "user";

  return (
    <div className={`flex flex-col ${isUser ? "items-end" : "items-start"} mb-6`}>
      {!isUser && (
        <div className="flex items-center gap-2 mb-2 font-mono text-xs text-accent tracking-widest2 uppercase">
          <span>⚡</span> Copilot Core
        </div>
      )}

      <div className={`max-w-[85%] px-4 py-3 text-sm ${isUser ? "bg-panel border border-border" : ""}`}>
        {isUser ? (
          <span className="whitespace-pre-wrap">{message.content}</span>
        ) : (
          <>
            <MarkdownRenderer content={message.content} />
            {showCursor && (
              <span className="inline-block w-2 h-4 bg-accent ml-0.5 animate-pulse align-middle" />
            )}
          </>
        )}
      </div>

      {!isUser && message.citedChunks?.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {message.citedChunks.map((chunk, i) => (
            <CitationChip key={i} chunk={chunk} onClick={onCitationClick} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MessageBubble;