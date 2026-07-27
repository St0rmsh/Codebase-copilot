import User from "../models/user.model.js";

export const createUser = async (userData) => {
  return await User.create(userData);
};

export const findUserByEmail = async (email, includePassword = false) => {
  const query = User.findOne({ email });
  if (includePassword) query.select("+password");
  return await query;
};

export const findUserById = async (id) => {
  return await User.findById(id);
};

export const updateGithubInfo = async (userId, { githubId, githubUsername, githubAccessToken }) => {
  return await User.findByIdAndUpdate(
    userId,
    { githubId, githubUsername, githubAccessToken },
    { returnDocument: "after" }
  );
};

export const findUserByIdWithGithubToken = async (id) => {
  return await User.findById(id).select("+githubAccessToken");
};

export const findUserByGithubId = async (githubId) => {
  return await User.findOne({ githubId });
};

export const createGithubUser = async ({ name, email, githubId, githubUsername, githubAccessToken }) => {
  return await User.create({
    name,
    email,
    githubId,
    githubUsername,
    githubAccessToken,
    isVerified: true, // GitHub already verified the email
  });
};

export const setUserOtp = async (userId, otpCode, otpExpiry) => {
  return await User.findByIdAndUpdate(userId, { otpCode, otpExpiry }, { returnDocument: "after" });
};

export const findUserByIdWithOtp = async (id) => {
  return await User.findById(id).select("+otpCode +otpExpiry");
};

export const markUserVerified = async (userId) => {
  return await User.findByIdAndUpdate(
    userId,
    { isVerified: true, $unset: { otpCode: "", otpExpiry: "" } },
    { returnDocument: "after" }
  );
};