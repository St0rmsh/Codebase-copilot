import express from "express";
import {
  createTeamHandler,
  listTeamsHandler,
  getTeamHandler,
  inviteHandler,
  joinByCodeHandler,
  removeMemberHandler,
  leaveTeamHandler,
  deleteTeamHandler,
} from "../controllers/team.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", protect, createTeamHandler);
router.get("/", protect, listTeamsHandler);
router.get("/:teamId", protect, getTeamHandler);
router.post("/:teamId/invite", protect, inviteHandler);
router.post("/join", protect, joinByCodeHandler);




router.delete("/:teamId/members/:memberId", protect, removeMemberHandler);
router.delete("/:teamId/leave", protect, leaveTeamHandler);
router.delete("/:teamId", protect, deleteTeamHandler);

export default router;