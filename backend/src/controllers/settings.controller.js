import {
  updateProfile,
  changePassword,
  disconnectGithub,
  deleteAccount,
} from "../services/auth.service.js";
import { deleteRepoAndData } from "../services/repo.service.js";

export const updateProfileHandler = async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name) {
      res.status(400);
      throw new Error("Name is required");
    }
    const user = await updateProfile(req.user._id, { name });
    res.status(200).json({ success: true, user });
  } catch (error) {
    if (error.statusCode) res.status(error.statusCode);
    next(error);
  }
};

export const changePasswordHandler = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      res.status(400);
      throw new Error("Current and new password are required");
    }
    const result = await changePassword(req.user._id, { currentPassword, newPassword });
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    if (error.statusCode) res.status(error.statusCode);
    next(error);
  }
};

export const disconnectGithubHandler = async (req, res, next) => {
  try {
    const result = await disconnectGithub(req.user._id);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

export const deleteRepoHandler = async (req, res, next) => {
  try {
    const { repoId } = req.params;
    const result = await deleteRepoAndData(repoId, req.user._id);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    if (error.statusCode) res.status(error.statusCode);
    next(error);
  }
};

export const deleteAccountHandler = async (req, res, next) => {
  try {
    await deleteAccount(req.user._id);
    res.clearCookie("token");
    res.status(200).json({ success: true, message: "Account deleted" });
  } catch (error) {
    next(error);
  }
};