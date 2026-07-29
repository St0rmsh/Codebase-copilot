import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import StatusBadge from "../../../components/StatusBadge";
import { syncRepo } from "../services/repoService";
import { showToast } from "../../../App/toastSlice";

const timeAgo = (dateStr) => {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

const RepoCard = ({ repo, onSynced }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [syncing, setSyncing] = useState(false);
  const isReady = repo.status === "indexed";

  const handleSync = async (e) => {
    e.stopPropagation();
    setSyncing(true);
    try {
      const result = await syncRepo(repo._id);
      if (result.hadChanges) {
        dispatch(
          showToast(
            `Synced: ${result.added} added, ${result.modified} modified, ${result.deleted} deleted.`,
            "success"
          )
        );
      } else {
        dispatch(showToast("Already up to date.", "info"));
      }
      onSynced?.();
    } catch {
      dispatch(showToast("Sync failed.", "error"));
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div
      onClick={() => isReady && navigate(`/repo/${repo._id}/chat`)}
      className={`bg-panel border border-border p-6 transition ${
        isReady ? "cursor-pointer hover:border-accent/50" : "cursor-not-allowed opacity-70"
      }`}
    >
      <div className="flex justify-between items-start mb-6">
        <h3 className="font-display text-lg uppercase leading-tight">{repo.name}</h3>
        <div className="flex items-center gap-2 shrink-0 ml-2">
          {repo.language && (
            <span className="font-mono text-xs bg-border px-2 py-1 uppercase text-textMuted">
              {repo.language}
            </span>
          )}
          {isReady && (
            <button
              onClick={handleSync}
              disabled={syncing}
              title="Sync with Github"
              className="font-mono text-xs text-textMuted hover:text-accent disabled:opacity-50"
            >
              {syncing ? "⟳" : "↻"}
            </button>
          )}
        </div>
      </div>

      <p className="font-mono text-xs text-textMuted tracking-widest2 uppercase mb-1">
        File Cluster
      </p>
      <p className="font-display text-sm mb-4">{repo.fileCount ?? 0} MODULES</p>

      <div className="border-t border-border pt-3 flex justify-between items-center">
        <StatusBadge status={repo.status} />
        <span className="font-mono text-xs text-textMuted">{timeAgo(repo.updatedAt)}</span>
      </div>
    </div>
  );
};

export default RepoCard;