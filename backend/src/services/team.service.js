import crypto from "crypto";
import config from "../config/config.js";
import {
  createTeam,
  findTeamById,
  findTeamsByUser,
  findTeamByInviteCode,
  addMemberToTeam,
  isTeamMember,
  isTeamOwner,
  removeMemberFromTeam,
  deleteTeamById,
  transferTeamOwner as transferTeamOwnerRecord,
} from "../dao/team.dao.js";
import { createInvite, markPendingInviteAccepted } from "../dao/teamInvite.dao.js";
import { findUserByEmail, findUserById } from "../dao/user.dao.js";
import { deleteTeamActionOtp, findTeamActionOtp, replaceTeamActionOtp } from "../dao/teamActionOtp.dao.js";
import { sendTeamActionOtpEmail, sendTeamInviteEmail } from "../utils/mailer.js";

const OTP_TTL_MS = 10 * 60 * 1000;
const createError = (message, statusCode) => Object.assign(new Error(message), { statusCode });
const otpHash = (userId, purpose, otp) =>
  crypto.createHmac("sha256", config.JWT_SECRET).update(`${userId}:${purpose}:${otp}`).digest("hex");

const sendTeamActionOtp = async (userId, purpose, payload) => {
  const user = await findUserById(userId);
  if (!user?.email) throw createError("A verified email address is required", 400);

  const otp = crypto.randomInt(100000, 1000000).toString();
  const expiresAt = new Date(Date.now() + OTP_TTL_MS);
  await replaceTeamActionOtp({
    user: userId,
    purpose,
    otpHash: otpHash(userId, purpose, otp),
    payload,
    expiresAt,
  });
  await sendTeamActionOtpEmail(user.email, otp, purpose);
  return { email: user.email, expiresAt: expiresAt.toISOString() };
};

const verifyTeamActionOtp = async (userId, purpose, otp) => {
  const challenge = await findTeamActionOtp(userId, purpose);
  if (!challenge || challenge.expiresAt <= new Date()) {
    throw createError("The verification code is invalid or expired. Request a new code.", 400);
  }

  const expected = Buffer.from(challenge.otpHash, "hex");
  const supplied = Buffer.from(otpHash(userId, purpose, String(otp)), "hex");
  if (expected.length !== supplied.length || !crypto.timingSafeEqual(expected, supplied)) {
    throw createError("The verification code is incorrect", 400);
  }

  return challenge;
};


export const createNewTeam = async (name, ownerId) => {
  return await createTeam(name, ownerId);
};

export const requestCreateTeamOtp = async (name, userId) => {
  const normalizedName = String(name || "").trim();
  if (!normalizedName) throw createError("Team name is required", 400);
  return await sendTeamActionOtp(userId, "create-team", { name: normalizedName });
};

export const verifyCreateTeamOtp = async (name, otp, userId) => {
  const normalizedName = String(name || "").trim();
  const challenge = await verifyTeamActionOtp(userId, "create-team", otp);
  if (challenge.payload.name !== normalizedName) {
    throw createError("The team name changed. Request a new verification code.", 400);
  }
  const team = await createNewTeam(normalizedName, userId);
  await deleteTeamActionOtp(userId, "create-team");
  return team;
};

export const requestJoinTeamOtp = async (inviteCode, userId) => {
  const normalizedCode = String(inviteCode || "").trim().toLowerCase();
  const team = await findTeamByInviteCode(normalizedCode);
  if (!team) throw createError("Invalid invite code", 404);
  if (await isTeamMember(team._id, userId)) throw createError("You are already a team member", 409);
  return await sendTeamActionOtp(userId, "join-team", {
    teamId: team._id.toString(),
    inviteCode: normalizedCode,
  });
};

export const verifyJoinTeamOtp = async (inviteCode, otp, userId) => {
  const normalizedCode = String(inviteCode || "").trim().toLowerCase();
  const challenge = await verifyTeamActionOtp(userId, "join-team", otp);
  if (challenge.payload.inviteCode !== normalizedCode) {
    throw createError("The invite code changed. Request a new verification code.", 400);
  }

  const team = await findTeamByInviteCode(normalizedCode);
  if (!team || team._id.toString() !== challenge.payload.teamId) {
    throw createError("This team invite is no longer valid", 404);
  }
  if (await isTeamMember(team._id, userId)) throw createError("You are already a team member", 409);

  const joinedTeam = await addMemberToTeam(team._id, userId);
  const user = await findUserById(userId);
  if (user?.email) await markPendingInviteAccepted(team._id, user.email);
  await deleteTeamActionOtp(userId, "join-team");
  return joinedTeam;
};

