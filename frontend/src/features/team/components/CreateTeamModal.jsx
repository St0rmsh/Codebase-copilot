import { useState } from "react";
import { useDispatch } from "react-redux";
import { useTeams } from "../hooks/useTeams";
import { showToast } from "../../../app/toastSlice";

const CreateTeamModal = ({ onClose }) => {
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const { create } = useTeams();
  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const result = await create(name);
    setSaving(false);
    if (result.success) {
      dispatch(showToast("Team created.", "success"));
      onClose();
    } else {
      dispatch(showToast(result.message || "Failed to create team.", "error"));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-panel border border-border w-full max-w-md p-6">
        <h2 className="font-mono text-sm tracking-widest2 uppercase text-accentSoft mb-4">
          Create Team
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Team name"
            className="w-full bg-transparent border border-border px-3 py-2 font-mono text-sm placeholder:text-textMuted outline-none focus:border-accent"
            required
          />
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-accent hover:bg-accent/90 disabled:opacity-50 text-white font-mono text-xs tracking-widest2 uppercase py-2.5"
            >
              {saving ? "Creating..." : "Create"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-border text-textMuted hover:text-white font-mono text-xs tracking-widest2 uppercase py-2.5"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTeamModal;