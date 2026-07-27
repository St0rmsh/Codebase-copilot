import jwt from "jsonwebtoken";
import config from "../config/config.js";
import {
  createUser,
  findUserByEmail,
  findUserById,
  setUserOtp,
  findUserByIdWithOtp,
  markUserVerified,
} from "../dao/user.dao.js";
import { sendOtpEmail } from "../utils/mailer.js";

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, config.JWT_SECRET, { expiresIn: "7d" });
};

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

export const registerUser = async ({ name, email, password }) => {
  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    const error = new Error("User already exists with this email");
    error.statusCode = 409;
    throw error;
  }

  const user = await createUser({ name, email, password });

  const otp = generateOtp();
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 min
  await setUserOtp(user._id, otp, otpExpiry);
  await sendOtpEmail(email, otp);

  return {
    user: { id: user._id, name: user.name, email: user.email },
    requiresVerification: true,
  };
};

export const verifyOtp = async ({ userId, otp }) => {
  const user = await findUserByIdWithOtp(userId);
  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  if (user.isVerified) {
    const error = new Error("User already verified");
    error.statusCode = 400;
    throw error;
  }

  if (!user.otpCode || user.otpCode !== otp) {
    const error = new Error("Invalid OTP");
    error.statusCode = 400;
    throw error;
  }

  if (user.otpExpiry < new Date()) {
    const error = new Error("OTP has expired");
    error.statusCode = 400;
    throw error;
  }

  const verifiedUser = await markUserVerified(user._id);
  const token = generateToken(verifiedUser._id);

  return {
    user: { id: verifiedUser._id, name: verifiedUser.name, email: verifiedUser.email },
    token,
  };
};

export const resendOtp = async (userId) => {
  const user = await findUserById(userId);
  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }
  if (user.isVerified) {
    const error = new Error("User already verified");
    error.statusCode = 400;
    throw error;
  }

  const otp = generateOtp();
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
  await setUserOtp(user._id, otp, otpExpiry);
  await sendOtpEmail(user.email, otp);

  return { message: "OTP resent" };
};

export const loginUser = async ({ email, password }) => {
  const user = await findUserByEmail(email, true);
  if (!user) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  if (!user.isVerified) {
    const error = new Error("Please verify your email before logging in");
    error.statusCode = 403;
    error.userId = user._id; // frontend uses this to redirect to OTP screen
    throw error;
  }

  const token = generateToken(user._id);
  return {
    user: { id: user._id, name: user.name, email: user.email },
    token,
  };
};

export const getCurrentUser = async (userId) => {
  const user = await findUserById(userId);
  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
    githubUsername: user.githubUsername || null,
  };
};