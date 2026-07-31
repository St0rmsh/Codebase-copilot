import { useNavigate } from "react-router-dom";

const PublicRepoCard = ({ repo }) => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(`/repo/${repo._id}/chat`)}
      className="w-full text-left bg-panel border border-border p-5 hover:border-accent/50 transition"
    >
      <h3 className="font-display text-lg uppercase mb-2">{repo.name}</h3>
      <p className="font-mono text-xs text-textMuted mb-3">{repo.fullName}</p>
      <div className="flex justify-between items-center text-xs font-mono text-textMuted">
        <span>{repo.fileCount} files</span>
        <span>Added by {repo.addedBy?.name || "someone"}</span>
      </div>
    </button>
  );
};

export default PublicRepoCard;