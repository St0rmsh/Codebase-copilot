import { useState, useEffect, useCallback } from "react";
import { useDispatch } from "react-redux";
import {
  fetchRepoDebugInfo,
  rerunRepoChunking,
  rerunRepoEmbedding,
  rerunRepoGraph,
} from "../services/repoService";
import { showToast } from "../../../App/toastSlice";
import Button from "../../../components/Button";

const RepoDebugPanel = ({ repoId }) => {
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(null); // "chunk" | "embed" | "graph" | null
  const dispatch = useDispatch();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchRepoDebugInfo(repoId);
      setInfo(data);
    } catch {
      dispatch(showToast("Failed to load debug info.", "error"));
    } finally {
      setLoading(false);
    }
  }, [repoId, dispatch]);

  useEffect(() => {
    load();
  }, [load]);

  const runAction = async (type, fn, label) => {
    setRunning(type);
    try {
      await fn(repoId);
      dispatch(showToast(`${label} completed.`, "success"));
      await load();
    } catch {
      dispatch(showToast(`${label} failed.`, "error"));
    } finally {
      setRunning(null);
    }
  };

  if (loading) {
    return <p className="font-mono text-xs text-textMuted animate-pulse p-6">Loading diagnostics...</p>;
  }

  if (!info) return null;

  const embedPercent = info.totalChunks > 0 ? Math.round((info.embeddedChunks / info.totalChunks) * 100) : 0;

  return (
    <div className="p-6 max-w-3xl">
      <div className="mb-8">
        <p className="font-mono text-xs text-textMuted tracking-widest2 uppercase mb-1">Repository</p>
        <h2 className="font-display text-xl">{info.fullName}</h2>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-panel border border-border p-4">
          <p className="font-mono text-xs text-textMuted uppercase tracking-widest2 mb-1">Status</p>
          <p className={`font-mono text-sm ${info.status === "failed" ? "text-accent" : "text-accentSoft"}`}>
            {info.status.toUpperCase()}
          </p>
        </div>
        <div className="bg-panel border border-border p-4">
          <p className="font-mono text-xs text-textMuted uppercase tracking-widest2 mb-1">Local Path</p>
          <p className="font-mono text-sm text-accentSoft">{info.hasLocalPath ? "Available" : "Missing"}</p>
        </div>
        <div className="bg-panel border border-border p-4">
          <p className="font-mono text-xs text-textMuted uppercase tracking-widest2 mb-1">Total Chunks</p>
          <p className="font-mono text-sm text-accentSoft">{info.totalChunks}</p>
        </div>
        <div className="bg-panel border border-border p-4">
          <p className="font-mono text-xs text-textMuted uppercase tracking-widest2 mb-1">Embedding Coverage</p>
          <p className="font-mono text-sm text-accentSoft">{embedPercent}%</p>
        </div>
      </div>

      {info.errorMessage && (
        <div className="bg-panel border border-accent p-4 mb-8">
          <p className="font-mono text-xs text-accent uppercase tracking-widest2 mb-1">Last Error</p>
          <p className="font-mono text-xs text-textMuted">{info.errorMessage}</p>
        </div>
      )}

      {info.unchunkedFiles.length > 0 && (
        <div className="mb-8">
          <p className="font-mono text-xs text-textMuted uppercase tracking-widest2 mb-2">
            Files With No Extracted Symbols ({info.unchunkedFiles.length})
          </p>
          <div className="bg-panel border border-border max-h-48 overflow-y-auto">
            {info.unchunkedFiles.map((path) => (
              <div key={path} className="font-mono text-xs text-textMuted px-3 py-2 border-b border-border last:border-b-0">
                {path}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3">
        <p className="font-mono text-xs text-textMuted uppercase tracking-widest2 mb-1">Manual Re-run</p>
        <Button
          variant="outline"
          disabled={running !== null}
          onClick={() => runAction("chunk", rerunRepoChunking, "Chunking")}
        >
          {running === "chunk" ? "Re-chunking..." : "Re-run Chunking"}
        </Button>
        <Button
          variant="outline"
          disabled={running !== null}
          onClick={() => runAction("embed", rerunRepoEmbedding, "Embedding")}
        >
          {running === "embed" ? "Re-embedding..." : "Re-run Embedding"}
        </Button>
        <Button
          variant="outline"
          disabled={running !== null}
          onClick={() => runAction("graph", rerunRepoGraph, "Dependency graph")}
        >
          {running === "graph" ? "Rebuilding graph..." : "Rebuild Dependency Graph"}
        </Button>
      </div>
    </div>
  );
};

export default RepoDebugPanel;