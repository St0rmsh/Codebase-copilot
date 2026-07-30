import { createTeam, findTeamById, findTeamsByUser, findTeamByInviteCode, addMemberToTeam, isTeamMember, isTeamOwner, removeMemberFromTeam, deleteTeamById } from "../dao/team.dao.js";
import { createInvite, findPendingInvitesForEmail, markInviteAccepted } from "../dao/teamInvite.dao.js";
import { findUserByEmail } from "../dao/user.dao.js";
import { sendTeamInviteEmail } from "../utils/mailer.js";


export const createNewTeam = async (name, ownerId) => {
  return await createTeam(name, ownerId);
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

  await sendTeamInviteEmail(email, team.name);

  return invite;
};

export const joinViaInviteCode = async (inviteCode, userId) => {
  const team = await findTeamByInviteCode(inviteCode);
  if (!team) {
    const error = new Error("Invalid invite code");
    error.statusCode = 404;
    throw error;
  }
  return await addMemberToTeam(team._id, userId);
};

export const acceptPendingInvites = async (userEmail, userId) => {
  const invites = await findPendingInvitesForEmail(userEmail);
  for (const invite of invites) {
    await addMemberToTeam(invite.team._id, userId);
    await markInviteAccepted(invite._id);
  }
  return invites.length;
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
  if (team.owner.toString() === userId.toString()) {
    const error = new Error("Team owner cannot leave — delete the team instead");
    error.statusCode = 400;
    throw error;
  }
  return await removeMemberFromTeam(teamId, userId);
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