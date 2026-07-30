import { findOrCreateConversation, findOrCreateMultiRepoConversation, addMessage } from "../dao/conversation.dao.js";
import { runAgent, runAgentStream, runMultiRepoAgentStream } from "./agent.service.js";
import { findRepoById } from "../dao/repo.dao.js";

export const askQuestion = async (userId, repoId, question) => {
  const conversation = await findOrCreateConversation(userId, repoId);
  const { answer, citedChunks } = await runAgent(repoId, conversation.messages, question);

  await addMessage(conversation._id, { role: "user", content: question });
  await addMessage(conversation._id, { role: "assistant", content: answer, citedChunks });

  return { answer, citedChunks };
};

export const askQuestionStream = async (userId, repoId, question) => {
  const conversation = await findOrCreateConversation(userId, repoId);
  const { tokenStream, citedChunks } = await runAgentStream(repoId, conversation.messages, question);

  const persistMessages = async (fullAnswer) => {
    await addMessage(conversation._id, { role: "user", content: question });
    await addMessage(conversation._id, { role: "assistant", content: fullAnswer, citedChunks });
  };

  return { tokenStream, citedChunks, persistMessages, conversationId: conversation._id };
};

export const askMultiRepoQuestionStream = async (userId, repoIds, question) => {
  const conversation = await findOrCreateMultiRepoConversation(userId, repoIds);

  const repos = await Promise.all(repoIds.map((id) => findRepoById(id)));
  const repoNameById = {};
  repos.forEach((r) => {
    if (r) repoNameById[r._id.toString()] = r.name;
  });

  const { tokenStream, citedChunks } = await runMultiRepoAgentStream(
    repoIds,
    repoNameById,
    conversation.messages,
    question
  );

  const persistMessages = async (fullAnswer) => {
    await addMessage(conversation._id, { role: "user", content: question });
    await addMessage(conversation._id, { role: "assistant", content: fullAnswer, citedChunks });
  };

  return { tokenStream, citedChunks, persistMessages };
};