import { findOrCreateConversation, addMessage } from "../dao/conversation.dao.js";
import { runAgent } from "./agent.service.js";

export const askQuestion = async (userId, repoId, question) => {
  const conversation = await findOrCreateConversation(userId, repoId);

  const { answer, citedChunks } = await runAgent(repoId, conversation.messages, question);

  await addMessage(conversation._id, { role: "user", content: question });
  await addMessage(conversation._id, {
    role: "assistant",
    content: answer,
    citedChunks,
  });

  return { answer, citedChunks };
};