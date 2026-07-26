import { findChunksWithoutEmbedding, updateChunkEmbedding } from "../dao/chunk.dao.js";
import { embedText } from "../utils/embedder.js";

const buildEmbeddingInput = (chunk) => {
  // Include symbol name + file path as context, not just raw code —
  // improves semantic search relevance significantly
  return `File: ${chunk.filePath}\nType: ${chunk.chunkType}\nName: ${chunk.symbolName}\n\n${chunk.code}`;
};

export const embedRepoChunks = async (repoId) => {
  const chunks = await findChunksWithoutEmbedding(repoId);

  if (!chunks.length) {
    return { chunksEmbedded: 0, message: "No chunks pending embedding" };
  }

  let successCount = 0;
  let failCount = 0;

  for (const chunk of chunks) {
    try {
      const input = buildEmbeddingInput(chunk);
      const embedding = await embedText(input);
      await updateChunkEmbedding(chunk._id, embedding);
      successCount++;
    } catch (err) {
      console.error(`Failed to embed chunk ${chunk._id} (${chunk.symbolName}):`, err.message);
      failCount++;
    }
  }

  return { chunksEmbedded: successCount, failed: failCount, total: chunks.length };
};