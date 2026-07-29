import axiosInstance from "../../../services/axiosInstance";

export const fetchIndexingSummary = async () => {
  const res = await axiosInstance.get("/indexing");
  return res.data;
};