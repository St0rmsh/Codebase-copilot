import express from "express";
import { githubAuthRedirect, githubCallback, getRepos } from "../controllers/github.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

// @routes http://localhost:3000/api/github/connect
// @desc redirect user to GitHub OAuth consent screen
router.get("/connect", protect, githubAuthRedirect);

// @routes http://localhost:3000/api/github/callback
// @desc GitHub redirects here after consent; must be logged in already
router.get("/callback", protect, githubCallback);

// @routes http://localhost:3000/api/github/repos
// @desc get user repositories
router.get("/repos", protect, getRepos);

export default router;