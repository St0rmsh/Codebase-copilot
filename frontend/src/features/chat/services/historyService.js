import axiosInstance from "../../../services/axiosInstance";

export const fetchConversationHistory = async (query = "") => {
  const res = await axiosInstance.get("/history", { params: query ? { q: query } : {} });
  return res.data;
};

export const fetchConversationDetail = async (conversationId) => {
  const res = await axiosInstance.get(`/history/${conversationId}`);
  return res.data;
};



export const fetchConversationExport = async (conversationId) => {
  const res = await axiosInstance.get(`/history/${conversationId}/export`);
  return res.data;
};