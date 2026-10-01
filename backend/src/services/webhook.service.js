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
  const githubApiUrl = `https://api.github.com/repos/${owner}/${repoName}`;
  const githubHeaders = {
    Authorization: `Bearer ${user.githubAccessToken}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  let webhookUrl;
  try {
    webhookUrl = new URL("/api/webhooks/github", config.BACKEND_URL);
  } catch {
    const error = new Error("BACKEND_URL must be configured as an absolute public HTTPS URL");
    error.statusCode = 500;
    throw error;
  }

  let githubRepo;
  try {
    githubRepo = await axios.get(githubApiUrl, { headers: githubHeaders });
  } catch (cause) {
    const error = new Error(
      cause.response?.status === 404
        ? "The connected GitHub account cannot access this repository. Reconnect the account that owns the repo, or verify the repo has not moved."
        : `Could not verify repository access with GitHub: ${cause.response?.data?.message || cause.message}`
    );
    error.statusCode = cause.response?.status === 404 ? 403 : 502;
    throw error;
  }

  if (githubRepo.data.permissions?.admin === false) {
    const error = new Error("The connected GitHub account needs admin access to create repository webhooks");
    error.statusCode = 403;
    throw error;
  }

  if (webhookUrl.protocol !== "https:") {
    const error = new Error("BACKEND_URL must use HTTPS so GitHub can deliver webhook events");
    error.statusCode = 500;
    throw error;
  }

  let res;
  try {
    res = await axios.post(
    `https://api.github.com/repos/${owner}/${repoName}/hooks`,
    {
      name: "web",
      active: true,
      events: ["push"],
      config: {
        url: webhookUrl.toString(),
        content_type: "json",
        secret: webhookSecret,
      },
    },
      {
        headers: githubHeaders,
      }
    );
  } catch (cause) {
    const status = cause.response?.status;
    const githubMessage = cause.response?.data?.message;
    let message;

    if (status === 401) {
      message = "GitHub authorization failed. Reconnect your GitHub account and try again.";
    } else if (status === 403) {
      message = "GitHub denied webhook creation. Confirm you have admin access to this repository and reconnect GitHub if its authorization changed.";
    } else if (status === 422) {
      message = `GitHub rejected the webhook configuration: ${githubMessage || "check the callback URL"}`;
    } else if (status === 404) {
      message = "GitHub could not create this webhook. Confirm the connected account has admin access to the repository.";
    } else if (status) {
      message = `GitHub webhook creation failed (${status}): ${githubMessage || cause.message}`;
    } else {
      message = "Could not reach GitHub while creating the webhook. Check the backend network connection.";
    }

    const error = new Error(message);
    error.statusCode = status === 401 || status === 403 || status === 404
      ? 403
      : status === 422
        ? 400
        : 502;
    throw error;
  }

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