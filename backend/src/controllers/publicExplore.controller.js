import { exploreRepoByUrl, listPublicRepos } from "../services/publicExplore.service.js";

export const exploreByUrlHandler = async (req, res, next) => {
  try {
    const { githubUrl } = req.body;
    if (!githubUrl) {
      res.status(400);
      throw new Error("githubUrl is required");
    }
    const repo = await exploreRepoByUrl(githubUrl, req.user._id);
    res.status(200).json({ success: true, repo });
  } catch (error) {
    if (error.statusCode) res.status(error.statusCode);
    next(error);
  }
};

export const listPublicReposHandler = async (req, res, next) => {
  try {
    const repos = await listPublicRepos();
    res.status(200).json({ success: true, repos });
  } catch (error) {
    next(error);
  }
};