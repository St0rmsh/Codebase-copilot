import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { useEffect } from "react";
import { loginUser } from "../features/Auth/state/authSlice";
import { showToast } from "../App/toastSlice";

const errorMessages = {
  missing_code: "GitHub authorization was cancelled or failed.",
  github_signin_failed: "Github sign-in failed. Please try again.",
};

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { loading, error } = useSelector((state) => state.auth);

  useEffect(() => {
    const errCode = searchParams.get("error");
    if (errCode) {
      dispatch(showToast(errorMessages[errCode] || "Something went wrong.", "error"));
      setSearchParams({});
    }
  }, [searchParams, dispatch, setSearchParams]);

  useEffect(() => {
    if (error) dispatch(showToast(error, "error"));
  }, [error, dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(loginUser({ email, password }));
    if (result.success) navigate("/dashboard");
    else if (result.requiresVerification) navigate("/verify-otp");
  };

  const handleGithubSignIn = () => {
    window.location.href = "/api/github/signin";
  };

  return (
    <div className="min-h-screen bg-base relative overflow-hidden flex flex-col">
      <div className="flex justify-between items-center px-8 py-6 text-xs font-mono text-textMuted tracking-widest2">
        <div className="border-b border-accent pb-1">ST_AUTH_V4.2</div>
        <div className="text-right">
          SECURE ACCESS PROTOCOL
          <br />
          ESTABLISHED
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <h1 className="font-display text-4xl md:text-5xl tracking-wide text-center">
          CODEBASE COPILOT
        </h1>
        <div className="flex items-center gap-3 mt-3 mb-10">
          <span className="w-8 h-px bg-accent" />
          <span className="font-mono text-xs tracking-widest2 text-textMuted uppercase">
            Autonomous Engineering
          </span>
          <span className="w-8 h-px bg-accent" />
        </div>

        <div className="w-full max-w-md bg-panel border border-border p-8">
          <div className="flex items-center gap-2 pb-4 border-b border-border mb-6">
            <span className="text-accent">▣</span>
            <span className="font-mono text-sm tracking-widest2 uppercase">System Access</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block font-mono text-xs tracking-widest2 text-accentSoft uppercase mb-2">
                Developer Identity
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="USR_ID_UUID"
                className="w-full bg-transparent border border-border px-4 py-3 font-mono text-sm text-white placeholder:text-textMuted focus:border-accent outline-none transition"
                required
              />
            </div>

            <div>
              <label className="block font-mono text-xs tracking-widest2 text-accentSoft uppercase mb-2">
                Secret Key
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••••"
                  className="w-full bg-transparent border border-border px-4 py-3 font-mono text-sm text-white placeholder:text-textMuted focus:border-accent outline-none transition pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-textMuted hover:text-white"
                >
                  {showPassword ? "🙈" : "👁"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent hover:bg-accent/90 disabled:opacity-50 text-white font-mono text-sm tracking-widest2 uppercase py-3.5 transition"
            >
              {loading ? "Authenticating..." : "Start Indexing"}
            </button>
          </form>

          <div className="flex items-center gap-4 my-6">
            <span className="flex-1 h-px bg-border" />
            <span className="font-mono text-xs text-textMuted">OR</span>
            <span className="flex-1 h-px bg-border" />
          </div>

          <button
            onClick={handleGithubSignIn}
            className="w-full border border-border hover:border-white/50 text-white font-mono text-sm tracking-widest2 uppercase py-3.5 transition flex items-center justify-center gap-2"
          >
            <span>⌥</span> Continue With Github
          </button>

          <div className="flex justify-between mt-6 font-mono text-xs text-textMuted">
            <Link to="/register" className="hover:text-white">Create Account</Link>
            <button className="hover:text-white">Legal Compliance</button>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center px-8 py-5 font-mono text-xs text-textMuted">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block" />
          1,024 ACTIVE
        </div>
        <div>AES-256-GCM / RSA-4096</div>
        <div>14.2 MS (OPTIMAL)</div>
        <div>© 2026 SYSTEM_CORE // ALL RIGHTS RESERVED</div>
      </div>
    </div>
  );
};

export default LoginPage;