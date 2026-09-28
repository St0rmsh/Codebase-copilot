import { findChunksByRepo } from "../dao/chunk.dao.js";
import { getRepoWithAccessCheck } from "./repo.service.js";

export const searchRepoText = async (repoId, userId, query) => {
  await getRepoWithAccessCheck(repoId, userId); // enforces access, throws if unauthorized

  const chunks = await findChunksByRepo(repoId);
  const lowerQuery = query.toLowerCase();

  const matches = [];
  for (const chunk of chunks) {
    const lines = chunk.code.split("\n");
    lines.forEach((line, idx) => {
      if (line.toLowerCase().includes(lowerQuery)) {
        matches.push({
          filePath: chunk.filePath,
          symbolName: chunk.symbolName,
          lineNumber: chunk.startLine + idx,
          lineContent: line.trim().slice(0, 200),
          chunkId: chunk._id,
        });
      }
    });
  }

  return matches.slice(0, 200); // cap results to keep response reasonable
};