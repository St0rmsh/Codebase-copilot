import { ingestRepo, getUserRepos } from "../services/repo.service.js";

export const ingest = async (req, res, next) => {
  try {
    const { githubRepoId, name, fullName, private: isPrivate, defaultBranch, cloneUrl } = req.body;

    if (!githubRepoId || !name || !fullName || !cloneUrl) {
      res.status(400);
      throw new Error("Missing required repo fields");
    }

    const repo = await ingestRepo(req.user._id, {
      githubRepoId,
      name,
      fullName,
      private: isPrivate,
      defaultBranch: defaultBranch || "main",
      cloneUrl,
    });

    res.status(201).json({ success: true, repo });
  } catch (error) {
    if (error.statusCode) res.status(error.statusCode);
    next(error);
  }
};

export const getMyRepos = async (req, res, next) => {
  try {
    const repos = await getUserRepos(req.user._id);
    res.status(200).json({ success: true, repos });
  } catch (error) {
    next(error);
  }
};