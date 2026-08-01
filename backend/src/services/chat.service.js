import { findOrCreateConversation, findOrCreateMultiRepoConversation, addMessage } from "../dao/conversation.dao.js";
import { runAgent, runAgentStream, runMultiRepoAgentStream } from "./agent.service.js";
import { findRepoById } from "../dao/repo.dao.js";
import { isTeamMember } from "../dao/team.dao.js";

export const askQuestion = async (userId, repoId, question) => {
  const conversation = await findOrCreateConversation(userId, repoId);
  const { answer, citedChunks } = await runAgent(repoId, conversation.messages, question);

  await addMessage(conversation._id, { role: "user", content: question });
  await addMessage(conversation._id, { role: "assistant", content: answer, citedChunks });

  return { answer, citedChunks };
};

export const askQuestionStream = async (userId, repoId, question) => {
  const repo = await findRepoById(repoId);
  if (!repo) {
    const error = new Error("Repo not found");
    error.statusCode = 404;
    throw error;
  }

  const isOwner = repo.user.toString() === userId.toString();
  const isMember = repo.team ? await isTeamMember(repo.team, userId) : false;
  const isPublic = repo.visibility === "public";

  if (!isOwner && !isMember && !isPublic) {
    const error = new Error("You don't have access to this repository");
    error.statusCode = 403;
    throw error;
  }

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