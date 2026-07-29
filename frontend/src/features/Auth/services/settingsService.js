import axiosInstance from "../../../services/axiosInstance";

export const updateProfileRequest = async (name) => {
  const res = await axiosInstance.patch("/settings/profile", { name });
  return res.data;
};

export const changePasswordRequest = async (currentPassword, newPassword) => {
  const res = await axiosInstance.post("/settings/change-password", { currentPassword, newPassword });
  return res.data;
};

export const disconnectGithubRequest = async () => {
  const res = await axiosInstance.post("/settings/disconnect-github");
  return res.data;
};

export const deleteRepoRequest = async (repoId) => {
  const res = await axiosInstance.delete(`/settings/repos/${repoId}`);
  return res.data;
};

export const deleteAccountRequest = async () => {
  const res = await axiosInstance.delete("/settings/account");
  return res.data;
};