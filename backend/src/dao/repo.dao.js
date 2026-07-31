import Repo from "../models/repo.model.js";

export const createRepo = async (repoData) => {
  return await Repo.create(repoData);
};

export const findRepoById = async (id) => {
  return await Repo.findById(id);
};

export const findReposByUser = async (userId) => {
  return await Repo.find({ user: userId }).sort({ createdAt: -1 });
};

export const updateRepoStatus = async (id, status, extra = {}) => {
  return await Repo.findByIdAndUpdate(id, { status, ...extra }, { returnDocument: "after" });
};

export const saveDependencyGraph = async (repoId, dependencyGraph) => {
  return await Repo.findByIdAndUpdate(repoId, { dependencyGraph }, { returnDocument: "after" });
};

export const findReposByUserId = async (userId) => {
  return await Repo.find({ user: userId }).select("_id name fullName status").sort({ name: 1 });
};

export const findRepoWithStatus = async (repoId) => {
  return await Repo.findById(repoId).select(
    "name fullName status errorMessage fileCount localPath webhookId"
  );
};

export const deleteRepoById = async (repoId) => {
  return await Repo.findByIdAndDelete(repoId);
};

export const updateRepoTeam = async (repoId, teamId) => {
  return await Repo.findByIdAndUpdate(repoId, { team: teamId }, { returnDocument: "after" });
};

export const findReposByUserOrTeams = async (userId, teamIds) => {
  return await Repo.find({
    $or: [{ user: userId }, { team: { $in: teamIds } }],
  }).sort({ createdAt: -1 });
};

export const saveWebhookInfo = async (repoId, webhookId, webhookSecret) => {
  return await Repo.findByIdAndUpdate(repoId, { webhookId, webhookSecret }, { returnDocument: "after" });
};

export const findRepoByIdWithWebhookSecret = async (repoId) => {
  return await Repo.findById(repoId).select("+webhookSecret");
};

export const findRepoByGithubRepoId = async (githubRepoId) => {
  return await Repo.findOne({ githubRepoId: githubRepoId.toString() });
};


export const findPublicRepos = async () => {
  return await Repo.find({ visibility: "public", status: "indexed" })
    .populate("addedBy", "name")
    .sort({ createdAt: -1 });
};