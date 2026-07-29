import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { disconnectGithubRequest, deleteAccountRequest, deleteRepoRequest } from "../services/settingsService";
import { fetchCurrentUser, logoutUser } from "../state/authSlice";
import { showToast } from "../../../App/toastSlice";
import { useRepos } from "../../repo/hooks/useRepos";

const DangerZone = () => {
  const { user } = useSelector((state) => state.auth);
  const { repos, refetch } = useRepos();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [repoToDelete, setRepoToDelete] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleDisconnectGithub = async () => {
    try {
      await disconnectGithubRequest();
      dispatch(fetchCurrentUser());
      dispatch(showToast("Github disconnected.", "success"));
    } catch {
      dispatch(showToast("Failed to disconnect Github.", "error"));
    }
  };

  const confirmDeleteRepo = async (repoId, name) => {
    try {
      await deleteRepoRequest(repoId);
      dispatch(showToast(`${name} deleted.`, "success"));
      setRepoToDelete(null);
      refetch();
    } catch {
      dispatch(showToast("Failed to delete repository.", "error"));
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    try {
      await deleteAccountRequest();
      dispatch(logoutUser());
      navigate("/login");
    } catch {
      dispatch(showToast("Failed to delete account.", "error"));
    }
  };

  return (
    <div className="border border-accent/30">
      <div className="px-6 py-4 border-b border-accent/30 bg-accent/5">
        <h3 className="font-mono text-sm tracking-widest2 uppercase text-accent flex items-center gap-2">
          <span>⚠</span> Danger Zone
        </h3>
        <p className="font-mono text-xs text-textMuted mt-1">
          These actions are irreversible. Proceed with caution.
        </p>
      </div>

      <div className="divide-y divide-border">
        {user?.githubUsername && (
          <div className="flex justify-between items-center px-6 py-5">
            <div>
              <p className="font-mono text-sm text-white">Disconnect Github</p>
              <p className="font-mono text-xs text-textMuted mt-1">
                Connected as <span className="text-accentSoft">{user.githubUsername}</span>. Repos already
                ingested will remain accessible.
              </p>
            </div>
            <button
              onClick={handleDisconnectGithub}
              className="font-mono text-xs uppercase tracking-widest2 border border-border text-textMuted hover:border-accent hover:text-accent px-4 py-2 transition shrink-0 ml-4"
            >
              Disconnect
            </button>
          </div>
        )}

        {repos.length > 0 && (
          <div className="px-6 py-5">
            <p className="font-mono text-sm text-white mb-1">Delete a Repository</p>
            <p className="font-mono text-xs text-textMuted mb-4">
              Permanently removes the repo, its chunks, embeddings, and chat history.
            </p>
            <div className="space-y-2">
              {repos.map((repo) => (
                <div
                  key={repo._id}
                  className="flex justify-between items-center bg-panel border border-border px-4 py-2.5"
                >
                  <span className="font-mono text-xs text-textMuted truncate">{repo.fullName}</span>
                  {repoToDelete === repo._id ? (
                    <div className="flex gap-2 shrink-0 ml-3">
                      <button
                        onClick={() => confirmDeleteRepo(repo._id, repo.name)}
                        className="font-mono text-xs text-accent hover:text-white bg-accent/10 hover:bg-accent px-3 py-1 transition"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setRepoToDelete(null)}
                        className="font-mono text-xs text-textMuted hover:text-white px-3 py-1"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setRepoToDelete(repo._id)}
                      className="font-mono text-xs text-textMuted hover:text-accent shrink-0 ml-3"
                    >
                      Delete
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-between items-center px-6 py-5">
          <div>
            <p className="font-mono text-sm text-white">Delete Account</p>
            <p className="font-mono text-xs text-textMuted mt-1">
              Permanently deletes your account, all repositories, and chat history. This cannot be undone.
            </p>
          </div>
          <button
            onClick={handleDeleteAccount}
            className={`font-mono text-xs uppercase tracking-widest2 px-4 py-2 border transition shrink-0 ml-4 ${
              confirmDelete
                ? "bg-accent text-white border-accent"
                : "border-accent text-accent hover:bg-accent hover:text-white"
            }`}
          >
            {confirmDelete ? "Confirm Delete" : "Delete Account"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DangerZone;