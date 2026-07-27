import express from "express";
import {
  githubAuthRedirect,
  githubSignInRedirect,
  githubCallback,
  getRepos,
} from "../controllers/github.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/connect", protect, githubAuthRedirect);
router.get("/signin", githubSignInRedirect);
router.get("/callback", githubCallback); // no protect — handles both flows internally
router.get("/repos", protect, getRepos);

export default router;