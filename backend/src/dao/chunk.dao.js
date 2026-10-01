import Chunk from "../models/chunk.model.js";

export const insertChunks = async (chunks) => {
  if (!chunks.length) return [];
  return await Chunk.insertMany(chunks);
};

export const findChunksByRepo = async (repoId, { skip = 0, limit = 100 } = {}) => {
  return await Chunk.find({ repo: repoId })
    .select("-embedding")
    .skip(skip)
    .limit(limit);
};

export const deleteChunksByRepo = async (repoId) => {
  return await Chunk.deleteMany({ repo: repoId });
};

export const updateChunkEmbedding = async (chunkId, embedding) => {
  return await Chunk.findByIdAndUpdate(chunkId, { embedding }, { returnDocument: "after" });
};

export const updateChunkEmbeddings = async (chunks, embeddings) => {
  if (!chunks.length) return;
  return await Chunk.bulkWrite(
    chunks.map((chunk, index) => ({
      updateOne: {
        filter: { _id: chunk._id },
        update: { $set: { embedding: embeddings[index] } },
      },
    })),
    { ordered: false }
  );
};

// Matches chunks whose embedding is missing OR an empty array.
export const findChunksWithoutEmbedding = async (repoId) => {
  return await Chunk.find({ repo: repoId, "embedding.0": { $exists: false } });
};

export const findChunksByRepoAndFile = async (repoId, filePath) => {
  return await Chunk.find({ repo: repoId, filePath }).sort({ startLine: 1 });
};

export const countChunksByRepo = async (repoId) => {
  return await Chunk.countDocuments({ repo: repoId });
};

export const countChunksInRepo = async (repoId) => {
  return await Chunk.countDocuments({ repo: repoId });
};

// Counts chunks that have a non-empty embedding array.
export const countEmbeddedChunksByRepo = async (repoId) => {
  return await Chunk.countDocuments({ repo: repoId, "embedding.0": { $exists: true } });
};

export const deleteChunksByRepoAndFiles = async (repoId, filePaths) => {
  if (!filePaths.length) return;
  return await Chunk.deleteMany({ repo: repoId, filePath: { $in: filePaths } });
};