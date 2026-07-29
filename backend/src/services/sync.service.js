import simpleGit from "simple-git";
import fs from "fs/promises";
import path from "path";
import { findRepoById, updateRepoStatus } from "../dao/repo.dao.js";
import { findUserByIdWithGithubToken as findUserToken } from "../dao/user.dao.js";
import { walkDirectory } from "../utils/fileWalker.js";
import { diffFileLists } from "../utils/fileDiff.js";
import { deleteChunksByRepoAndFiles } from "../dao/chunk.dao.js";
import { chunkRepo } from "./chunk.service.js";
import { embedRepoChunks } from "./embedding.service.js";
import { generateDependencyGraph } from "./graph.service.js";

const TMP_DIR = path.resolve("tmp", "repos");

export const syncRepo = async (repoId, userId) => {
  const repo = await findRepoById(repoId);
  if (!repo) {
    const error = new Error("Repo not found");
    error.statusCode = 404;
    throw error;
  }

  const oldFiles = repo.files || [];
  const localPath = repo.localPath || path.join(TMP_DIR, repo._id.toString());

  await updateRepoStatus(repoId, "cloning");

  try {
    let authedCloneUrl = repo.cloneUrl;
    if (repo.private) {
      const user = await findUserToken(userId);
      if (!user?.githubAccessToken) {
        throw new Error("Github token missing, cannot sync private repo");
      }
      authedCloneUrl = repo.cloneUrl.replace("https://", `https://${user.githubAccessToken}@`);
    }

    // wipe and re-clone fresh to guarantee an accurate diff
    await fs.rm(localPath, { recursive: true, force: true }).catch(() => {});
    await fs.mkdir(TMP_DIR, { recursive: true });
    const git = simpleGit();
    await git.clone(authedCloneUrl, localPath, ["--depth", "1"]);

    const newFiles = await walkDirectory(localPath);
    const diff = diffFileLists(oldFiles, newFiles);

    await updateRepoStatus(repoId, "indexed", {
      files: newFiles,
      fileCount: newFiles.length,
      localPath,
    });

    // remove chunks for deleted/modified files so stale data doesn't linger
    const staleFiles = [...diff.modified, ...diff.deleted];
    await deleteChunksByRepoAndFiles(repoId, staleFiles);

    let chunkResult = { chunksCreated: 0 };
    let embedResult = { chunksEmbedded: 0 };

    if (diff.changedPaths.length > 0) {
      // re-chunk everything is simplest given chunkRepo's current "wipe + rebuild" design;
      // targeted re-chunk of only changed files is a further optimization for later
      chunkResult = await chunkRepo(repoId);
      embedResult = await embedRepoChunks(repoId);
      await generateDependencyGraph(repoId).catch(() => {});
    }

    return {
      added: diff.added.length,
      modified: diff.modified.length,
      deleted: diff.deleted.length,
      chunksCreated: chunkResult.chunksCreated,
      chunksEmbedded: embedResult.chunksEmbedded,
      hadChanges: diff.changedPaths.length > 0,
    };
  } catch (error) {
    await updateRepoStatus(repoId, "failed", { errorMessage: error.message });
    throw error;
  }
};