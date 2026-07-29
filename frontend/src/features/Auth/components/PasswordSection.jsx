import { useState } from "react";
import { useDispatch } from "react-redux";
import { changePasswordRequest } from "../services/settingsService";
import { showToast } from "../../../App/toastSlice";
import Button from "../../../components/Button";

const PasswordSection = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await changePasswordRequest(currentPassword, newPassword);
      dispatch(showToast("Password updated.", "success"));
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      dispatch(showToast(err.response?.data?.message || "Failed to update password.", "error"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-panel border border-border p-6 mb-6">
      <h3 className="font-mono text-sm tracking-widest2 uppercase text-accentSoft mb-4">
        Change Password
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          placeholder="Current password"
          className="w-full bg-transparent border border-border px-3 py-2 font-mono text-sm placeholder:text-textMuted outline-none focus:border-accent"
          required
        />
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="New password"
          minLength={6}
          className="w-full bg-transparent border border-border px-3 py-2 font-mono text-sm placeholder:text-textMuted outline-none focus:border-accent"
          required
        />
        <Button variant="primary" type="submit" disabled={saving}>
          {saving ? "Updating..." : "Update Password"}
        </Button>
      </form>
    </div>
  );
};

export default PasswordSection;