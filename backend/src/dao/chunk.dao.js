import Chunk from "../models/chunk.model.js";

export const insertChunks = async (chunks) => {
  if (!chunks.length) return [];
  return await Chunk.insertMany(chunks);
};

export const findChunksByRepo = async (repoId) => {
  return await Chunk.find({ repo: repoId });
};

export const deleteChunksByRepo = async (repoId) => {
  return await Chunk.deleteMany({ repo: repoId });
};


export const updateChunkEmbedding = async (chunkId, embedding) => {
  return await Chunk.findByIdAndUpdate(chunkId, { embedding }, { returnDocument: "after" });
};

export const findChunksWithoutEmbedding = async (repoId) => {
  return await Chunk.find({ repo: repoId, embedding: { $size: 0 } });
};


export const findChunksByRepoAndFile = async (repoId, filePath) => {
  return await Chunk.find({ repo: repoId, filePath }).sort({ startLine: 1 });
};

export const countChunksByRepo = async (repoId) => {
  return await Chunk.countDocuments({ repo: repoId });
};

export const countEmbeddedChunksByRepo = async (repoId) => {
  return await Chunk.countDocuments({ repo: repoId, embedding: { $not: { $size: 0 } } });
};

export const deleteChunksByRepoAndFiles = async (repoId, filePaths) => {
  if (!filePaths.length) return;
  return await Chunk.deleteMany({ repo: repoId, filePath: { $in: filePaths } });
};