import { useNavigate } from "react-router-dom";
import StatusBadge from "../../../components/StatusBadge";

const timeAgo = (dateStr) => {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

const RepoCard = ({ repo }) => {
  const navigate = useNavigate();
  const isReady = repo.status === "indexed";

  return (
    <div
      onClick={() => isReady && navigate(`/repo/${repo._id}/chat`)}
      className={`bg-panel border border-border p-6 transition ${
        isReady ? "cursor-pointer hover:border-accent/50" : "cursor-not-allowed opacity-70"
      }`}
    >
      <div className="flex justify-between items-start mb-6">
        <h3 className="font-display text-lg uppercase leading-tight">{repo.name}</h3>
        {repo.language && (
          <span className="font-mono text-xs bg-border px-2 py-1 uppercase text-textMuted shrink-0 ml-2">
            {repo.language}
          </span>
        )}
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