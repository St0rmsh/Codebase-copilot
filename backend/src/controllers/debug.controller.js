import { getRepoDebugInfo, rerunChunking, rerunEmbedding, rerunGraph } from "../services/debug.service.js";

export const getDebugInfo = async (req, res, next) => {
  try {
    const { repoId } = req.params;
    const info = await getRepoDebugInfo(repoId);
    res.status(200).json({ success: true, ...info });
  } catch (error) {
    if (error.statusCode) res.status(error.statusCode);
    next(error);
  }
};

export const rerunChunkingHandler = async (req, res, next) => {
  try {
    const { repoId } = req.params;
    const result = await rerunChunking(repoId);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    if (error.statusCode) res.status(error.statusCode);
    next(error);
  }
};

export const rerunEmbeddingHandler = async (req, res, next) => {
  try {
    const { repoId } = req.params;
    const result = await rerunEmbedding(repoId);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    if (error.statusCode) res.status(error.statusCode);
    next(error);
  }
};

export const rerunGraphHandler = async (req, res, next) => {
  try {
    const { repoId } = req.params;
    const result = await rerunGraph(repoId);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    if (error.statusCode) res.status(error.statusCode);
    next(error);
  }
};