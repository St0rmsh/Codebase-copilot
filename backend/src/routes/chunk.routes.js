import express from "express";
import { runChunking, listChunks } from "../controllers/chunk.controller.js";
import { runEmbedding } from "../controllers/embedding.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { search } from "../controllers/search.controller.js";
import { chat } from "../controllers/chat.controller.js";



const router = express.Router();


// @desc create chunks
// @route POST /api/chunks/:repoId/chunk
// @access Private
router.post("/:repoId/chunk", protect, runChunking);

// @desc create embeddings
// @route POST /api/chunks/:repoId/embed
// @access Private
router.post("/:repoId/embed", protect, runEmbedding);

// @desc get chunks
// @route GET /api/chunks/:repoId/chunks
// @access Private
router.get("/:repoId/chunks", protect, listChunks);

// @desc search chunks
// @route POST /api/chunks/:repoId/search
// @access Private
router.post("/:repoId/search", protect, search);

// @desc chat with agent
// @route POST /api/chunks/:repoId/chat
// @access Private
router.post("/:repoId/chat", protect, chat);

export default router;