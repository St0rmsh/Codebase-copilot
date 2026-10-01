import mongoose from "mongoose";
import Chunk from "../models/chunk.model.js";
import { embedQuery } from "../utils/embedder.js";

const GENERATED_BUNDLE_PATH = /(?:^|\/)public\/assets\/|\.(?:min|bundle)\.(?:js|mjs|css)$/i;

export const searchRepoChunks = async (repoId, query, topK = 5) => {
  const queryEmbedding = await embedQuery(query);

  const results = await Chunk.aggregate([
    {
      $vectorSearch: {
        index: "chunk_vector_index",
        path: "embedding",
        queryVector: queryEmbedding,
        numCandidates: 100,
        limit: topK * 5,
        filter: {
          repo: new mongoose.Types.ObjectId(repoId),
        },
      },
    },
    { $match: { filePath: { $not: GENERATED_BUNDLE_PATH } } },
    { $limit: topK },
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
  const queryEmbedding = await embedQuery(query);
  const repoObjectIds = repoIds.map((id) => new mongoose.Types.ObjectId(id));

  const results = await Chunk.aggregate([
    {
      $vectorSearch: {
        index: "chunk_vector_index",
        path: "embedding",
        queryVector: queryEmbedding,
        numCandidates: 100 * repoIds.length,
        limit: topKPerRepo * repoIds.length * 5,
        filter: {
          repo: { $in: repoObjectIds },
        },
      },
    },
    { $match: { filePath: { $not: GENERATED_BUNDLE_PATH } } },
    { $limit: topKPerRepo * repoIds.length },
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