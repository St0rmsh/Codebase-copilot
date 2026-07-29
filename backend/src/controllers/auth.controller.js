import {
  registerUser,
  loginUser,
  getCurrentUser,
  verifyOtp,
  resendOtp,
} from "../services/auth.service.js";

export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      res.status(400);
      throw new Error("Name, email, and password are required");
    }

    const result = await registerUser({ name, email, password });

    res.status(201).json({ success: true, ...result });
  } catch (error) {
    if (error.statusCode) res.status(error.statusCode);
    next(error);
  }
};

export const verify = async (req, res, next) => {
  try {
    const { userId, otp } = req.body;
    if (!userId || !otp) {
      res.status(400);
      throw new Error("userId and otp are required");
    }

    const { user, token } = await verifyOtp({ userId, otp });

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

export const resend = async (req, res, next) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      res.status(400);
      throw new Error("userId is required");
    }
    const result = await resendOtp(userId);
    res.status(200).json({ success: true, ...result });
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
    if (error.userId) {
      return res.status(error.statusCode || 403).json({
        success: false,
        message: error.message,
        requiresVerification: true,
        userId: error.userId,
      });
    }
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




