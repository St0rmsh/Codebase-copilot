import { findOrCreateConversation, addMessage } from "../dao/conversation.dao.js";
import { runAgent, runAgentStream } from "./agent.service.js";

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

// Returns the token stream + citedChunks + a function to persist the full answer once streaming completes
export const askQuestionStream = async (userId, repoId, question) => {
  const conversation = await findOrCreateConversation(userId, repoId);

  const { tokenStream, citedChunks } = await runAgentStream(repoId, conversation.messages, question);

  const persistMessages = async (fullAnswer) => {
    await addMessage(conversation._id, { role: "user", content: question });
    await addMessage(conversation._id, {
      role: "assistant",
      content: fullAnswer,
      citedChunks,
    });
  };

  return { tokenStream, citedChunks, persistMessages };
};