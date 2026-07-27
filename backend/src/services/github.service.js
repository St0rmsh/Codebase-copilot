import axios from "axios";
import jwt from "jsonwebtoken";
import config from "../config/config.js";
import {
  updateGithubInfo,
  findUserByIdWithGithubToken,
  findUserByGithubId,
  createGithubUser,
  findUserByEmail,
  markUserVerified,
} from "../dao/user.dao.js";

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, config.JWT_SECRET, { expiresIn: "7d" });
};

export const getGithubAuthUrl = () => {
  const params = new URLSearchParams({
    client_id: config.GITHUB_CLIENT_ID,
    redirect_uri: config.GITHUB_CALLBACK_URL,
    scope: "repo read:user",
  });
  return `https://github.com/login/oauth/authorize?${params.toString()}`;
};

const exchangeGithubCode = async (code) => {
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

  const githubUserRes = await axios.get("https://api.github.com/user", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  return { accessToken, githubProfile: githubUserRes.data };
};

export const connectGithubAccount = async (code, userId) => {
  const { accessToken, githubProfile } = await exchangeGithubCode(code);

  const updatedUser = await updateGithubInfo(userId, {
    githubId: githubProfile.id.toString(),
    githubUsername: githubProfile.login,
    githubAccessToken: accessToken,
  });

  return { githubUsername: updatedUser.githubUsername };
};

export const githubSignIn = async (code) => {
  const { accessToken, githubProfile } = await exchangeGithubCode(code);

  const emailRes = await axios.get("https://api.github.com/user/emails", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const primaryEmail = emailRes.data.find((e) => e.primary)?.email || emailRes.data[0]?.email;

  const githubId = githubProfile.id.toString();
  const githubUsername = githubProfile.login;

  let user = await findUserByGithubId(githubId);

  if (!user) {
    const existingByEmail = primaryEmail ? await findUserByEmail(primaryEmail) : null;

    if (existingByEmail) {
      user = await updateGithubInfo(existingByEmail._id, {
        githubId,
        githubUsername,
        githubAccessToken: accessToken,
      });
      if (!user.isVerified) {
        user = await markUserVerified(user._id);
      }
    } else {
      user = await createGithubUser({
        name: githubProfile.name || githubUsername,
        email: primaryEmail,
        githubId,
        githubUsername,
        githubAccessToken: accessToken,
      });
    }
  } else {
    user = await updateGithubInfo(user._id, {
      githubId,
      githubUsername,
      githubAccessToken: accessToken,
    });
  }

  const token = generateToken(user._id);
  return { token, user };
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