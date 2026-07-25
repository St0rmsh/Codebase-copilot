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

