import { useGithubRepos } from "../hooks/useGithubRepos";
import { useRepos } from "../../repo/hooks/useRepos";

const GithubRepoPicker = ({ onClose }) => {
  const { githubRepos, loading } = useGithubRepos(true);
  const { ingest, ingesting } = useRepos();

  const handleSelect = async (repo) => {
    const result = await ingest({
      githubRepoId: String(repo.id),
      name: repo.name,
      fullName: repo.fullName,
      private: repo.private,
      defaultBranch: repo.defaultBranch,
      cloneUrl: repo.cloneUrl,
    });
    if (result.success) onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-panel border border-border w-full max-w-lg max-h-[70vh] overflow-y-auto">
        <div className="flex justify-between items-center px-6 py-4 border-b border-border">
          <h2 className="font-mono text-sm tracking-widest2 uppercase text-accentSoft">
            Select Repository
          </h2>
          <button onClick={onClose} className="text-textMuted hover:text-white" disabled={ingesting}>
            ✕
          </button>
        </div>

        {ingesting && (
          <div className="px-6 py-4 border-b border-border font-mono text-xs text-accent animate-pulse">
            Cloning, chunking, and embedding repository — this may take a moment...
          </div>
        )}

        {loading && !ingesting && (
          <p className="font-mono text-xs text-textMuted p-6">Loading repositories...</p>
        )}

        <div className="divide-y divide-border">
          {githubRepos.map((repo) => (
            <button
              key={repo.id}
              onClick={() => handleSelect(repo)}
              disabled={ingesting}
              className="w-full text-left px-6 py-4 hover:bg-base transition flex justify-between items-center disabled:opacity-50"
            >
              <div>
                <p className="font-mono text-sm">{repo.fullName}</p>
                <p className="font-mono text-xs text-textMuted mt-1">
                  {repo.language || "—"} · {repo.private ? "Private" : "Public"}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GithubRepoPicker;