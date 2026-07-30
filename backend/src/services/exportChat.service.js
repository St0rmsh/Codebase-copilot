import { findConversationByIdForUser } from "../dao/conversation.dao.js";

const formatCitations = (citedChunks) => {
  if (!citedChunks?.length) return "";
  return citedChunks
    .map((c) => {
      const repoPrefix = c.repoName ? `${c.repoName} — ` : "";
      return `- ${repoPrefix}\`${c.filePath}\` (lines ${c.startLine}-${c.endLine})`;
    })
    .join("\n");
};

export const buildChatExportMarkdown = async (conversationId, userId) => {
  const conversation = await findConversationByIdForUser(conversationId, userId);
  if (!conversation) {
    const error = new Error("Conversation not found");
    error.statusCode = 404;
    throw error;
  }

  const repoLabel = conversation.repo
    ? conversation.repo.fullName
    : conversation.repos?.map((r) => r.fullName).join(" vs ") || "Unknown repository";

  const header = `# Chat Export — ${repoLabel}

> Exported from Codebase Copilot on ${new Date().toISOString().split("T")[0]}

---
`;

  const body = conversation.messages
    .map((msg) => {
      const roleLabel = msg.role === "user" ? "### 🧑 You" : "### ⚡ Copilot Core";
      const citations = formatCitations(msg.citedChunks);
      const citationBlock = citations ? `\n\n**Sources:**\n${citations}` : "";
      return `${roleLabel}\n\n${msg.content}${citationBlock}`;
    })
    .join("\n\n---\n\n");

  return header + body;
};