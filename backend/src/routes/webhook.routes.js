import express from "express";
import { githubWebhookHandler } from "../controllers/webhook.controller.js";

const router = express.Router();

router.post("/github", githubWebhookHandler);

export default router;