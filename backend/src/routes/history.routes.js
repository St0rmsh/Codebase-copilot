import express from "express";
import { getHistory, getConversation, exportConversation } from "../controllers/history.controller.js";
import { protect } from "../middlewares/auth.middleware.js";


const router = express.Router();


// @desc Get all conversations
// @route GET /api/history
// @access Private
router.get("/", protect, getHistory);


// @desc Get conversation by id
// @route GET /api/history/:conversationId
// @access Private
router.get("/:conversationId", protect, getConversation);


// @desc Export conversation
// @route GET /api/history/:conversationId/export
// @access Private
router.get("/:conversationId/export", protect, exportConversation);

export default router;