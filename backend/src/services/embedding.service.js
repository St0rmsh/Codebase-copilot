import { findChunksWithoutEmbedding, updateChunkEmbeddings } from "../dao/chunk.dao.js";
import { embedText, embedTextBatch } from "../utils/embedder.js";

const EMBEDDING_BATCH_SIZE = 16;

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

  const persistBatch = async (batch) => {
    try {
      const embeddings = await embedTextBatch(batch.map(buildEmbeddingInput), EMBEDDING_BATCH_SIZE);
      await updateChunkEmbeddings(batch, embeddings);
      successCount += batch.length;
    } catch (err) {
      if ([400, 422].includes(err.response?.status) && batch.length > 1) {
        const midpoint = Math.ceil(batch.length / 2);
        await persistBatch(batch.slice(0, midpoint));
        await persistBatch(batch.slice(midpoint));
        return;
      }
      console.error(`Failed to embed batch starting at ${batch[0].filePath}:`, err.message);
      failCount += batch.length;
    }
  };

  for (let offset = 0; offset < chunks.length; offset += EMBEDDING_BATCH_SIZE) {
    await persistBatch(chunks.slice(offset, offset + EMBEDDING_BATCH_SIZE));
  }

  return { chunksEmbedded: successCount, failed: failCount, total: chunks.length };
};