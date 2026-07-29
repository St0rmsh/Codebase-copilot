import { getIndexingSummary } from "../services/indexing.service.js";

export const getIndexing = async (req, res, next) => {
  try {
    const summary = await getIndexingSummary(req.user._id);
    res.status(200).json({ success: true, repos: summary });
  } catch (error) {
    next(error);
  }
};