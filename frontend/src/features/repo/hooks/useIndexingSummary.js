import { useState, useEffect, useCallback } from "react";
import { fetchIndexingSummary } from "../services/indexingService";

export const useIndexingSummary = (pollInterval = 4000) => {
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const data = await fetchIndexingSummary();
      setRepos(data.repos);
    } catch {
      // silent — polling will retry
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, pollInterval);
    return () => clearInterval(interval);
  }, [load, pollInterval]);

  return { repos, loading, refetch: load };
};