import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { verifyOtp, resendOtp } from "../features/Auth/state/authSlice";

const OtpVerifyPage = () => {
  const [otp, setOtp] = useState("");
  const [resendMsg, setResendMsg] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, pendingVerificationUserId } = useSelector((state) => state.auth);

  if (!pendingVerificationUserId) {
    navigate("/login");
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(verifyOtp({ userId: pendingVerificationUserId, otp }));
    if (result.success) navigate("/dashboard");
  };

  const handleResend = async () => {
    setResendMsg("");
    const result = await dispatch(resendOtp(pendingVerificationUserId));
    setResendMsg(result.success ? "Code resent — check your inbox." : result.message || "Failed to resend");
  };

  return (
    <div className="min-h-screen bg-base flex flex-col items-center justify-center px-4">
      <h1 className="font-display text-4xl tracking-wide text-center mb-1">CODEBASE COPILOT</h1>
      <p className="font-mono text-xs tracking-widest2 text-textMuted uppercase mb-10">
        System Access Verification
      </p>

      <div className="w-full max-w-md bg-panel border border-border p-8">
        <div className="flex items-center gap-2 pb-4 border-b border-border mb-6">
          <span className="text-accent">⚡</span>
          <span className="font-mono text-sm tracking-widest2 uppercase">Enter Verification Code</span>
        </div>

        <p className="font-mono text-xs text-textMuted mb-6 leading-relaxed">
          We sent a 6-digit code to your email. Enter it below to complete access.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="000000"
            maxLength={6}
            className="w-full bg-transparent border border-border px-4 py-3 font-mono text-2xl tracking-[0.5em] text-center placeholder:text-textMuted focus:border-accent outline-none"
            required
          />

          {error && <p className="font-mono text-xs text-accent">{error}</p>}
          {resendMsg && <p className="font-mono text-xs text-accentSoft">{resendMsg}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent hover:bg-accent/90 disabled:opacity-50 text-white font-mono text-sm tracking-widest2 uppercase py-3.5 transition"
          >
            {loading ? "Verifying..." : "Verify"}
          </button>
        </form>

        <button
          onClick={handleResend}
          className="w-full text-center font-mono text-xs text-textMuted hover:text-white mt-6"
        >
          Resend Code
        </button>
      </div>
    </div>
  );
};

export default OtpVerifyPage;