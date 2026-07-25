import jwt from "jsonwebtoken";
import config from "../config/config.js";
import { createUser, findUserByEmail, findUserById } from "../dao/user.dao.js";

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, config.JWT_SECRET, { expiresIn: "7d" });
};

export const registerUser = async ({ name, email, password }) => {
  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    const error = new Error("User already exists with this email");
    error.statusCode = 409;
    throw error;
  }

  const user = await createUser({ name, email, password });

  const token = generateToken(user._id);
  return {
    user: { id: user._id, name: user.name, email: user.email },
    token,
  };
};

export const loginUser = async ({ email, password }) => {
  const user = await findUserByEmail(email, true); // include password field
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
  };
};