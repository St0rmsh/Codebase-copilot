import fs from "fs/promises";
import path from "path";
import { findRepoById } from "../dao/repo.dao.js";
import { findChunksByRepo } from "../dao/chunk.dao.js";
import { extractCallEdges } from "../utils/callGraphBuilder.js";

const CHUNKABLE_EXTENSIONS = new Set([".js", ".jsx", ".ts", ".tsx"]);

export const buildCallGraph = async (repoId) => {
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

  const chunks = await findChunksByRepo(repoId);
  const knownSymbolNames = new Set(chunks.map((c) => c.symbolName).filter((n) => n !== "anonymous"));

  const relevantFiles = repo.files.filter((f) => CHUNKABLE_EXTENSIONS.has(f.extension));

  const allCallEdges = [];
  for (const file of relevantFiles) {
    try {
      const fullPath = path.join(repo.localPath, file.path);
      const code = await fs.readFile(fullPath, "utf-8");
      const edges = extractCallEdges(code, file.path, knownSymbolNames);
      allCallEdges.push(...edges);
    } catch {
      continue;
    }
  }

  return allCallEdges;
};

// Given a symbol name, find its full trace: who calls it, and what it calls
export const traceSymbol = async (repoId, symbolName) => {
  const callEdges = await buildCallGraph(repoId);

  const callers = callEdges.filter((e) => e.callee === symbolName).map((e) => e.caller);
  const callees = callEdges.filter((e) => e.caller === symbolName).map((e) => e.callee);

  return {
    symbol: symbolName,
    calledBy: [...new Set(callers)],
    calls: [...new Set(callees)],
    fullGraph: callEdges,
  };
};