import { embedRepoChunks } from "../services/embedding.service.js";

export const runEmbedding = async (req, res, next) => {
  try {
    const { repoId } = req.params;
    const result = await embedRepoChunks(repoId);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};