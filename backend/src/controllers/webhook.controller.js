import { enableAutoSync, disableAutoSync, handleGithubWebhook } from "../services/webhook.service.js";

export const enableAutoSyncHandler = async (req, res, next) => {
  try {
    const { repoId } = req.params;
    const result = await enableAutoSync(repoId, req.user._id);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    if (error.statusCode) res.status(error.statusCode);
    next(error);
  }
};

export const disableAutoSyncHandler = async (req, res, next) => {
  try {
    const { repoId } = req.params;
    const result = await disableAutoSync(repoId, req.user._id);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    if (error.statusCode) res.status(error.statusCode);
    next(error);
  }
};

// Public — GitHub calls this directly, no user session involved
export const githubWebhookHandler = async (req, res) => {
  try {
    const signature = req.headers["x-hub-signature-256"];
    const result = await handleGithubWebhook(req.body, signature, req.rawBody);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};