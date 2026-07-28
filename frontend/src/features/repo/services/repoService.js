import axiosInstance from "../../../services/axiosInstance";

export const fetchUserRepos = async () => {
  const res = await axiosInstance.get("/repos");
  return res.data;
};

export const ingestRepo = async (repoData) => {
  const res = await axiosInstance.post("/repos/ingest", repoData);
  return res.data;
};

export const chunkRepo = async (repoId) => {
  const res = await axiosInstance.post(`/repos/${repoId}/chunk`);
  return res.data;
};

export const embedRepo = async (repoId) => {
  const res = await axiosInstance.post(`/repos/${repoId}/embed`);
  return res.data;
};

export const buildRepoGraph = async (repoId) => {
  const res = await axiosInstance.post(`/repos/${repoId}/graph`);
  return res.data;
};

export const fetchRepoGraph = async (repoId) => {
  const res = await axiosInstance.get(`/repos/${repoId}/graph`);
  return res.data;
};

export const fetchRepoChunks = async (repoId) => {
  const res = await axiosInstance.get(`/repos/${repoId}/chunks`);
  return res.data;
};