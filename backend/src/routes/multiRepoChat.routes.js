import express from "express";
import { multiRepoChatStream } from "../controllers/multiRepoChat.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/stream", protect, multiRepoChatStream);

export default router;