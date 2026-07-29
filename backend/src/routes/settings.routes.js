import express from "express";
import {
  updateProfileHandler,
  changePasswordHandler,
  disconnectGithubHandler,
  deleteRepoHandler,
  deleteAccountHandler,
} from "../controllers/settings.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();



// @routes http://localhost:3000/api/settings/profile
// @description update profile
// @access  Protected
router.patch("/profile", protect, updateProfileHandler);

// @routes http://localhost:3000/api/settings/change-password
// @description change password
// @access  Protected
router.post("/change-password", protect, changePasswordHandler);

// @routes http://localhost:3000/api/settings/disconnect-github
// @description disconnect github
// @access  Protected
router.post("/disconnect-github", protect, disconnectGithubHandler);

// @routes http://localhost:3000/api/settings/delete-repo/:repoId
// @description delete repo
// @access  Protected
router.delete("/repos/:repoId", protect, deleteRepoHandler);

// @routes http://localhost:3000/api/settings/delete-account
// @description delete account
// @access  Protected
router.delete("/account", protect, deleteAccountHandler);

export default router;