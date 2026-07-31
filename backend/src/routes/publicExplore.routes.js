import express from "express";
import { exploreByUrlHandler, listPublicReposHandler } from "../controllers/publicExplore.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/explore", protect, exploreByUrlHandler);
router.get("/", protect, listPublicReposHandler);

export default router;