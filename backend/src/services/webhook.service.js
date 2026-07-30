import axios from "axios";
import config from "../config/config.js";
import { findRepoById, saveWebhookInfo, findRepoByIdWithWebhookSecret, findRepoByGithubRepoId } from "../dao/repo.dao.js";
import { findUserByIdWithGithubToken } from "../dao/user.dao.js";
import { generateWebhookSecret, verifyGithubSignature } from "../utils/webhookSecret.js";
import { syncRepo } from "./sync.service.js";

export const enableAutoSync = async (repoId, userId) => {
  const repo = await findRepoById(repoId);
  if (!repo || repo.user.toString() !== userId.toString()) {
    const error = new Error("Only the repo owner can enable auto-sync");
    error.statusCode = 403;
    throw error;
  }

  const user = await findUserByIdWithGithubToken(userId);
  if (!user?.githubAccessToken) {
    const error = new Error("Github account not connected");
    error.statusCode = 400;
    throw error;
  }

  const webhookSecret = generateWebhookSecret();
  const [owner, repoName] = repo.fullName.split("/");

  const res = await axios.post(
    `https://api.github.com/repos/${owner}/${repoName}/hooks`,
    {
      name: "web",
      active: true,
      events: ["push"],
      config: {
        url: `${config.BACKEND_URL}/api/webhooks/github`,
        content_type: "json",
        secret: webhookSecret,
      },
    },
    { headers: { Authorization: `Bearer ${user.githubAccessToken}` } }
  );

  await saveWebhookInfo(repoId, res.data.id, webhookSecret);

  return { message: "Auto-sync enabled" };
};

export const disableAutoSync = async (repoId, userId) => {
  const repo = await findRepoById(repoId);
  if (!repo || repo.user.toString() !== userId.toString()) {
    const error = new Error("Only the repo owner can disable auto-sync");
    error.statusCode = 403;
    throw error;
  }
  if (!repo.webhookId) {
    return { message: "Auto-sync was not enabled" };
  }

  const user = await findUserByIdWithGithubToken(userId);
  const [owner, repoName] = repo.fullName.split("/");

  await axios
    .delete(`https://api.github.com/repos/${owner}/${repoName}/hooks/${repo.webhookId}`, {
      headers: { Authorization: `Bearer ${user.githubAccessToken}` },
    })
    .catch(() => {}); // webhook may already be gone on GitHub's side, don't fail on that

  await saveWebhookInfo(repoId, null, null);

  return { message: "Auto-sync disabled" };
};

export const handleGithubWebhook = async (payload, signature, rawBody) => {
  const githubRepoId = payload.repository?.id;
  if (!githubRepoId) {
    const error = new Error("Invalid webhook payload");
    error.statusCode = 400;
    throw error;
  }

  const repo = await findRepoByGithubRepoId(githubRepoId);
  if (!repo) {
    // repo isn't tracked by us — ignore silently, not an error condition
    return { ignored: true };
  }

  const repoWithSecret = await findRepoByIdWithWebhookSecret(repo._id);
  const isValid = verifyGithubSignature(rawBody, signature, repoWithSecret.webhookSecret);
  if (!isValid) {
    const error = new Error("Invalid webhook signature");
    error.statusCode = 401;
    throw error;
  }

  // fire and forget — don't block the webhook response on a full sync
  syncRepo(repo._id, repo.user).catch((err) => {
    console.error(`Auto-sync failed for repo ${repo._id}:`, err.message);
  });

  return { triggered: true };
};