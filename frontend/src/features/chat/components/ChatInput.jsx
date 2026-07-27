import { useState } from "react";

const ChatInput = ({ onSend, loading }) => {
  const [value, setValue] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!value.trim() || loading) return;
    onSend(value.trim());
    setValue("");
  };

  return (
    <form onSubmit={handleSubmit} className="border border-border flex items-center px-4 py-3 gap-3">
      <span className="text-textMuted">📎</span>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Ask about the codebase..."
        disabled={loading}
        className="flex-1 bg-transparent outline-none font-mono text-sm placeholder:text-textMuted"
      />
      <button type="submit" disabled={loading} className="text-accent disabled:opacity-40">
        ➤
      </button>
    </form>
  );
};

export default ChatInput;