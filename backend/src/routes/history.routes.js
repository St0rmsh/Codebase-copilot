import express from "express";
import { getHistory, getConversation } from "../controllers/history.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", protect, getHistory);
router.get("/:conversationId", protect, getConversation);

export default router;