import fs from "fs/promises";
import path from "path";
import { findRepoById } from "../dao/repo.dao.js";
import { insertChunks, findChunksByRepo, deleteChunksByRepo } from "../dao/chunk.dao.js";
import { findChunksByRepoAndFile } from "../dao/chunk.dao.js";
import { chunkFile } from "../utils/astChunker.js";
import { chunkPythonFile } from "../utils/pythonChunker.js";
import { chunkCFamilyFile } from "../utils/cFamilyChunker.js";

const AST_EXTENSIONS = new Set([".js", ".jsx", ".ts", ".tsx", ".vue", ".svelte", ".ex", ".exs", ".mjs",".cjs"]);
const PYTHON_EXTENSIONS = new Set([".py", ".pyw", ".pyi"]);
const C_FAMILY_EXTENSIONS = new Set([".c", ".cpp", ".cc", ".h", ".hpp", ".cs", ".java" ]);
const WHOLE_FILE_EXTENSIONS = new Set([".css", ".scss", ".html", ".json", ".md",".ejs",".graphql",".gql","txt", "htm", "scss", "sass",".conf",".cfg",]);
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

  const astFiles = repo.files.filter((f) => AST_EXTENSIONS.has(f.extension));
  const pythonFiles = repo.files.filter((f) => PYTHON_EXTENSIONS.has(f.extension));
  const cFamilyFiles = repo.files.filter((f) => C_FAMILY_EXTENSIONS.has(f.extension));
  const wholeFiles = repo.files.filter(
    (f) => WHOLE_FILE_EXTENSIONS.has(f.extension) && f.size <= MAX_WHOLE_FILE_SIZE
  );

  const allChunks = [];

  const readAndChunk = async (files, chunkerFn) => {
    for (const file of files) {
      const fullPath = path.join(repo.localPath, file.path);
      try {
        const sourceCode = await fs.readFile(fullPath, "utf-8");
        const fileChunks = chunkerFn(sourceCode, file.path);
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

export const getRepoChunks = async (repoId) => {
  return await findChunksByRepo(repoId);
};

export const getChunksForFile = async (repoId, filePath) => {
  return await findChunksByRepoAndFile(repoId, filePath);
};