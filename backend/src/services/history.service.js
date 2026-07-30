import {
  findConversationsByUser,
  searchConversationsByText,
  findConversationByIdForUser,
} from "../dao/conversation.dao.js";

const summarize = (conversation) => {
  const lastMessage = conversation.messages[conversation.messages.length - 1];
  const firstUserMessage = conversation.messages.find((m) => m.role === "user");

  const isMultiRepo = !!conversation.repos?.length;

  const repoLabel = conversation.repo
    ? conversation.repo.fullName
    : conversation.repos?.map((r) => r.fullName).join(" vs ") || "Unknown repo";

  return {
    id: conversation._id,
    repoId: conversation.repo?._id || null,
    repoIds: conversation.repos?.map((r) => r._id) || [],
    repoLabel,
    isMultiRepo,
    messageCount: conversation.messages.length,
    preview: firstUserMessage?.content?.slice(0, 120) || "",
    lastMessageAt: lastMessage?.createdAt || conversation.updatedAt,
    updatedAt: conversation.updatedAt,
  };
};

export const listConversations = async (userId) => {
  const conversations = await findConversationsByUser(userId);
  return conversations.map(summarize);
};

export const searchConversations = async (userId, query) => {
  const conversations = await searchConversationsByText(userId, query);
  return conversations.map((c) => {
    const summary = summarize(c);
    const matchingMessage = c.messages.find((m) =>
      m.content.toLowerCase().includes(query.toLowerCase())
    );
    return {
      ...summary,
      matchSnippet: matchingMessage?.content?.slice(0, 150) || summary.preview,
    };
  });
};

export const getConversationDetail = async (conversationId, userId) => {
  const conversation = await findConversationByIdForUser(conversationId, userId);
  if (!conversation) {
    const error = new Error("Conversation not found");
    error.statusCode = 404;
    throw error;
  }
  return conversation;
};

export const exportConversation = async (conversationId, userId) => {
  const conversation = await findConversationByIdForUser(conversationId, userId);
  if (!conversation) throw new Error("Conversation not found");

  const markdown = convertToMarkdown(conversation);

  return {
    content: markdown,
    filename: `conversation-${conversation._id}.md`,
    contentType: "text/markdown",
  };
};

const convertToMarkdown = (conversation) => {
  let md = `# Chat Conversation: ${conversation.repo?.fullName || "Multi-repo"}\n\n`;

  if (conversation.repos?.length) {
    md += `**Repositories:**\n` +
          conversation.repos.map(r => `- ${r.fullName}`).join("\n") + "\n\n";
  }

  md += `**Date:** ${new Date(conversation.updatedAt).toLocaleString()}\n\n`;
  md += `---` + "\n\n";

  conversation.messages.forEach((msg) => {
    const role = msg.role === "assistant" ? "🤖 AI" : "👤 You";
    md += `**${role}**\n\n`;

    if (msg.citedChunks && msg.citedChunks.length > 0) {
      md += "_" + msg.citedChunks.map(c => `${c.filePath}:${c.startLine}`).join(", ") + "_" + "\n\n";
    }

    md += msg.content + "\n\n";
    md += `---` + "\n\n";
  });

  return md;
};