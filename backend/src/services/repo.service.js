import simpleGit from "simple-git";
import fs from "fs/promises";
import path from "path";
import { createRepo, updateRepoStatus, findReposByUser } from "../dao/repo.dao.js";
import { findUserByIdWithGithubToken } from "../dao/user.dao.js";
import { walkDirectory } from "../utils/fileWalker.js";

const TMP_DIR = path.resolve("tmp", "repos");

export const ingestRepo = async (userId, repoData) => {
  const { githubRepoId, name, fullName, private: isPrivate, defaultBranch, cloneUrl } = repoData;

  const repo = await createRepo({
    user: userId,
    githubRepoId,
    name,
    fullName,
    private: isPrivate,
    defaultBranch,
    cloneUrl,
    status: "pending",
  });

  const localPath = path.join(TMP_DIR, repo._id.toString());

  try {
    await updateRepoStatus(repo._id, "cloning");

    let authedCloneUrl = cloneUrl;
    if (isPrivate) {
      const user = await findUserByIdWithGithubToken(userId);
      if (!user?.githubAccessToken) {
        throw new Error("GitHub token missing, cannot clone private repo");
      }
      authedCloneUrl = cloneUrl.replace(
        "https://",
        `https://${user.githubAccessToken}@`
      );
    }

    await fs.mkdir(TMP_DIR, { recursive: true });
    const git = simpleGit();
    await git.clone(authedCloneUrl, localPath, ["--depth", "1"]);

    const files = await walkDirectory(localPath);

    const updatedRepo = await updateRepoStatus(repo._id, "indexed", {
      files,
      fileCount: files.length,
    });

    // Clean up cloned folder — we only needed it for the file walk
    await fs.rm(localPath, { recursive: true, force: true });

    return updatedRepo;
  } catch (error) {
    await updateRepoStatus(repo._id, "failed", { errorMessage: error.message });
    await fs.rm(localPath, { recursive: true, force: true }).catch(() => {});
    throw error;
  }
};

export const getUserRepos = async (userId) => {
  return await findReposByUser(userId);
};