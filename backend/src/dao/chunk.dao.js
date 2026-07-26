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