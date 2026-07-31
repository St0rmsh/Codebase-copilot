import express from "express";
import { runChunking, listChunks, getFileChunks } from "../controllers/chunk.controller.js";
import { runEmbedding } from "../controllers/embedding.controller.js";
import { search } from "../controllers/search.controller.js";
import { chat, chatStream } from "../controllers/chat.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { buildGraph, getGraph } from "../controllers/graph.controller.js";
import { getOnboardingDoc } from "../controllers/onboarding.controller.js";
import { trace } from "../controllers/trace.controller.js";
import { getDebugInfo, rerunChunkingHandler, rerunEmbeddingHandler, rerunGraphHandler } from "../controllers/debug.controller.js";
import { syncRepoHandler } from "../controllers/sync.controller.js";
import { listPrs, reviewPr } from "../controllers/prReview.controller.js";


const router = express.Router();

// @desc create chunks
// @route POST /api/chunks/:repoId/chunk
// @access Private
router.post("/:repoId/chunk", protect, runChunking);


// @desc get chunks
// @route GET /api/chunks/:repoId/chunks
// @access Private
router.get("/:repoId/chunks", protect, listChunks);


// @desc create embeddings
// @route POST /api/chunks/:repoId/embed
// @access Private
router.post("/:repoId/embed", protect, runEmbedding);


// @desc search chunks
// @route POST /api/chunks/:repoId/search
// @access Private
router.post("/:repoId/search", protect, search);


// @desc chat with agent
// @route POST /api/chunks/:repoId/chat
// @access Private
router.post("/:repoId/chat", protect, chat);

// @desc chat with agent
// @route POST /api/chunks/:repoId/chat/stream
// @access Private
router.post("/:repoId/chat/stream", protect, chatStream);


// @desc create graph
// @route POST /api/chunks/:repoId/graph
// @access Private
router.post("/:repoId/graph", protect, buildGraph);

// @desc get graph
// @route GET /api/chunks/:repoId/graph
// @access Private
router.get("/:repoId/graph", protect, getGraph);


// @desc get onboarding doc
// @route GET /api/chunks/:repoId/onboarding-doc
// @access Private
router.get("/:repoId/onboarding-doc", protect, getOnboardingDoc);


// @desc trace symbol
// @route GET /api/chunks/:repoId/trace
// @access Private
router.get("/:repoId/trace", protect, trace);

// @desc get chunks for a specific file
// @route GET /api/chunks/:repoId/file-chunks
// @access Private
router.get("/:repoId/file-chunks", protect, getFileChunks);


// @desc get debug info
// @route GET /api/chunks/:repoId/debug
// @access Private
router.get("/:repoId/debug", protect, getDebugInfo);


// @desc rerun chunking
// @route POST /api/chunks/:repoId/debug/rerun-chunk
// @access Private
router.post("/:repoId/debug/rerun-chunk", protect, rerunChunkingHandler);


// @desc rerun embedding
// @route POST /api/chunks/:repoId/debug/rerun-embed
// @access Private
router.post("/:repoId/debug/rerun-embed", protect, rerunEmbeddingHandler);


// @desc rerun graph
// @route POST /api/chunks/:repoId/debug/rerun-graph
// @access Private
router.post("/:repoId/debug/rerun-graph", protect, rerunGraphHandler);



// @desc sync repo
// @route POST /api/chunks/:repoId/sync
// @access Private
router.post("/:repoId/sync", protect, syncRepoHandler);




// @desc list prs
// @route GET /api/chunks/:repoId/pulls
// @access Private
router.get("/:repoId/pulls", protect, listPrs);

// @desc review pr
// @route POST /api/chunks/:repoId/pulls/review
// @access Private
router.post("/:repoId/pulls/review", protect, reviewPr);


export default router;