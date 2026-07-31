import simpleGit from "simple-git";
import fs from "fs/promises";
import path from "path";
import { createRepo, updateRepoStatus, findReposByUser,deleteRepoById,findRepoById, findReposByUserOrTeams } from "../dao/repo.dao.js";
import { findUserByIdWithGithubToken } from "../dao/user.dao.js";
import { walkDirectory } from "../utils/fileWalker.js";
import { deleteChunksByRepo } from "../dao/chunk.dao.js"
import { isTeamMember } from "../dao/team.dao.js";
import { updateRepoTeam } from "../dao/repo.dao.js";



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
      localPath,
    });

    // Clean up cloned folder — we only needed it for the file walk
    // await fs.rm(localPath, { recursive: true, force: true });

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





// export const deleteRepoAndData = async (repoId, userId) => {
//   const repo = await findRepoById(repoId);
//   if (!repo || repo.user.toString() !== userId.toString()) {
//     const error = new Error("Repo not found");
//     error.statusCode = 404;
//     throw error;
//   }

//   await deleteChunksByRepo(repoId);
//   await deleteRepoById(repoId);

//   if (repo.localPath) {
//     await fs.rm(repo.localPath, { recursive: true, force: true }).catch(() => {});
//   }

//   return { message: "Repository and all associated data deleted" };
// };






export const shareRepoWithTeam = async (repoId, teamId, userId) => {
  const repo = await findRepoById(repoId);
  if (!repo || repo.user.toString() !== userId.toString()) {
    const error = new Error("Repo not found");
    error.statusCode = 404;
    throw error;
  }
  const isMember = await isTeamMember(teamId, userId);
  if (!isMember) {
    const error = new Error("You are not a member of this team");
    error.statusCode = 403;
    throw error;
  }
  return await updateRepoTeam(repoId, teamId);
};

export const getReposForUserAndTeams = async (userId, teamIds) => {
  return await findReposByUserOrTeams(userId, teamIds);
};






// export const deleteRepoAndData = async (repoId, userId) => {
//   const repo = await findRepoById(repoId);
//   if (!repo || repo.user.toString() !== userId.toString()) {
//     const error = new Error("Only the repository owner can delete it");
//     error.statusCode = 403;
//     throw error;
//   }

//   await deleteChunksByRepo(repoId);
//   await deleteRepoById(repoId);

//   if (repo.localPath) {
//     await fs.rm(repo.localPath, { recursive: true, force: true }).catch(() => {});
//   }

//   return { message: "Repository and all associated data deleted" };
// };



export const deleteRepoAndData = async (repoId, userId) => {
  const repo = await findRepoById(repoId);
  if (!repo) {
    const error = new Error("Repo not found");
    error.statusCode = 404;
    throw error;
  }

  const isOwner = repo.visibility === "public"
    ? repo.addedBy?.toString() === userId.toString()
    : repo.user.toString() === userId.toString();

  if (!isOwner) {
    const error = new Error("Only the person who added this repository can delete it");
    error.statusCode = 403;
    throw error;
  }

  await deleteChunksByRepo(repoId);
  await deleteRepoById(repoId);

  if (repo.localPath) {
    await fs.rm(repo.localPath, { recursive: true, force: true }).catch(() => {});
  }

  return { message: "Repository and all associated data deleted" };
};