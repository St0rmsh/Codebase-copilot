import Conversation from "../models/conversation.model.js";

export const findOrCreateConversation = async (userId, repoId) => {
  let conversation = await Conversation.findOne({ user: userId, repo: repoId });
  if (!conversation) {
    conversation = await Conversation.create({ user: userId, repo: repoId, messages: [] });
  }
  return conversation;
};

export const addMessage = async (conversationId, message) => {
  return await Conversation.findByIdAndUpdate(
    conversationId,
    { $push: { messages: message } },
    { returnDocument: "after" }
  );
};

export const findConversationById = async (id) => {
  return await Conversation.findById(id);
};

export const findOrCreateMultiRepoConversation = async (userId, repoIds) => {
  const sortedIds = [...repoIds].sort();
  let conversation = await Conversation.findOne({
    user: userId,
    repos: { $size: sortedIds.length, $all: sortedIds },
  });
  if (!conversation) {
    conversation = await Conversation.create({ user: userId, repos: sortedIds, messages: [] });
  }
  return conversation;
};