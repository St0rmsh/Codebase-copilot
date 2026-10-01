import TeamActionOtp from "../models/teamActionOtp.model.js";

export const replaceTeamActionOtp = async (challenge) => {
  return await TeamActionOtp.findOneAndUpdate(
    { user: challenge.user, purpose: challenge.purpose },
    challenge,
    { upsert: true, returnDocument: "after", runValidators: true }
  );
};

export const findTeamActionOtp = async (userId, purpose) => {
  return await TeamActionOtp.findOne({ user: userId, purpose }).select("+otpHash");
};

export const deleteTeamActionOtp = async (userId, purpose) => {
  return await TeamActionOtp.deleteOne({ user: userId, purpose });
};