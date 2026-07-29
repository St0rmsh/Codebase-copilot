import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import UserMenu from "../components/UserMenu";
import RepoDebugPanel from "../features/repo/components/RepoDebugPanel";
import { useRepos } from "../features/repo/hooks/useRepos";

const DebuggerPage = () => {
  const { repos, loading } = useRepos();
  const [selectedRepoId, setSelectedRepoId] = useState(null);

  useEffect(() => {
    if (!selectedRepoId && repos.length > 0) {
      setSelectedRepoId(repos[0]._id);
    }
  }, [repos, selectedRepoId]);

  return (
    <div className="flex min-h-screen bg-base">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <div className="flex justify-between items-center px-6 py-4 border-b border-border">
          <select
            value={selectedRepoId || ""}
            onChange={(e) => setSelectedRepoId(e.target.value)}
            className="bg-transparent border border-border px-3 py-2 font-mono text-xs text-white outline-none focus:border-accent"
          >
            {repos.map((repo) => (
              <option key={repo._id} value={repo._id} className="bg-panel">
                {repo.fullName}
              </option>
            ))}
          </select>
          <UserMenu />
        </div>

        {loading ? (
          <p className="font-mono text-xs text-textMuted animate-pulse p-6">Loading repositories...</p>
        ) : !selectedRepoId ? (
          <p className="font-mono text-xs text-textMuted p-6">No repositories yet.</p>
        ) : (
          <RepoDebugPanel repoId={selectedRepoId} />
        )}
      </div>
    </div>
  );
};

export default DebuggerPage;