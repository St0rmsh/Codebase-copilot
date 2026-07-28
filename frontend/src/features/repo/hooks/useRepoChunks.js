import { useState, useCallback } from "react";
import { fetchRepoChunks } from "../services/repoService";

export const useRepoChunks = (repoId) => {
  const [chunks, setChunks] = useState([]);
  const [loaded, setLoaded] = useState(false);

  const loadChunks = useCallback(async () => {
    if (loaded) return;
    try {
      const data = await fetchRepoChunks(repoId);
      setChunks(data.chunks);
      setLoaded(true);
    } catch {
      // silently fail — graph click will just show "no code found"
    }
  }, [repoId, loaded]);

  const findChunksByFile = (filePath) => chunks.filter((c) => c.filePath === filePath);

  return { chunks, loadChunks, findChunksByFile };
};