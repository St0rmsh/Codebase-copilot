import axios from "axios";
import config from "../config/config.js";
import { updateGithubInfo, findUserByIdWithGithubToken } from "../dao/user.dao.js";



export const getGithubAuthUrl = () => {
  const params = new URLSearchParams({
    client_id: config.GITHUB_CLIENT_ID,
    redirect_uri: config.GITHUB_CALLBACK_URL,
    scope: "repo read:user", // 'repo' scope needed for private repo access
  });
  return `https://github.com/login/oauth/authorize?${params.toString()}`;
};

export const handleGithubCallback = async (code, userId) => {
  // Exchange code for access token
  const tokenRes = await axios.post(
    "https://github.com/login/oauth/access_token",
    {
      client_id: config.GITHUB_CLIENT_ID,
      client_secret: config.GITHUB_CLIENT_SECRET,
      code,
    },
    { headers: { Accept: "application/json" } }
  );

  const accessToken = tokenRes.data.access_token;
  if (!accessToken) {
    const error = new Error("Failed to get GitHub access token");
    error.statusCode = 400;
    throw error;
  }

  // Get GitHub user info
  const githubUserRes = await axios.get("https://api.github.com/user", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  const updatedUser = await updateGithubInfo(userId, {
    githubId: githubUserRes.data.id.toString(),
    githubUsername: githubUserRes.data.login,
    githubAccessToken: accessToken,
  });

  return {
    githubUsername: updatedUser.githubUsername,
  };
};




export const listUserRepos = async (userId) => {
  const user = await findUserByIdWithGithubToken(userId);

  if (!user?.githubAccessToken) {
    const error = new Error("GitHub account not connected");
    error.statusCode = 400;
    throw error;
  }

  const res = await axios.get("https://api.github.com/user/repos", {
    headers: { Authorization: `Bearer ${user.githubAccessToken}` },
    params: {
      per_page: 50,
      sort: "updated",
      affiliation: "owner,collaborator",
    },
  });

  return res.data.map((repo) => ({
    id: repo.id,
    name: repo.name,
    fullName: repo.full_name,
    private: repo.private,
    defaultBranch: repo.default_branch,
    updatedAt: repo.updated_at,
    cloneUrl: repo.clone_url,
    language: repo.language,
  }));
};