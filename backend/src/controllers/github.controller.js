import { getGithubAuthUrl, handleGithubCallback, listUserRepos } from "../services/github.service.js";

// @desc get user repositories
// @routes http://localhost:3000/api/github/repos
export const getRepos = async (req, res, next) => {
  try {
    const repos = await listUserRepos(req.user._id);
    res.status(200).json({ success: true, repos });
  } catch (error) {
    if (error.statusCode) res.status(error.statusCode);
    next(error);
  }
};


export const githubAuthRedirect = (req, res) => {
  const url = getGithubAuthUrl();
  res.redirect(url);
};

export const githubCallback = async (req, res, next) => {
  try {
    const { code } = req.query;
    if (!code) {
      res.status(400);
      throw new Error("Missing code from GitHub");
    }

    const result = await handleGithubCallback(code, req.user._id);

    res.status(200).json({ success: true, ...result });
  } catch (error) {
    if (error.statusCode) res.status(error.statusCode);
    next(error);
  }
};