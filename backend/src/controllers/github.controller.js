import jwt from "jsonwebtoken";
import {
  getGithubAuthUrl,
  connectGithubAccount,
  githubSignIn,
  listUserRepos,
} from "../services/github.service.js";
import config from "../config/config.js";

export const githubAuthRedirect = (req, res) => {
  const url = getGithubAuthUrl();
  res.redirect(url);
};

export const githubSignInRedirect = (req, res) => {
  const url = getGithubAuthUrl();
  res.redirect(url);
};

export const githubCallback = async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.redirect(`${config.FRONTEND_URL}/login?error=missing_code`);
  }

  const token = req.cookies?.token;
  let existingUserId = null;

  if (token) {
    try {
      const decoded = jwt.verify(token, config.JWT_SECRET);
      existingUserId = decoded.id;
    } catch {
      existingUserId = null;
    }
  }

  try {
    if (existingUserId) {
      await connectGithubAccount(code, existingUserId);
      return res.redirect(`${config.FRONTEND_URL}/dashboard?github=connected`);
    } else {
      const { token: newToken } = await githubSignIn(code);
      console.log("GitHub sign-in succeeded, setting cookie. Token exists:", !!newToken);

      res
        .cookie("token", newToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 7 * 24 * 60 * 60 * 1000,
        })
        .redirect(`${config.FRONTEND_URL}/dashboard`);
    }
  } catch (error) {
    console.error("GitHub callback failed:", error.message, error.stack); // <-- this will reveal the real cause
    const redirectPath = existingUserId ? "/dashboard?github=error" : "/login?error=github_signin_failed";
    res.redirect(`${config.FRONTEND_URL}${redirectPath}`);
  }
};

export const getRepos = async (req, res, next) => {
  try {
    const repos = await listUserRepos(req.user._id);
    res.status(200).json({ success: true, repos });
  } catch (error) {
    if (error.statusCode) res.status(error.statusCode);
    next(error);
  }
};