import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateProfileRequest } from "../services/settingsService";
import { showToast } from "../../../App/toastSlice";
import { fetchCurrentUser } from "../state/authSlice";
import Button from "../../../components/Button";

const ProfileSection = () => {
  const { user } = useSelector((state) => state.auth);
  const [name, setName] = useState(user?.name || "");
  const [saving, setSaving] = useState(false);
  const dispatch = useDispatch();

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfileRequest(name);
      dispatch(fetchCurrentUser());
      dispatch(showToast("Profile updated.", "success"));
    } catch (err) {
      dispatch(showToast(err.response?.data?.message || "Failed to update profile.", "error"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-panel border border-border p-6 mb-6">
      <h3 className="font-mono text-sm tracking-widest2 uppercase text-accentSoft mb-4">Profile</h3>
      <div className="space-y-4">
        <div>
          <label className="block font-mono text-xs text-textMuted uppercase tracking-widest2 mb-2">
            Name
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-transparent border border-border px-3 py-2 font-mono text-sm outline-none focus:border-accent"
          />
        </div>
        <div>
          <label className="block font-mono text-xs text-textMuted uppercase tracking-widest2 mb-2">
            Email
          </label>
          <input
            value={user?.email || ""}
            disabled
            className="w-full bg-transparent border border-border px-3 py-2 font-mono text-sm text-textMuted opacity-60"
          />
        </div>
        <Button variant="primary" onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
};

export default ProfileSection;