import fs from "fs/promises";
import path from "path";
import { findRepoById } from "../dao/repo.dao.js";
import { insertChunks, findChunksByRepo, deleteChunksByRepo } from "../dao/chunk.dao.js";
import { chunkFile } from "../utils/astChunker.js";

const CHUNKABLE_EXTENSIONS = new Set([".js", ".jsx", ".ts", ".tsx"]);

export const chunkRepo = async (repoId) => {
  const repo = await findRepoById(repoId);

  if (!repo) {
    const error = new Error("Repo not found");
    error.statusCode = 404;
    throw error;
  }

  if (!repo.localPath) {
    const error = new Error("Repo has no local path — re-ingest first");
    error.statusCode = 400;
    throw error;
  }

  await deleteChunksByRepo(repoId);

  const relevantFiles = repo.files.filter((f) => CHUNKABLE_EXTENSIONS.has(f.extension));

  const allChunks = [];

  for (const file of relevantFiles) {
    const fullPath = path.join(repo.localPath, file.path);
    try {
      const sourceCode = await fs.readFile(fullPath, "utf-8");
      const fileChunks = chunkFile(sourceCode, file.path);
      allChunks.push(...fileChunks.map((c) => ({ ...c, repo: repoId })));
    } catch (err) {
      console.error(`Skipping ${file.path}:`, err.message);
      continue;
    }
  }

  const savedChunks = await insertChunks(allChunks);

  return {
    filesProcessed: relevantFiles.length,
    chunksCreated: savedChunks.length,
  };
};

export const getRepoChunks = async (repoId) => {
  return await findChunksByRepo(repoId);
};


export const getChunksForFile = async (repoId, filePath) => {
  return await Chunk.find({ repo: repoId, filePath }).sort({ startLine: 1 });
};