import { searchRepoText } from "../services/codeSearch.service.js";

export const codeSearchHandler = async (req, res, next) => {
  try {
    const { repoId } = req.params;
    const { q } = req.query;
    if (!q) {
      res.status(400);
      throw new Error("Query param 'q' is required");
    }
    const matches = await searchRepoText(repoId, req.user._id, q);
    res.status(200).json({ success: true, count: matches.length, matches });
  } catch (error) {
    if (error.statusCode) res.status(error.statusCode);
    next(error);
  }
};