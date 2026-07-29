import Sidebar from "../components/Sidebar";
import UserMenu from "../components/UserMenu";
import IndexingRow from "../features/repo/components/IndexingRow";
import { useIndexingSummary } from "../features/repo/hooks/useIndexingSummary";

const IndexingPage = () => {
  const { repos, loading } = useIndexingSummary();

  const totalChunks = repos.reduce((sum, r) => sum + r.totalChunks, 0);
  const totalEmbedded = repos.reduce((sum, r) => sum + r.embeddedChunks, 0);
  const overallPercent = totalChunks > 0 ? Math.round((totalEmbedded / totalChunks) * 100) : 0;
  const activeCount = repos.filter((r) => r.status === "pending" || r.status === "cloning").length;

  return (
    <div className="flex min-h-screen bg-base">
      <Sidebar />
      <main className="flex-1 px-10 py-8">
        <div className="flex justify-end mb-6">
          <UserMenu />
        </div>

        <h1 className="font-display text-3xl mb-2">
          INDEXING <span className="text-accentSoft">OVERVIEW</span>
        </h1>
        <p className="font-mono text-xs text-textMuted tracking-widest2 uppercase mb-8">
          {activeCount > 0 ? `${activeCount} repositories actively indexing` : "All repositories up to date"}
        </p>

        <div className="grid grid-cols-3 gap-4 mb-10">
          <div className="bg-panel border border-border p-5">
            <p className="font-mono text-xs text-textMuted uppercase tracking-widest2 mb-1">Repositories</p>
            <p className="font-display text-2xl">{repos.length}</p>
          </div>
          <div className="bg-panel border border-border p-5">
            <p className="font-mono text-xs text-textMuted uppercase tracking-widest2 mb-1">Total Chunks</p>
            <p className="font-display text-2xl">{totalChunks}</p>
          </div>
          <div className="bg-panel border border-border p-5">
            <p className="font-mono text-xs text-textMuted uppercase tracking-widest2 mb-1">
              Overall Embedding Coverage
            </p>
            <p className="font-display text-2xl text-accentSoft">{overallPercent}%</p>
          </div>
        </div>

        {loading ? (
          <p className="font-mono text-xs text-textMuted animate-pulse">Loading indexing status...</p>
        ) : repos.length === 0 ? (
          <p className="font-mono text-xs text-textMuted">No repositories yet.</p>
        ) : (
          <div className="border border-border">
            <div className="grid grid-cols-6 gap-4 px-4 py-3 border-b border-border bg-panel font-mono text-xs text-textMuted uppercase tracking-widest2">
              <span className="col-span-2">Repository</span>
              <span>Status</span>
              <span>Files</span>
              <span>Chunks</span>
              <span>Embedding</span>
            </div>
            {repos.map((repo) => (
              <IndexingRow key={repo.repoId} repo={repo} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default IndexingPage;