import {
  createNewTeam,
  getMyTeams,
  getTeamDetail,
  inviteByEmail,
  joinViaInviteCode,
  removeMember,
  leaveTeam,
  deleteTeam,
  removeMultipleMembers
} from "../services/team.service.js";



export const createTeamHandler = async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name) {
      res.status(400);
      throw new Error("Team name is required");
    }
    const team = await createNewTeam(name, req.user._id);
    res.status(201).json({ success: true, team });
  } catch (error) {
    if (error.statusCode) res.status(error.statusCode);
    next(error);
  }
};

export const listTeamsHandler = async (req, res, next) => {
  try {
    const teams = await getMyTeams(req.user._id);
    res.status(200).json({ success: true, teams });
  } catch (error) {
    next(error);
  }
};

export const getTeamHandler = async (req, res, next) => {
  try {
    const { teamId } = req.params;
    const team = await getTeamDetail(teamId, req.user._id);
    res.status(200).json({ success: true, team });
  } catch (error) {
    if (error.statusCode) res.status(error.statusCode);
    next(error);
  }
};

export const inviteHandler = async (req, res, next) => {
  try {
    const { teamId } = req.params;
    const { email } = req.body;
    if (!email) {
      res.status(400);
      throw new Error("Email is required");
    }
    await inviteByEmail(teamId, email, req.user._id);
    res.status(200).json({ success: true, message: "Invite sent" });
  } catch (error) {
    if (error.statusCode) res.status(error.statusCode);
    next(error);
  }
};

export const joinByCodeHandler = async (req, res, next) => {
  try {
    const { inviteCode } = req.body;
    if (!inviteCode) {
      res.status(400);
      throw new Error("Invite code is required");
    }
    const team = await joinViaInviteCode(inviteCode, req.user._id);
    res.status(200).json({ success: true, team });
  } catch (error) {
    if (error.statusCode) res.status(error.statusCode);
    next(error);
  }
};





export const removeMemberHandler = async (req, res, next) => {
  try {
    const { teamId, memberId } = req.params;
    const team = await removeMember(teamId, memberId, req.user._id);
    res.status(200).json({ success: true, team });
  } catch (error) {
    if (error.statusCode) res.status(error.statusCode);
    next(error);
  }
};

export const leaveTeamHandler = async (req, res, next) => {
  try {
    const { teamId } = req.params;
    await leaveTeam(teamId, req.user._id);
    res.status(200).json({ success: true, message: "Left team" });
  } catch (error) {
    if (error.statusCode) res.status(error.statusCode);
    next(error);
  }
};

export const deleteTeamHandler = async (req, res, next) => {
  try {
    const { teamId } = req.params;
    const result = await deleteTeam(teamId, req.user._id);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    if (error.statusCode) res.status(error.statusCode);
    next(error);
  }
};






export const removeMultipleMembersHandler = async (req, res, next) => {
  try {
    const { teamId } = req.params;
    const { memberIds } = req.body;
    if (!Array.isArray(memberIds) || memberIds.length === 0) {
      res.status(400);
      throw new Error("memberIds array is required");
    }
    const team = await removeMultipleMembers(teamId, memberIds, req.user._id);
    res.status(200).json({ success: true, team });
  } catch (error) {
    if (error.statusCode) res.status(error.statusCode);
    next(error);
  }
};