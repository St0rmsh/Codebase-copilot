import { generateDependencyGraph, getDependencyGraph } from "../services/graph.service.js";

export const buildGraph = async (req, res, next) => {
  try {
    const { repoId } = req.params;
    const result = await generateDependencyGraph(repoId);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    if (error.statusCode) res.status(error.statusCode);
    next(error);
  }
};

export const getGraph = async (req, res, next) => {
  try {
    const { repoId } = req.params;
    const graph = await getDependencyGraph(repoId);
    res.status(200).json({ success: true, graph });
  } catch (error) {
    if (error.statusCode) res.status(error.statusCode);
    next(error);
  }
};