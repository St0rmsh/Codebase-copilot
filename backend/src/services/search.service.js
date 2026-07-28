import mongoose from "mongoose";
import Chunk from "../models/chunk.model.js";
import { embedText } from "../utils/embedder.js";

export const searchRepoChunks = async (repoId, query, topK = 5) => {
  const queryEmbedding = await embedText(query);

  const results = await Chunk.aggregate([
    {
      $vectorSearch: {
        index: "chunk_vector_index",
        path: "embedding",
        queryVector: queryEmbedding,
        numCandidates: 100,
        limit: topK,
        filter: {
          repo: new mongoose.Types.ObjectId(repoId),
        },
      },
    },
    {
      $project: {
        repo: 1,
        filePath: 1,
        chunkType: 1,
        symbolName: 1,
        code: 1,
        startLine: 1,
        endLine: 1,
        score: { $meta: "vectorSearchScore" },
      },
    },
  ]);

  return results;
};

// Searches across multiple repos at once, using $in on the filter field
export const searchMultiRepoChunks = async (repoIds, query, topKPerRepo = 4) => {
  const queryEmbedding = await embedText(query);
  const repoObjectIds = repoIds.map((id) => new mongoose.Types.ObjectId(id));

  const results = await Chunk.aggregate([
    {
      $vectorSearch: {
        index: "chunk_vector_index",
        path: "embedding",
        queryVector: queryEmbedding,
        numCandidates: 100 * repoIds.length,
        limit: topKPerRepo * repoIds.length,
        filter: {
          repo: { $in: repoObjectIds },
        },
      },
    },
    {
      $project: {
        repo: 1,
        filePath: 1,
        chunkType: 1,
        symbolName: 1,
        code: 1,
        startLine: 1,
        endLine: 1,
        score: { $meta: "vectorSearchScore" },
      },
    },
  ]);

  return results;
};