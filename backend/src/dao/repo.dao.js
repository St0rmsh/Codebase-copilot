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