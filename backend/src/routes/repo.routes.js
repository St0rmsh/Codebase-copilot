import express from "express";
import { ingest, getMyRepos } from "../controllers/repo.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();


// @routes http://localhost:3000/api/repos/ingest
// @desc ingest a repository
router.post("/ingest", protect, ingest);

// @routes http://localhost:3000/api/repos
// @desc get user repositories
router.get("/", protect, getMyRepos);

export default router;