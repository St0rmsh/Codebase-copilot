import { findRepoWithStatus } from "../dao/repo.dao.js";
import { countChunksByRepo, countEmbeddedChunksByRepo, findChunksByRepo } from "../dao/chunk.dao.js";
import { chunkRepo } from "./chunk.service.js";
import { embedRepoChunks } from "./embedding.service.js";
import { generateDependencyGraph } from "./graph.service.js";

export const getRepoDebugInfo = async (repoId) => {
  const repo = await findRepoWithStatus(repoId);
  if (!repo) {
    const error = new Error("Repo not found");
    error.statusCode = 404;
    throw error;
  }

  const totalChunks = await countChunksByRepo(repoId);
  const embeddedChunks = await countEmbeddedChunksByRepo(repoId);
  const allChunks = await findChunksByRepo(repoId);

  // Files that produced zero chunks — likely candidates for silent parse failures
  const chunkedFilePaths = new Set(allChunks.map((c) => c.filePath));
  const chunkableExt = new Set([".js", ".jsx", ".ts", ".tsx"]);
  const unchunkedFiles = (repo.files || [])
    .filter((f) => chunkableExt.has(f.extension) && !chunkedFilePaths.has(f.path))
    .map((f) => f.path);

  return {
    repoId: repo._id,
    name: repo.name,
    fullName: repo.fullName,
    status: repo.status,
    errorMessage: repo.errorMessage,
    hasLocalPath: !!repo.localPath,
    totalChunks,
    embeddedChunks,
    unembeddedChunks: totalChunks - embeddedChunks,
    unchunkedFiles,
  };
};

export const rerunChunking = async (repoId) => {
  return await chunkRepo(repoId);
};

export const rerunEmbedding = async (repoId) => {
  return await embedRepoChunks(repoId);
};

export const rerunGraph = async (repoId) => {
  return await generateDependencyGraph(repoId);
};