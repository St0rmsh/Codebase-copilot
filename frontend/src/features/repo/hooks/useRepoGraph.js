import { useState, useCallback } from "react";
import { buildRepoGraph, fetchRepoGraph } from "../services/repoService";

export const useRepoGraph = (repoId) => {
  const [graph, setGraph] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadGraph = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchRepoGraph(repoId);
      setGraph(data.graph);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load graph");
    } finally {
      setLoading(false);
    }
  }, [repoId]);

  const generateGraph = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await buildRepoGraph(repoId);
      setGraph(data.graph);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to generate graph");
    } finally {
      setLoading(false);
    }
  }, [repoId]);

  return { graph, loading, error, loadGraph, generateGraph };
};