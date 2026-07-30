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
          <div className="flex items-center gap-4">
            <span className="font-mono text-xs text-textMuted uppercase tracking-widest2">
              Repository
            </span>
            {indexedRepos.length > 0 && (
              <div className="relative">
                <select
                  value={selectedRepoId || ""}
                  onChange={(e) => setSelectedRepoId(e.target.value)}
                  className="appearance-none bg-panel border border-border pl-3 pr-8 py-1.5 font-mono text-xs text-white outline-none focus:border-accent cursor-pointer"
                >
                  {indexedRepos.map((repo) => (
                    <option key={repo._id} value={repo._id} className="bg-panel">
                      {repo.fullName}
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-textMuted text-xs">
                  ▾
                </span>
              </div>
            )}
          </div>
          <UserMenu />
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="font-mono text-xs text-textMuted animate-pulse tracking-widest2 uppercase">
              Loading repositories...
            </p>
          </div>
        ) : !selectedRepo ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3">
            <span className="text-accent text-2xl">⌘</span>
            <p className="font-mono text-xs text-textMuted tracking-widest2 uppercase">
              No indexed repositories yet
            </p>
            <p className="font-mono text-xs text-textMuted">
              Connect a repository from the Workspace to browse its files
            </p>
          </div>
        ) : (
          <RepoFileBrowser repo={selectedRepo} />
        )}
      </div>
    </div>
  );
};

export default RepositoryPage;