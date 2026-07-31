import { useState } from "react";
import { useDispatch } from "react-redux";
import { enableAutoSync, disableAutoSync } from "../services/repoService";
import { showToast } from "../../../app/toastSlice";

const AutoSyncToggle = ({ repoId, initialEnabled = false }) => {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const handleToggle = async () => {
    setLoading(true);
    try {
      if (enabled) {
        await disableAutoSync(repoId);
        setEnabled(false);
        dispatch(showToast("Auto-sync disabled.", "success", 2500));
      } else {
        await enableAutoSync(repoId);
        setEnabled(true);
        dispatch(showToast("Auto-sync enabled — pushes to Github will trigger automatic re-indexing.", "success"));
      }
    } catch (err) {
      dispatch(showToast(err.response?.data?.message || "Failed to update auto-sync.", "error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="font-mono text-sm text-white">Auto-Sync</p>
        <p className="font-mono text-xs text-textMuted mt-0.5">
          Automatically re-index this repo when you push to Github
        </p>
      </div>
      <button
        onClick={handleToggle}
        disabled={loading}
        className={`relative w-11 h-6 transition-colors shrink-0 ml-4 disabled:opacity-50 ${
          enabled ? "bg-accent" : "bg-border"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white transition-transform ${
            enabled ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
};

export default AutoSyncToggle;