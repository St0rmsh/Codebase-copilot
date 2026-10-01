import fs from "fs/promises";
import path from "path";
import { findRepoById } from "../dao/repo.dao.js";
import { insertChunks, findChunksByRepo, countChunksInRepo, deleteChunksByRepo } from "../dao/chunk.dao.js";
import { findChunksByRepoAndFile } from "../dao/chunk.dao.js";
import { chunkFile } from "../utils/astChunker.js";
import { chunkPythonFile } from "../utils/pythonChunker.js";
import { chunkCFamilyFile } from "../utils/cFamilyChunker.js";
import { isGeneratedAssetPath } from "../utils/fileWalker.js";

const AST_EXTENSIONS = new Set([".js", ".jsx", ".ts", ".tsx"]);
const PYTHON_EXTENSIONS = new Set([".py"]);
const C_FAMILY_EXTENSIONS = new Set([".c", ".cpp", ".cc", ".h", ".hpp", ".cs", ".java"]);
const WHOLE_FILE_EXTENSIONS = new Set([".css", ".scss", ".html", ".json", ".md"]);
const MAX_WHOLE_FILE_SIZE = 40000;

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

  const sourceFiles = repo.files.filter((file) => !isGeneratedAssetPath(file.path));
  const astFiles = sourceFiles.filter((f) => AST_EXTENSIONS.has(f.extension));
  const pythonFiles = sourceFiles.filter((f) => PYTHON_EXTENSIONS.has(f.extension));
  const cFamilyFiles = sourceFiles.filter((f) => C_FAMILY_EXTENSIONS.has(f.extension));
  const wholeFiles = sourceFiles.filter(
    (f) => WHOLE_FILE_EXTENSIONS.has(f.extension) && f.size <= MAX_WHOLE_FILE_SIZE
  );

  const allChunks = [];

  const readAndChunk = async (files, chunkerFn) => {
    for (const file of files) {
      const fullPath = path.join(repo.localPath, file.path);
      try {
        const sourceCode = await fs.readFile(fullPath, "utf-8");
        let fileChunks = chunkerFn(sourceCode, file.path);
        if (fileChunks.length === 0 && sourceCode.trim() && sourceCode.length <= MAX_WHOLE_FILE_SIZE) {
          fileChunks = [{
            filePath: file.path,
            chunkType: "file",
            symbolName: file.path.split("/").pop(),
            code: sourceCode,
            startLine: 1,
            endLine: sourceCode.split("\n").length,
          }];
        }
        allChunks.push(...fileChunks.map((c) => ({ ...c, repo: repoId })));
      } catch (err) {
        console.error(`Skipping ${file.path}:`, err.message);
      }
    }
  };

  await readAndChunk(astFiles, chunkFile);
  await readAndChunk(pythonFiles, chunkPythonFile);
  await readAndChunk(cFamilyFiles, chunkCFamilyFile);

  for (const file of wholeFiles) {
    const fullPath = path.join(repo.localPath, file.path);
    try {
      const sourceCode = await fs.readFile(fullPath, "utf-8");
      if (!sourceCode.trim()) continue;

      const symbolName = file.path.split("/").pop();
      const lineCount = sourceCode.split("\n").length;

      allChunks.push({
        repo: repoId,
        filePath: file.path,
        chunkType: "file",
        symbolName,
        code: sourceCode,
        startLine: 1,
        endLine: lineCount,
      });
    } catch (err) {
      console.error(`Skipping ${file.path}:`, err.message);
    }
  }

  const savedChunks = await insertChunks(allChunks);

  return {
    filesProcessed: astFiles.length + pythonFiles.length + cFamilyFiles.length + wholeFiles.length,
    chunksCreated: savedChunks.length,
  };
};

export const getRepoChunks = async (repoId, { page = 1, limit = 200 } = {}) => {
  const skip = (page - 1) * limit;
  const chunks = await findChunksByRepo(repoId, { limit, skip });
  const total = await countChunksInRepo(repoId);
  return { chunks, total, page, limit };
};

export const getChunksForFile = async (repoId, filePath) => {
  return await findChunksByRepoAndFile(repoId, filePath);
};