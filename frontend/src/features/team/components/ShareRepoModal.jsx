import { useState } from "react";
import { useDispatch } from "react-redux";
import { useTeams } from "../hooks/useTeams";
import { shareRepoWithTeamRequest } from "../services/teamService";
import { showToast } from "../../../app/toastSlice";

const ShareRepoModal = ({ repoId, repoName, onClose, onShared }) => {
  const { teams, loading } = useTeams();
  const [sharing, setSharing] = useState(null);
  const dispatch = useDispatch();

  const handleShare = async (teamId, teamName) => {
    setSharing(teamId);
    try {
      await shareRepoWithTeamRequest(repoId, teamId);
      dispatch(showToast(`${repoName} shared with ${teamName}.`, "success"));
      onShared?.();
      onClose();
    } catch {
      dispatch(showToast("Failed to share repository.", "error"));
    } finally {
      setSharing(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-panel border border-border w-full max-w-md">
        <div className="flex justify-between items-center px-6 py-4 border-b border-border">
          <h2 className="font-mono text-sm tracking-widest2 uppercase text-accentSoft">
            Share Repository
          </h2>
          <button onClick={onClose} className="text-textMuted hover:text-white">✕</button>
        </div>

        {loading ? (
          <p className="font-mono text-xs text-textMuted p-6">Loading teams...</p>
        ) : teams.length === 0 ? (
          <p className="font-mono text-xs text-textMuted p-6">
            You're not part of any team yet. Create or join one first.
          </p>
        ) : (
          <div className="divide-y divide-border">
            {teams.map((team) => (
              <button
                key={team._id}
                onClick={() => handleShare(team._id, team.name)}
                disabled={sharing !== null}
                className="w-full text-left px-6 py-4 hover:bg-base transition flex justify-between items-center disabled:opacity-50"
              >
                <span className="font-mono text-sm">{team.name}</span>
                {sharing === team._id && (
                  <span className="font-mono text-xs text-accent">Sharing...</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ShareRepoModal;