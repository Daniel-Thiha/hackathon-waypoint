import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { login } from "../apis/auth.api";

function AmbulanceIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 17H2V7h10v10z" />
      <path d="M10 9h4l3 3v5h-7V9z" />
      <circle cx="5" cy="17" r="2" />
      <circle cx="15.5" cy="17" r="2" />
      <path d="M5 10v3M3.5 11.5h3" />
    </svg>
  );
}

function PersonIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function ArrowLeftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

function LoginArrowIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
      <polyline points="10 17 15 12 10 7" />
      <line x1="15" y1="12" x2="3" y2="12" />
    </svg>
  );
}

const RescuerLoginPage = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, setUser } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && user) navigate("/map", { replace: true });
  }, [user, authLoading, navigate]);

  const handleLogin = async () => {
    if (!username.trim() || !password) {
      setError("Please enter your username and password.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const loggedInUser = await login(username.trim(), password);
      if (loggedInUser.role === "Admin") {
        setError("This login is for rescue teams and volunteers only.");
        return;
      }
      setUser(loggedInUser);
      navigate("/map", { replace: true });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Login failed. Please try again.";
      setError(msg.includes("Invalid credentials") ? "Incorrect username or password." : msg);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleLogin();
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center px-5 py-8">
      <div className="w-full max-w-[390px]">
        <button
          onClick={() => navigate("/staff/rescuer")}
          className="flex items-center gap-1.5 text-gray-400 hover:text-gray-600 text-sm mb-5 transition-colors cursor-pointer"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Back
        </button>

        <div className="bg-white rounded-3xl shadow-xl px-6 pt-6 pb-7">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <AmbulanceIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-gray-900 text-lg">Rescuer Login</p>
              <p className="text-gray-400 text-[13px]">Volunteer or Official Team</p>
            </div>
          </div>

          <div className="mb-4">
            <label className="block font-semibold text-gray-900 text-[14px] mb-2">Username</label>
            <div className="relative">
              <PersonIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3.5 pl-12 pr-4 text-gray-800 placeholder-gray-400 text-[14px] focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-shadow"
              />
            </div>
          </div>

          <div className="mb-5">
            <label className="block font-semibold text-gray-900 text-[14px] mb-2">Password</label>
            <div className="relative">
              <LockIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3.5 pl-12 pr-4 text-gray-800 placeholder-gray-400 text-[14px] focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-shadow"
              />
            </div>
          </div>

          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-[13px]">
              {error}
            </div>
          )}

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 active:bg-green-800 disabled:opacity-60 text-white font-semibold py-4 rounded-2xl flex items-center justify-center gap-2.5 transition-colors cursor-pointer mb-4"
          >
            <LoginArrowIcon className="w-5 h-5" />
            <span className="text-[15px]">Log In</span>
            <ArrowRightIcon className="w-4 h-4" />
          </button>

          <p className="text-center text-[13px] text-gray-500">
            Don't have an account?{" "}
            <button
              onClick={() => navigate("/staff/rescuer/signup")}
              className="text-green-600 font-semibold hover:underline cursor-pointer"
            >
              Sign Up
            </button>
          </p>
        </div>

        <p className="text-center text-gray-400 text-[11px] mt-5">
          © 2026 Flood Disaster Management System
        </p>
      </div>
    </div>
  );
};

export default RescuerLoginPage;
