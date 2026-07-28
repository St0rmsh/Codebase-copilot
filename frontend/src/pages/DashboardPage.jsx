import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useSearchParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import RepoCard from "../features/repo/components/RepoCard";
import GithubRepoPicker from "../features/Github/components/GithubRepoPicker";
import GithubConnectPrompt from "../features/Github/components/GithubConnectPrompt";
import Button from "../components/Button";
import UserMenu from "../components/UserMenu";
import { useRepos } from "../features/repo/hooks/useRepos";
import { fetchCurrentUser } from "../features/Auth/state/authSlice";
import { showToast } from "../App/toastSlice";

const DashboardPage = () => {
  const { repos, loading, refetch } = useRepos();
  const { user } = useSelector((state) => state.auth);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useDispatch();

  useEffect(() => {
    const githubStatus = searchParams.get("github");
    if (githubStatus === "connected") {
      dispatch(fetchCurrentUser());
      dispatch(showToast("Github account connected successfully.", "success"));
      setSearchParams({});
    } else if (githubStatus === "error") {
      dispatch(showToast("Failed to connect Github account. Please try again.", "error"));
      setSearchParams({});
    }
  }, [searchParams, dispatch, setSearchParams]);

  const totalModules = repos.reduce((sum, r) => sum + (r.fileCount || 0), 0);

  const handleSync = () => {
    refetch();
    dispatch(showToast("Repositories synced.", "success", 2500));
  };

  return (
    <div className="flex min-h-screen bg-base">
      <Sidebar />

      <main className="flex-1 px-10 py-8">
        <div className="flex justify-between items-center mb-10 font-mono text-xs text-textMuted tracking-widest2 uppercase">
          <input
            placeholder="Search resources..."
            className="bg-transparent outline-none placeholder:text-textMuted"
          />
          <div className="flex items-center gap-6">
            <button onClick={handleSync} className="hover:text-white">Sync</button>
            <Button variant="outline" className="py-2 px-4" disabled>Deploy</Button>
            <UserMenu />
          </div>
        </div>

        <div className="flex justify-between items-start mb-12">
          <div>
            <h1 className="font-display text-4xl">
              SYSTEM HEALTH: <span className="text-accentSoft">OPTIMIZED</span>
            </h1>
            <p className="font-mono text-xs text-textMuted tracking-widest2 uppercase mt-2">
              Real-Time Architecture Analysis Active
            </p>
          </div>
          <div className="text-right">
            <p className="font-mono text-xs text-textMuted tracking-widest2 uppercase">
              Total Ingested Data
            </p>
            <p className="font-display text-3xl mt-1">
              {(totalModules / 1000).toFixed(2)} <span className="text-textMuted text-lg">K</span>
            </p>
          </div>
        </div>

        {!user?.githubUsername && <GithubConnectPrompt />}

        <div className="flex justify-between items-center mb-6">
          <h2 className="font-display text-xl uppercase">Active Repositories</h2>
          <Button
            variant="primary"
            onClick={() => setPickerOpen(true)}
            disabled={!user?.githubUsername}
          >
            + Connect Repository
          </Button>
        </div>

        {loading ? (
          <p className="font-mono text-xs text-textMuted">Loading repositories...</p>
        ) : repos.length === 0 ? (
          <p className="font-mono text-xs text-textMuted">
            No repositories connected yet. Connect one to get started.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {repos.map((repo) => (
              <RepoCard key={repo._id} repo={repo} />
            ))}
          </div>
        )}
      </main>

      {pickerOpen && <GithubRepoPicker onClose={() => setPickerOpen(false)} />}
    </div>
  );
};

export default DashboardPage;