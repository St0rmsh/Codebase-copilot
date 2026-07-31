import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import UserMenu from "../components/UserMenu";
import ExploreRepoForm from "../features/repo/components/ExploreRepoForm";
import PublicRepoCard from "../features/repo/components/PublicRepoCard";
import { fetchPublicRepos } from "../features/repo/services/exploreService";

const ExplorePage = () => {
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPublicRepos()
      .then((data) => setRepos(data.repos))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex min-h-screen bg-base">
      <Sidebar />
      <main className="flex-1 px-10 py-8">
        <div className="flex justify-end mb-6">
          <UserMenu />
        </div>

        <h1 className="font-display text-3xl mb-2">EXPLORE</h1>
        <p className="font-mono text-xs text-textMuted tracking-widest2 uppercase mb-6">
          Browse and chat with any public Github repository
        </p>

        <div className="mb-10 max-w-xl">
          <ExploreRepoForm />
        </div>

        <h2 className="font-mono text-sm text-accentSoft tracking-widest2 uppercase mb-4">
          Recently Explored
        </h2>

        {loading ? (
          <p className="font-mono text-xs text-textMuted animate-pulse">Loading...</p>
        ) : repos.length === 0 ? (
          <p className="font-mono text-xs text-textMuted">
            No public repositories explored yet. Be the first — paste a Github URL above.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {repos.map((repo) => (
              <PublicRepoCard key={repo._id} repo={repo} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default ExplorePage;