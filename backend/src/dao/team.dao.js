import Team from "../models/team.model.js";
import mongoose from "mongoose";
import crypto from "crypto";

export const createTeam = async (name, ownerId) => {
  const inviteCode = crypto.randomBytes(6).toString("hex");
  return await Team.create({
    name,
    owner: ownerId,
    members: [{ user: ownerId, role: "owner" }],
    inviteCode,
  });
};

export const findTeamById = async (teamId) => {
  return await Team.findById(teamId).populate("members.user", "name email");
};

export const findTeamsByUser = async (userId) => {
  return await Team.find({ "members.user": userId });
};

export const findTeamByInviteCode = async (inviteCode) => {
  return await Team.findOne({ inviteCode });
};

export const addMemberToTeam = async (teamId, userId) => {
  return await Team.findByIdAndUpdate(
    teamId,
    { $addToSet: { members: { user: userId, role: "member" } } },
    { returnDocument: "after" }
  );
};

export const isTeamMember = async (teamId, userId) => {
  const team = await Team.findOne({ _id: teamId, "members.user": userId });
  return !!team;
};

export const isTeamOwner = async (teamId, userId) => {
  const team = await Team.findOne({ _id: teamId, owner: userId });
  return !!team;
};

export const transferTeamOwner = async (teamId, currentOwnerId, nextOwnerId) => {
  const nextOwnerObjectId = new mongoose.Types.ObjectId(nextOwnerId);
  const currentOwnerObjectId = new mongoose.Types.ObjectId(currentOwnerId);
  return await Team.findOneAndUpdate(
    { _id: teamId, owner: currentOwnerObjectId, "members.user": nextOwnerObjectId },
    {
      $set: {
        owner: nextOwnerObjectId,
        "members.$[newOwner].role": "owner",
        "members.$[previousOwner].role": "member",
      },
    },
    {
      arrayFilters: [
        { "newOwner.user": nextOwnerObjectId },
        { "previousOwner.user": currentOwnerObjectId },
      ],
      returnDocument: "after",
    }
  );
};


export const removeMemberFromTeam = async (teamId, userIdToRemove) => {
  return await Team.findByIdAndUpdate(
    teamId,
    { $pull: { members: { user: userIdToRemove } } },
    { returnDocument: "after" }
  );
};

export const deleteTeamById = async (teamId) => {
  return await Team.findByIdAndDelete(teamId);
};