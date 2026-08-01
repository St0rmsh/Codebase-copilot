import fs from "fs/promises";
import path from "path";
import { findRepoById, saveDependencyGraph } from "../dao/repo.dao.js";
import { buildImportGraph } from "../utils/importGraphBuilder.js";

const CHUNKABLE_EXTENSIONS = new Set([
  ".js", ".jsx", ".ts", ".tsx", ".css", ".scss", ".html", ".py", ".c", ".cpp", ".cc", ".h", ".hpp", ".java", ".json"
]);

export const generateDependencyGraph = async (repoId) => {
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

  const relevantFiles = repo.files.filter((f) => CHUNKABLE_EXTENSIONS.has(f.extension));

  const filesWithContent = [];
  for (const file of relevantFiles) {
    try {
      const fullPath = path.join(repo.localPath, file.path);
      const code = await fs.readFile(fullPath, "utf-8");
      filesWithContent.push({ path: file.path, code });
    } catch {
      continue; // skip unreadable files
    }
  }

  const edges = buildImportGraph(filesWithContent);
  const updatedRepo = await saveDependencyGraph(repoId, edges);

  return {
    edgeCount: edges.length,
    nodeCount: new Set(edges.flatMap((e) => [e.from, e.to])).size,
    graph: updatedRepo.dependencyGraph,
  };
};

export const getDependencyGraph = async (repoId) => {
  const repo = await findRepoById(repoId);
  if (!repo) {
    const error = new Error("Repo not found");
    error.statusCode = 404;
    throw error;
  }
  return repo.dependencyGraph || [];
};