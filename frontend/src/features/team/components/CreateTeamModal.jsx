import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useTeams } from "../hooks/useTeams";
import { showToast } from "../../../app/toastSlice";

const CreateTeamModal = ({ onClose }) => {
  const [name, setName] = useState("");
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [expiresAt, setExpiresAt] = useState(null);
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const [step, setStep] = useState("name");
  const [saving, setSaving] = useState(false);
  const { create, verifyCreate } = useTeams();
  const dispatch = useDispatch();

  useEffect(() => {
    if (step !== "otp" || !expiresAt) return undefined;
    const timer = window.setInterval(() => {
      setSecondsRemaining(Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000)));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [expiresAt, step]);

  const setChallengeExpiry = (expiry) => {
    const timestamp = new Date(expiry).getTime();
    setExpiresAt(timestamp);
    setSecondsRemaining(Math.max(0, Math.ceil((timestamp - Date.now()) / 1000)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const result = step === "name" ? await create(name) : await verifyCreate(name, otp);
    setSaving(false);
    if (result.success) {
      if (step === "name") {
        setEmail(result.email);
        setChallengeExpiry(result.expiresAt);
        setStep("otp");
        dispatch(showToast("Verification code sent to your email.", "success"));
      } else {
        dispatch(showToast("Team created.", "success"));
        onClose();
      }
    } else {
      dispatch(showToast(result.message || (step === "name" ? "Failed to send verification code." : "Failed to create team."), "error"));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-panel border border-border w-full max-w-md p-6">
        <h2 className="font-mono text-sm tracking-widest2 uppercase text-accentSoft mb-4">Create Team</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {step === "name" ? (
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Team name"
              className="w-full bg-transparent border border-border px-3 py-2 font-mono text-sm placeholder:text-textMuted outline-none focus:border-accent"
              required
            />
          ) : (
            <>
              <p className="font-mono text-xs text-textMuted">Enter the 6-digit code sent to {email}.</p>
              <p role="timer" className={`font-mono text-xs ${secondsRemaining ? "text-textMuted" : "text-accent"}`}>
                {secondsRemaining
                  ? `Code expires in ${String(Math.floor(secondsRemaining / 60)).padStart(2, "0")}:${String(secondsRemaining % 60).padStart(2, "0")}`
                  : "Code expired. Resend a new code."}
              </p>
              <input
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="Verification code"
                inputMode="numeric"
                autoComplete="one-time-code"
                className="w-full bg-transparent border border-border px-3 py-2 font-mono text-sm placeholder:text-textMuted outline-none focus:border-accent"
                required
              />
              <button
                type="button"
                disabled={saving}
                onClick={async () => {
                  setSaving(true);
                  const result = await create(name);
                  setSaving(false);
                  if (result.success) {
                    setChallengeExpiry(result.expiresAt);
                    setOtp("");
                    dispatch(showToast("A new verification code was sent.", "success"));
                  }
                  else dispatch(showToast(result.message || "Failed to resend code.", "error"));
                }}
                className="font-mono text-xs text-accent hover:text-white disabled:opacity-50"
              >
                Resend code
              </button>
            </>
          )}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving || (step === "otp" && (secondsRemaining === 0 || otp.length !== 6))}
              className="flex-1 bg-accent hover:bg-accent/90 disabled:opacity-50 text-white font-mono text-xs tracking-widest2 uppercase py-2.5"
            >
              {saving ? "Please wait..." : step === "name" ? "Send Code" : "Verify & Create"}
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