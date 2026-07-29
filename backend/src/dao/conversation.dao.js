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



export const findConversationsByUser = async (userId) => {
  return await Conversation.find({ user: userId })
    .populate("repo", "name fullName")
    .populate("repos", "name fullName")
    .sort({ updatedAt: -1 });
};


export const searchConversationsByText = async (userId, query) => {
  return await Conversation.find({
    user: userId,
    "messages.content": { $regex: query, $options: "i" },
  })
    .populate("repo", "name fullName")
    .populate("repos", "name fullName")
    .sort({ updatedAt: -1 })
    .limit(20);
};

export const findConversationByIdForUser = async (conversationId, userId) => {
  return await Conversation.findOne({ _id: conversationId, user: userId })
    .populate("repo", "name fullName")
    .populate("repos", "name fullName");
};