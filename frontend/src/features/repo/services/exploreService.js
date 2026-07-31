import axiosInstance from "../../../services/axiosInstance";

export const exploreRepoByUrl = async (githubUrl) => {
  const res = await axiosInstance.post("/explore/explore", { githubUrl });
  return res.data;
};

export const fetchPublicRepos = async () => {
  const res = await axiosInstance.get("/explore");
  return res.data;
};