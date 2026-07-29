import express from "express";
import { getIndexing } from "../controllers/indexing.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", protect, getIndexing);

export default router;