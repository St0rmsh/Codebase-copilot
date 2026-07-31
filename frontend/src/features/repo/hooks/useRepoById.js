import { useState, useEffect, useCallback } from "react";
import { fetchRepoById } from "../services/repoService";

export const useRepoById = (repoId) => {
  const [repo, setRepo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!repoId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchRepoById(repoId);
      setRepo(data.repo);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load repository");
    } finally {
      setLoading(false);
    }
  }, [repoId]);

  useEffect(() => {
    load();
  }, [load]);

  return { repo, loading, error, refetch: load };
};