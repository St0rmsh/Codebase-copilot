import express from "express";
import { ingest, getMyRepos, shareRepoHandler } from "../controllers/repo.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { enableAutoSyncHandler, disableAutoSyncHandler } from "../controllers/webhook.controller.js";


const router = express.Router();


// @routes http://localhost:3000/api/repos/ingest
// @desc ingest a repository
router.post("/ingest", protect, ingest);

// @routes http://localhost:3000/api/repos
// @desc get user repositories
router.get("/", protect, getMyRepos);


router.post("/:repoId/share", protect, shareRepoHandler);




router.post("/:repoId/auto-sync/enable", protect, enableAutoSyncHandler);
router.post("/:repoId/auto-sync/disable", protect, disableAutoSyncHandler);

export default router;