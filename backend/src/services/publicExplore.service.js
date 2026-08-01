import simpleGit from "simple-git";
import fs from "fs/promises";
import path from "path";
import axios from "axios";
import { createRepo, updateRepoStatus, findRepoByGithubRepoId } from "../dao/repo.dao.js";
import { walkDirectory } from "../utils/fileWalker.js";
import { isManifestFile, parseManifestFile } from "../utils/dependencyParser.js";
import { chunkRepo } from "./chunk.service.js";
import { embedRepoChunks } from "./embedding.service.js";
import { generateDependencyGraph } from "./graph.service.js";

const TMP_DIR = path.resolve("tmp", "repos");

const parseGithubUrl = (url) => {
  const match = url.match(/github\.com\/([^/]+)\/([^/]+?)(?:\.git)?\/?$/);
  if (!match) {
    const error = new Error("Invalid Github URL");
    error.statusCode = 400;
    throw error;
  }
  return { owner: match[1], repoName: match[2] };
};

export const exploreRepoByUrl = async (githubUrl, userId) => {
  const { owner, repoName } = parseGithubUrl(githubUrl);

  const githubRes = await axios.get(`https://api.github.com/repos/${owner}/${repoName}`);

  if (githubRes.data.private) {
    const error = new Error("Only public repositories can be explored this way");
    error.statusCode = 403;
    throw error;
  }

  const githubRepoId = githubRes.data.id.toString();

  const existing = await findRepoByGithubRepoId(githubRepoId);
  if (existing && existing.visibility === "public") {
    return existing;
  }

  const repo = await createRepo({
    user: userId,
    addedBy: userId,
    visibility: "public",
    githubRepoId,
    name: githubRes.data.name,
    fullName: githubRes.data.full_name,
    private: false,
    defaultBranch: githubRes.data.default_branch,
    cloneUrl: githubRes.data.clone_url,
    status: "pending",
  });

  const localPath = path.join(TMP_DIR, repo._id.toString());

  try {
    await updateRepoStatus(repo._id, "cloning");
    await fs.mkdir(TMP_DIR, { recursive: true });

    const git = simpleGit();
    await git.clone(githubRes.data.clone_url, localPath, ["--depth", "1"]);

    const files = await walkDirectory(localPath);

    const dependencies = [];
    for (const file of files) {
      const fileName = file.path.split("/").pop();
      if (isManifestFile(fileName)) {
        try {
          const fullPath = path.join(localPath, file.path);
          const content = await fs.readFile(fullPath, "utf-8");
          dependencies.push(...parseManifestFile(fileName, content));
        } catch {
          continue;
        }
      }
    }

    await updateRepoStatus(repo._id, "indexed", {
      files,
      fileCount: files.length,
      localPath,
      dependencies,
    });

    // chain chunking, embedding, and graph generation so the repo is fully usable immediately
    await chunkRepo(repo._id);
    await embedRepoChunks(repo._id);
    await generateDependencyGraph(repo._id).catch(() => {}); // non-fatal if graph gen fails

    const finalRepo = await updateRepoStatus(repo._id, "indexed"); // re-fetch to return latest state

    return finalRepo;
  } catch (error) {
    await updateRepoStatus(repo._id, "failed", { errorMessage: error.message });
    await fs.rm(localPath, { recursive: true, force: true }).catch(() => {});
    throw error;
  }
};

export const listPublicRepos = async () => {
  const { findPublicRepos } = await import("../dao/repo.dao.js");
  return await findPublicRepos();
};