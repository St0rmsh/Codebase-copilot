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