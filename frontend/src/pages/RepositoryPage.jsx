import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import UserMenu from "../components/UserMenu";
import RepoFileBrowser from "../features/repo/components/RepoFileBrowser";
import { useRepos } from "../features/repo/hooks/useRepos";

const RepositoryPage = () => {
  const { repos, loading } = useRepos();
  const [selectedRepoId, setSelectedRepoId] = useState(null);

  useEffect(() => {
    const indexed = repos.filter((r) => r.status === "indexed");
    if (!selectedRepoId && indexed.length > 0) {
      setSelectedRepoId(indexed[0]._id);
    }
  }, [repos, selectedRepoId]);

  const selectedRepo = repos.find((r) => r._id === selectedRepoId);
  const indexedRepos = repos.filter((r) => r.status === "indexed");

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
            {indexedRepos.map((repo) => (
              <option key={repo._id} value={repo._id} className="bg-panel">
                {repo.fullName}
              </option>
            ))}
          </select>
          <UserMenu />
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="font-mono text-xs text-textMuted animate-pulse">Loading repositories...</p>
          </div>
        ) : !selectedRepo ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="font-mono text-xs text-textMuted">No indexed repositories yet.</p>
          </div>
        ) : (
          <RepoFileBrowser repo={selectedRepo} />
        )}
      </div>
    </div>
  );
};

export default RepositoryPage;