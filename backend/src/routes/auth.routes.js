import express from "express";
import { getMe, login, logout, register, verify, resend } from "../controllers/auth.controller.js";
import { protect } from "../middlewares/auth.middleware.js";


const router = express.Router();

// @routes http://localhost:3000/api/auth/register
// @desc register user
router.post("/register", register);

// @routes http://localhost:3000/api/auth/verify-otp
// @desc verify otp
router.post("/verify-otp", verify);
// @routes http://localhost:3000/api/auth/resend-otp
// @desc resend otp
router.post("/resend-otp", resend);

// @routes http://localhost:3000/api/auth/login
// @desc login user
router.post("/login", login);

// @routes http://localhost:3000/api/auth/logout
// @desc logout user
router.post("/logout", logout);

// @routes http://localhost:3000/api/auth/me
// @desc get current user
router.get("/me", protect,getMe);

export default router;