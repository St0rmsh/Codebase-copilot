import jwt from "jsonwebtoken";
import config from "../config/config.js";
import { findUserById } from "../dao/user.dao.js";

export const protect = async (req, res, next) => {
  try {
    const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];

    if (!token) {
      res.status(401);
      throw new Error("Not authorized, no token");
    }

    const decoded = jwt.verify(token, config.JWT_SECRET);
    const user = await findUserById(decoded.id);

    if (!user) {
      res.status(401);
      throw new Error("Not authorized, user not found");
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401);
    next(new Error("Not authorized, token failed"));
  }
};