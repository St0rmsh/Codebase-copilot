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

export const fetchOnboardingDoc = async (repoId) => {
  const res = await axiosInstance.get(`/repos/${repoId}/onboarding-doc`);
  return res.data;
};


export const fetchSymbolTrace = async (repoId, symbolName) => {
  const res = await axiosInstance.get(`/repos/${repoId}/trace`, { params: { symbolName } });
  return res.data;
};

export const fetchFileChunks = async (repoId, filePath) => {
  const res = await axiosInstance.get(`/repos/${repoId}/file-chunks`, { params: { filePath } });
  return res.data;
};


export const fetchRepoDebugInfo = async (repoId) => {
  const res = await axiosInstance.get(`/repos/${repoId}/debug`);
  return res.data;
};

export const rerunRepoChunking = async (repoId) => {
  const res = await axiosInstance.post(`/repos/${repoId}/debug/rerun-chunk`);
  return res.data;
};

export const rerunRepoEmbedding = async (repoId) => {
  const res = await axiosInstance.post(`/repos/${repoId}/debug/rerun-embed`);
  return res.data;
};

export const rerunRepoGraph = async (repoId) => {
  const res = await axiosInstance.post(`/repos/${repoId}/debug/rerun-graph`);
  return res.data;
};


export const rebuildRepo = async (repoId) => {
  await chunkRepo(repoId);
  await embedRepo(repoId);
  await buildRepoGraph(repoId);
  return { message: "Rebuild complete" };
};


export const syncRepo = async (repoId) => {
  const res = await axiosInstance.post(`/repos/${repoId}/sync`);
  return res.data;
};



export const enableAutoSync = async (repoId) => {
  const res = await axiosInstance.post(`/repos/${repoId}/auto-sync/enable`);
  return res.data;
};

export const disableAutoSync = async (repoId) => {
  const res = await axiosInstance.post(`/repos/${repoId}/auto-sync/disable`);
  return res.data;
};



export const fetchOpenPullRequests = async (repoId) => {
  const res = await axiosInstance.get(`/repos/${repoId}/pulls`);
  return res.data;
};

export const requestPrReview = async (repoId, prNumber) => {
  const res = await axiosInstance.post(`/repos/${repoId}/pulls/review`, { prNumber });
  return res.data;
};


export const fetchRepoById = async (repoId) => {
  const res = await axiosInstance.get(`/repos/${repoId}`);
  return res.data;
};