import fs from "fs/promises";
import path from "path";

const IGNORED_DIRS = new Set([
  "node_modules", ".git", "dist", "build", ".next", "coverage", ".vercel",
]);

const IGNORED_FILES = new Set([
  "package-lock.json", "yarn.lock", "pnpm-lock.yaml",
]);

export const walkDirectory = async (rootDir, currentDir = rootDir, results = []) => {
  const entries = await fs.readdir(currentDir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (IGNORED_DIRS.has(entry.name)) continue;
      await walkDirectory(rootDir, path.join(currentDir, entry.name), results);
    } else {
      if (IGNORED_FILES.has(entry.name)) continue;

      const fullPath = path.join(currentDir, entry.name);
      const relativePath = path.relative(rootDir, fullPath);
      const stats = await fs.stat(fullPath);
      const extension = path.extname(entry.name);

      results.push({
        path: relativePath.replace(/\\/g, "/"), // normalize windows paths
        extension,
        size: stats.size,
      });
    }
  }

  return results;
};