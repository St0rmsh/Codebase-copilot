import TeamInvite from "../models/teamInvite.model.js";

export const createInvite = async (teamId, email, invitedBy) => {
  return await TeamInvite.findOneAndUpdate(
    { team: teamId, email },
    { team: teamId, email, invitedBy, status: "pending" },
    { upsert: true, returnDocument: "after" }
  );
};

export const findPendingInvitesForEmail = async (email) => {
  return await TeamInvite.find({ email, status: "pending" }).populate("team", "name");
};

export const markInviteAccepted = async (inviteId) => {
  return await TeamInvite.findByIdAndUpdate(inviteId, { status: "accepted" });
};