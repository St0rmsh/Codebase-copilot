import { reviewPullRequest, listOpenPullRequests } from "../services/prReview.service.js";

export const reviewPr = async (req, res, next) => {
  try {
    const { repoId } = req.params;
    const { prNumber } = req.body;
    if (!prNumber) {
      res.status(400);
      throw new Error("prNumber is required");
    }
    const result = await reviewPullRequest(repoId, prNumber, req.user._id);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    if (error.statusCode) res.status(error.statusCode);
    next(error);
  }
};

export const listPrs = async (req, res, next) => {
  try {
    const { repoId } = req.params;
    const prs = await listOpenPullRequests(repoId, req.user._id);
    res.status(200).json({ success: true, pullRequests: prs });
  } catch (error) {
    if (error.statusCode) res.status(error.statusCode);
    next(error);
  }
};