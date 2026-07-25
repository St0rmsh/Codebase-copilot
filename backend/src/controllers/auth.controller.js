import { getCurrentUser } from "../services/auth.service.js";
import { registerUser, loginUser } from "../services/auth.service.js";

export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      res.status(400);
      throw new Error("Name, email, and password are required");
    }

    const { user, token } = await registerUser({ name, email, password });

    res
      .status(201)
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .json({ success: true, user, token });
  } catch (error) {
    if (error.statusCode) res.status(error.statusCode);
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400);
      throw new Error("Email and password are required");
    }

    const { user, token } = await loginUser({ email, password });

    res
      .status(200)
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .json({ success: true, user, token });
  } catch (error) {
    if (error.statusCode) res.status(error.statusCode);
    next(error);
  }
};


export const logout = async (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ success: true, message: "Logged out successfully" });
};


export const getMe = async (req, res, next) => {
  try {
    const user = await getCurrentUser(req.user._id);
    res.status(200).json({ success: true, user });
  } catch (error) {
    if (error.statusCode) res.status(error.statusCode);
    next(error);
  }
};