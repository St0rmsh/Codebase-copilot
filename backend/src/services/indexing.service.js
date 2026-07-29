import { findReposByUser } from "../dao/repo.dao.js";
import { countChunksByRepo, countEmbeddedChunksByRepo } from "../dao/chunk.dao.js";

export const getIndexingSummary = async (userId) => {
  const repos = await findReposByUser(userId);

  const summaries = await Promise.all(
    repos.map(async (repo) => {
      const totalChunks = await countChunksByRepo(repo._id);
      const embeddedChunks = await countEmbeddedChunksByRepo(repo._id);

      return {
        repoId: repo._id,
        name: repo.name,
        fullName: repo.fullName,
        status: repo.status,
        fileCount: repo.fileCount,
        totalChunks,
        embeddedChunks,
        embedPercent: totalChunks > 0 ? Math.round((embeddedChunks / totalChunks) * 100) : 0,
        updatedAt: repo.updatedAt,
      };
    })
  );

  return summaries;
};