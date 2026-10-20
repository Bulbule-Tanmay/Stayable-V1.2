import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import StayableLogo from "../../components/StayableLogo";
import { signInWithEmail } from "../../lib/auth";
import { useAuth } from "../AuthContext";

export default function AdminLogin() {
  const navigate = useNavigate();
  const { user, profile, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user && profile?.role === "admin") {
      navigate("/admin/dashboard");
    }
  }, [user, profile, loading, navigate]);

  const handleLogin = async () => {
    if (!email || !password) return;
    setSubmitting(true);
    setError("");
    try {
      await signInWithEmail(email, password);
    } catch (e: any) {
      setError(e.message ?? "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <StayableLogo className="h-9 w-auto brightness-0 invert mb-4" />
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
            Super Admin Access
          </span>
        </div>

        <div className="bg-[#1a1d27] rounded-3xl p-7 border border-white/5 shadow-2xl">
          <h2 className="font-display text-xl font-bold text-white mb-1">Admin Login</h2>
          <p className="text-xs text-white/40 mb-6">Sign in with your admin account credentials</p>

          <div className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-semibold text-white/50 mb-1.5 block">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                placeholder="admin@stayable.in"
                className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-white/50 mb-1.5 block">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(""); }}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                placeholder="••••••••"
                className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            {error && <p className="text-xs text-red-400">{error}</p>}

            <button
              onClick={handleLogin}
              disabled={!email || !password || submitting}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-bold text-sm disabled:opacity-40 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">lock_open</span>
                  Access Admin Panel
                </>
              )}
            </button>
          </div>
        </div>

        <button onClick={() => navigate("/")} className="block w-full text-center text-xs text-white/30 hover:text-white/50 mt-4 transition-colors">
          ← Back to Home
        </button>
      </div>
    </div>
  );
}
