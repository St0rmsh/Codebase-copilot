import axiosInstance from "../../../services/axiosInstance";

export const fetchGithubRepos = async () => {
  const res = await axiosInstance.get("/github/repos");
  return res.data;
};

export const getGithubConnectUrl = () => "/api/github/connect";