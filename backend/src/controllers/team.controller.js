import {
  requestCreateTeamOtp,
  verifyCreateTeamOtp,
  getMyTeams,
  getTeamDetail,
  inviteByEmail,
  requestJoinTeamOtp,
  verifyJoinTeamOtp,
  removeMember,
  leaveTeam,
  deleteTeam,
  removeMultipleMembers,
  transferTeamOwner,
} from "../services/team.service.js";

export const createTeamHandler = async (req, res, next) => {
  try {
    const { name } = req.body;
    const result = await requestCreateTeamOtp(name, req.user._id);
    res.status(200).json({ success: true, requiresOtp: true, ...result });
  } catch (error) {
    if (error.statusCode) res.status(error.statusCode);
    next(error);
  }
};

export const verifyCreateTeamHandler = async (req, res, next) => {
  try {
    const { name, otp } = req.body;
    if (!name || !otp) {
      res.status(400);
      throw new Error("Team name and OTP are required");
    }
    const team = await verifyCreateTeamOtp(name, otp, req.user._id);
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
    const team = await getTeamDetail(req.params.teamId, req.user._id);
    res.status(200).json({ success: true, team });
  } catch (error) {
    if (error.statusCode) res.status(error.statusCode);
    next(error);
  }
};

export const inviteHandler = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400);
      throw new Error("Email is required");
    }
    await inviteByEmail(req.params.teamId, email, req.user._id);
    res.status(200).json({ success: true, message: "Invite sent" });
  } catch (error) {
    if (error.statusCode) res.status(error.statusCode);
    next(error);
  }
};

export const joinByCodeHandler = async (req, res, next) => {
  try {
    const { inviteCode } = req.body;
    const result = await requestJoinTeamOtp(inviteCode, req.user._id);
    res.status(200).json({ success: true, requiresOtp: true, ...result });
  } catch (error) {
    if (error.statusCode) res.status(error.statusCode);
    next(error);
  }
};

export const verifyJoinByCodeHandler = async (req, res, next) => {
  try {
    const { inviteCode, otp } = req.body;
    if (!inviteCode || !otp) {
      res.status(400);
      throw new Error("Invite code and OTP are required");
    }
    const team = await verifyJoinTeamOtp(inviteCode, otp, req.user._id);
    res.status(200).json({ success: true, team });
  } catch (error) {
    if (error.statusCode) res.status(error.statusCode);
    next(error);
  }
};

export const removeMemberHandler = async (req, res, next) => {
  try {
    const team = await removeMember(req.params.teamId, req.params.memberId, req.user._id);
    res.status(200).json({ success: true, team });
  } catch (error) {
    if (error.statusCode) res.status(error.statusCode);
    next(error);
  }
};

export const leaveTeamHandler = async (req, res, next) => {
  try {
    const result = await leaveTeam(req.params.teamId, req.user._id);
    res.status(200).json({ success: true, message: "Left team", ...result });
  } catch (error) {
    if (error.statusCode) res.status(error.statusCode);
    next(error);
  }
};

export const deleteTeamHandler = async (req, res, next) => {
  try {
    const result = await deleteTeam(req.params.teamId, req.user._id);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    if (error.statusCode) res.status(error.statusCode);
    next(error);
  }
};

export const removeMultipleMembersHandler = async (req, res, next) => {
  try {
    const { memberIds } = req.body;
    if (!Array.isArray(memberIds) || memberIds.length === 0) {
      res.status(400);
      throw new Error("memberIds array is required");
    }
    const team = await removeMultipleMembers(req.params.teamId, memberIds, req.user._id);
    res.status(200).json({ success: true, team });
  } catch (error) {
    if (error.statusCode) res.status(error.statusCode);
    next(error);
  }
};

export const transferTeamAdminHandler = async (req, res, next) => {
  try {
    const { memberId } = req.body;
    if (!memberId) {
      res.status(400);
      throw new Error("memberId is required");
    }
    const team = await transferTeamOwner(req.params.teamId, memberId, req.user._id);
    res.status(200).json({ success: true, team });
  } catch (error) {
    if (error.statusCode) res.status(error.statusCode);
    next(error);
  }
};