import axios from "axios";
import { findRepoById } from "../dao/repo.dao.js";
import { findUserByIdWithGithubToken } from "../dao/user.dao.js";
import { searchRepoChunks } from "./search.service.js";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatMistralAI } from "@langchain/mistralai";
import { ChatCohere } from "@langchain/cohere";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import config from "../config/config.js";

const geminiLLM = new ChatGoogleGenerativeAI({
  apiKey: config.GOOGLE_API_KEY,
  model: "gemini-2.0-flash",
  temperature: 0.2,
});
const mistralLLM = new ChatMistralAI({
  apiKey: config.MISTRAL_API_KEY,
  model: "mistral-small-latest",
  temperature: 0.2,
});
const cohereLLM = new ChatCohere({
  apiKey: config.COHERE_API_KEY,
  model: "command-r",
  temperature: 0.2,
});

const PROVIDERS = [geminiLLM, mistralLLM, cohereLLM];

const invokeWithFallback = async (messages) => {
  let lastError;
  for (const llm of PROVIDERS) {
    try {
      return await llm.invoke(messages);
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError;
};

const fetchPrDiff = async (owner, repoName, prNumber, accessToken) => {
  const headers = accessToken ? { Authorization: `Bearer ${accessToken}` } : {};

  const prRes = await axios.get(
    `https://api.github.com/repos/${owner}/${repoName}/pulls/${prNumber}`,
    { headers }
  );

  const filesRes = await axios.get(
    `https://api.github.com/repos/${owner}/${repoName}/pulls/${prNumber}/files`,
    { headers, params: { per_page: 100 } }
  );

  return {
    title: prRes.data.title,
    description: prRes.data.body || "",
    author: prRes.data.user?.login,
    baseBranch: prRes.data.base?.ref,
    headBranch: prRes.data.head?.ref,
    files: filesRes.data.map((f) => ({
      filename: f.filename,
      status: f.status, // added | modified | removed
      additions: f.additions,
      deletions: f.deletions,
      patch: f.patch || "", // the actual diff hunk, may be undefined for binary/huge files
    })),
  };
};

const buildDiffSummaryText = (files) => {
  const MAX_PATCH_CHARS = 3000; // guard against giant diffs blowing up the prompt
  return files
    .map((f) => {
      const patchExcerpt = f.patch
        ? f.patch.slice(0, MAX_PATCH_CHARS) + (f.patch.length > MAX_PATCH_CHARS ? "\n... (truncated)" : "")
        : "(no diff available — binary or too large)";
      return `### ${f.filename} (${f.status}, +${f.additions}/-${f.deletions})\n\`\`\`diff\n${patchExcerpt}\n\`\`\``;
    })
    .join("\n\n");
};

export const reviewPullRequest = async (repoId, prNumber, userId) => {
  const repo = await findRepoById(repoId);
  if (!repo) {
    const error = new Error("Repo not found");
    error.statusCode = 404;
    throw error;
  }

  const [owner, repoName] = repo.fullName.split("/");

  let accessToken = null;
  if (repo.private) {
    const user = await findUserByIdWithGithubToken(userId);
    accessToken = user?.githubAccessToken;
  }

  const pr = await fetchPrDiff(owner, repoName, prNumber, accessToken);

  // Pull relevant existing codebase context — search using the changed filenames + PR title as the query,
  // so the AI can reason about how these changes relate to surrounding code, not just the diff in isolation
  const searchQuery = `${pr.title} ${pr.files.map((f) => f.filename).join(" ")}`.slice(0, 500);
  const relatedChunks = await searchRepoChunks(repoId, searchQuery, 5);

  const contextBlock = relatedChunks
    .map(
      (c, i) =>
        `[${i + 1}] ${c.filePath} (lines ${c.startLine}-${c.endLine})\n\`\`\`\n${c.code}\n\`\`\``
    )
    .join("\n\n");

  const diffText = buildDiffSummaryText(pr.files);

  const systemPrompt = `You are a senior code reviewer. Review the following pull request diff for this codebase. Consider:
1. What the change does, in plain terms
2. Potential bugs, edge cases, or risks
3. Whether it's consistent with existing patterns in the codebase (shown in context below)
4. Anything that looks incomplete or worth double-checking before merging

Be specific and reference file names/lines where relevant. Keep it concise and actionable — this is a real review, not a summary.

EXISTING CODEBASE CONTEXT (for consistency checking):
${contextBlock || "(no closely related code found)"}`;

  const userPrompt = `Pull Request: "${pr.title}" by ${pr.author}
${pr.baseBranch} <- ${pr.headBranch}

Description:
${pr.description || "(no description provided)"}

Changed files (${pr.files.length}):
${diffText}`;

  const response = await invokeWithFallback([
    new SystemMessage(systemPrompt),
    new HumanMessage(userPrompt),
  ]);

  return {
    prTitle: pr.title,
    prAuthor: pr.author,
    filesChanged: pr.files.length,
    review: response.content,
  };
};

export const listOpenPullRequests = async (repoId, userId) => {
  const repo = await findRepoById(repoId);
  if (!repo) {
    const error = new Error("Repo not found");
    error.statusCode = 404;
    throw error;
  }

  const [owner, repoName] = repo.fullName.split("/");

  let accessToken = null;
  if (repo.private) {
    const user = await findUserByIdWithGithubToken(userId);
    accessToken = user?.githubAccessToken;
  }

  const headers = accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
  const res = await axios.get(`https://api.github.com/repos/${owner}/${repoName}/pulls`, {
    headers,
    params: { state: "open", per_page: 30 },
  });

  return res.data.map((pr) => ({
    number: pr.number,
    title: pr.title,
    author: pr.user?.login,
    createdAt: pr.created_at,
    url: pr.html_url,
  }));
};