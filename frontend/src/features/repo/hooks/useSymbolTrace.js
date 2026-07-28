import { useState, useCallback } from "react";
import { fetchSymbolTrace } from "../services/repoService";

export const useSymbolTrace = (repoId) => {
  const [trace, setTrace] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const runTrace = useCallback(
    async (symbolName) => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchSymbolTrace(repoId, symbolName);
        setTrace(data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to trace symbol");
      } finally {
        setLoading(false);
      }
    },
    [repoId]
  );

  const clearTrace = () => setTrace(null);

  return { trace, loading, error, runTrace, clearTrace };
};