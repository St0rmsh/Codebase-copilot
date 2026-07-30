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
  removeMultipleMembersHandler,
} from "../controllers/team.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

//@route: POST /api/teams
//@desc: Create a new team
//@access: Protected
router.post("/", protect, createTeamHandler);

//@route: GET /api/teams
//@desc: Get all teams
//@access: Protected
router.get("/", protect, listTeamsHandler);

//@route: GET /api/teams/:teamId
//@desc: Get a team by ID
//@access: Protected
router.get("/:teamId", protect, getTeamHandler);

//@route: POST /api/teams/:teamId/invite
//@desc: Invite a member to a team
//@access: Protected
router.post("/:teamId/invite", protect, inviteHandler);

//@route: POST /api/teams/join
//@desc: Join a team using an invite code
//@access: Protected
router.post("/join", protect, joinByCodeHandler);


//@route: DELETE /api/teams/:teamId/members/:memberId
//@desc: Remove a member from a team
//@access: Protected
router.delete("/:teamId/members/:memberId", protect, removeMemberHandler);

//@route: DELETE /api/teams/:teamId/leave
//@desc: Leave a team
//@access: Protected
router.delete("/:teamId/leave", protect, leaveTeamHandler);

//@route: DELETE /api/teams/:teamId
//@desc: Delete a team
//@access: Protected
router.delete("/:teamId", protect, deleteTeamHandler);

//@route: POST /api/teams/:teamId/members/remove-bulk
//@desc: Remove multiple members from a team
//@access: Protected
router.post("/:teamId/members/remove-bulk", protect, removeMultipleMembersHandler);

export default router;