export const getMyTeams = async (userId) => {
  return await findTeamsByUser(userId);
};

export const getTeamDetail = async (teamId, userId) => {
  const isMember = await isTeamMember(teamId, userId);
  if (!isMember) {
    const error = new Error("You are not a member of this team");
    error.statusCode = 403;
    throw error;
  }
  return await findTeamById(teamId);
};

export const inviteByEmail = async (teamId, email, invitedById) => {
  const isOwner = await isTeamOwner(teamId, invitedById);
  if (!isOwner) {
    const error = new Error("Only the team owner can invite members");
    error.statusCode = 403;
    throw error;
  }

  const invite = await createInvite(teamId, email, invitedById);
  const team = await findTeamById(teamId);

  await sendTeamInviteEmail(email, team.name, team.inviteCode);

  return invite;
};

export const joinViaInviteCode = async (inviteCode, userId) => {
  return await requestJoinTeamOtp(inviteCode, userId);
};

export const acceptPendingInvites = async (userEmail, userId) => {
  throw createError("Team invitations must be accepted through OTP verification", 403);
};




export const removeMember = async (teamId, memberIdToRemove, requestingUserId) => {
  const isOwner = await isTeamOwner(teamId, requestingUserId);
  if (!isOwner) {
    const error = new Error("Only the team owner can remove members");
    error.statusCode = 403;
    throw error;
  }

  const team = await findTeamById(teamId);
  if (team.owner.toString() === memberIdToRemove) {
    const error = new Error("Cannot remove the team owner");
    error.statusCode = 400;
    throw error;
  }

  return await removeMemberFromTeam(teamId, memberIdToRemove);
};

export const leaveTeam = async (teamId, userId) => {
  const team = await findTeamById(teamId);
  if (!team) {
    const error = new Error("Team not found");
    error.statusCode = 404;
    throw error;
  }
  const isOwner = team.owner.toString() === userId.toString();
  const isMember = team.members.some((member) => (member.user._id || member.user).toString() === userId.toString());
  if (!isMember) throw createError("You are not a member of this team", 403);

  let successorName;
  if (isOwner) {
    const successors = team.members.filter((member) => (member.user._id || member.user).toString() !== userId.toString());
    if (successors.length === 0) {
      throw createError("Add another member or delete the team before leaving", 400);
    }
    const successor = successors[crypto.randomInt(successors.length)];
    const successorId = successor.user._id || successor.user;
    const transferred = await transferTeamOwnerRecord(teamId, userId, successorId);
    if (!transferred) throw createError("Could not transfer team admin role", 409);
    successorName = successor.user.name || successor.user.email || "A team member";
  }
  await removeMemberFromTeam(teamId, userId);
  return { successorName };
};

export const transferTeamOwner = async (teamId, nextOwnerId, requestingUserId) => {
  if (!(await isTeamOwner(teamId, requestingUserId))) {
    throw createError("Only the current team admin can transfer the admin role", 403);
  }
  if (nextOwnerId.toString() === requestingUserId.toString()) {
    throw createError("You are already the team admin", 400);
  }
  const updatedTeam = await transferTeamOwnerRecord(teamId, requestingUserId, nextOwnerId);
  if (!updatedTeam) throw createError("The selected user is not a team member", 404);
  return await findTeamById(teamId);
};

export const deleteTeam = async (teamId, userId) => {
  const isOwner = await isTeamOwner(teamId, userId);
  if (!isOwner) {
    const error = new Error("Only the team owner can delete the team");
    error.statusCode = 403;
    throw error;
  }
  await deleteTeamById(teamId);
  return { message: "Team deleted" };
};


export const removeMultipleMembers = async (teamId, memberIds, requestingUserId) => {
  const isOwner = await isTeamOwner(teamId, requestingUserId);
  if (!isOwner) {
    const error = new Error("Only the team owner can remove members");
    error.statusCode = 403;
    throw error;
  }

  const team = await findTeamById(teamId);
  const ownerId = team.owner.toString();

  const idsToRemove = memberIds.filter((id) => id !== ownerId); // never allow removing the owner

  let updatedTeam = team;
  for (const memberId of idsToRemove) {
    updatedTeam = await removeMemberFromTeam(teamId, memberId);
  }

  return updatedTeam;
};