import { chunkRepo, getRepoChunks } from "../services/chunk.service.js";
import { getChunksForFile } from "../services/chunk.service.js";


export const runChunking = async (req, res, next) => {
  try {
    const { repoId } = req.params;
    const result = await chunkRepo(repoId);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    if (error.statusCode) res.status(error.statusCode);
    next(error);
  }
};

export const listChunks = async (req, res, next) => {
  try {
    const { repoId } = req.params;
    const chunks = await getRepoChunks(repoId);
    res.status(200).json({ success: true, count: chunks.length, chunks });
  } catch (error) {
    next(error);
  }
};



export const getFileChunks = async (req, res, next) => {
  try {
    const { repoId } = req.params;
    const { filePath } = req.query;
    if (!filePath) {
      res.status(400);
      throw new Error("filePath query param is required");
    }
    const chunks = await getChunksForFile(repoId, filePath);
    res.status(200).json({ success: true, chunks });
  } catch (error) {
    if (error.statusCode) res.status(error.statusCode);
    next(error);
  }
};