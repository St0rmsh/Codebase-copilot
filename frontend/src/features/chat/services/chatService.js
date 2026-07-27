import axiosInstance from "../../../services/axiosInstance";

export const sendChatMessage = async (repoId, question) => {
  const res = await axiosInstance.post(`/repos/${repoId}/chat`, { question });
  return res.data;
};