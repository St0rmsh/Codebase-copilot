import { searchRepoChunks } from "../services/search.service.js";

export const search = async (req, res, next) => {
  try {
    const { repoId } = req.params;
    const { query, topK } = req.body;

    if (!query) {
      res.status(400);
      throw new Error("Query is required");
    }

    const results = await searchRepoChunks(repoId, query, topK || 5);

    res.status(200).json({ success: true, count: results.length, results });
  } catch (error) {
    if (error.statusCode) res.status(error.statusCode);
    next(error);
  }
};