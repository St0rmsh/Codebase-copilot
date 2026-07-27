import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../features/Auth/state/authSlice";

const RegisterPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(registerUser({ name, email, password }));
    if (result.requiresVerification) navigate("/verify-otp");
  };

  const handleGithubSignIn = () => {
    window.location.href = "/api/github/signin";
  };

  return (
    <div className="min-h-screen bg-base flex flex-col items-center justify-center px-4">
      <h1 className="font-display text-4xl tracking-wide text-center mb-1">CODEBASE COPILOT</h1>
      <p className="font-mono text-xs tracking-widest2 text-textMuted uppercase mb-10">
        Autonomous Engineering
      </p>

      <div className="w-full max-w-md bg-panel border border-border p-8">
        <div className="flex items-center gap-2 pb-4 border-b border-border mb-6">
          <span className="text-accent">▣</span>
          <span className="font-mono text-sm tracking-widest2 uppercase">Create Access</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block font-mono text-xs tracking-widest2 text-accentSoft uppercase mb-2">
              Name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full Name"
              className="w-full bg-transparent border border-border px-4 py-3 font-mono text-sm placeholder:text-textMuted focus:border-accent outline-none"
              required
            />
          </div>

          <div>
            <label className="block font-mono text-xs tracking-widest2 text-accentSoft uppercase mb-2">
              Developer Identity
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="USR_ID_UUID"
              className="w-full bg-transparent border border-border px-4 py-3 font-mono text-sm placeholder:text-textMuted focus:border-accent outline-none"
              required
            />
          </div>

          <div>
            <label className="block font-mono text-xs tracking-widest2 text-accentSoft uppercase mb-2">
              Secret Key
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••••"
              className="w-full bg-transparent border border-border px-4 py-3 font-mono text-sm placeholder:text-textMuted focus:border-accent outline-none"
              required
              minLength={6}
            />
          </div>

          {error && <p className="font-mono text-xs text-accent">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent hover:bg-accent/90 disabled:opacity-50 text-white font-mono text-sm tracking-widest2 uppercase py-3.5 transition"
          >
            {loading ? "Creating..." : "Create Account"}
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

        <p className="text-center font-mono text-xs text-textMuted mt-6">
          Already have access?{" "}
          <Link to="/login" className="text-accentSoft hover:text-accent">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;