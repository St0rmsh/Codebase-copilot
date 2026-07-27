import axiosInstance from "../../../services/axiosInstance";

export const loginRequest = async ({ email, password }) => {
  const res = await axiosInstance.post("/auth/login", { email, password });
  return res.data;
};

export const registerRequest = async ({ name, email, password }) => {
  const res = await axiosInstance.post("/auth/register", { name, email, password });
  return res.data;
};

export const verifyOtpRequest = async ({ userId, otp }) => {
  const res = await axiosInstance.post("/auth/verify-otp", { userId, otp });
  return res.data;
};

export const resendOtpRequest = async ({ userId }) => {
  const res = await axiosInstance.post("/auth/resend-otp", { userId });
  return res.data;
};

export const getMeRequest = async () => {
  const res = await axiosInstance.get("/auth/me");
  return res.data;
};

export const logoutRequest = async () => {
  const res = await axiosInstance.post("/auth/logout");
  return res.data;
};