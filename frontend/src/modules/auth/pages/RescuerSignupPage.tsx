import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "../apis/auth.api";

function ArrowLeftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
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

function TagIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
      <circle cx="7" cy="7" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

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

const RescuerSignupPage = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async () => {
    if (!username.trim() || !password) {
      setError("Username and password are required.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await register({ username: username.trim(), password, name: name.trim() || undefined });
      setDone(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Registration failed.";
      setError(msg.toLowerCase().includes("taken") ? "That username is already taken." : msg);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center px-5 py-8">
      <div className="w-full max-w-[390px]">
        {!done && (
          <button
            onClick={() => navigate("/staff/rescuer")}
            className="flex items-center gap-1.5 text-gray-400 hover:text-gray-600 text-sm mb-5 transition-colors cursor-pointer"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back
          </button>
        )}

        <div className="bg-white rounded-3xl shadow-xl px-6 pt-6 pb-7">
          {done ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckIcon className="w-8 h-8 text-green-600" />
              </div>
              <p className="font-bold text-gray-900 text-xl mb-2">You're registered!</p>
              <p className="text-gray-500 text-[13px] mb-6 leading-relaxed">
                Your rescuer account is ready. You can log in now.
              </p>
              <button
                onClick={() => navigate("/staff/rescuer/login")}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3.5 rounded-2xl text-[14px] transition-colors cursor-pointer"
              >
                Go to Login
              </button>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <AmbulanceIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-lg">Create Account</p>
                  <p className="text-gray-400 text-[13px]">Join the rescue effort</p>
                </div>
              </div>

              {/* Username */}
              <div className="mb-3">
                <label className="block font-semibold text-gray-900 text-[14px] mb-2">Username</label>
                <div className="relative">
                  <PersonIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Choose a username (min. 3 chars)"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3.5 pl-12 pr-4 text-gray-800 placeholder-gray-400 text-[14px] focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-shadow"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="mb-3">
                <label className="block font-semibold text-gray-900 text-[14px] mb-2">Password</label>
                <div className="relative">
                  <LockIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    placeholder="Min. 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3.5 pl-12 pr-4 text-gray-800 placeholder-gray-400 text-[14px] focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-shadow"
                  />
                </div>
              </div>

              {/* Name (optional) */}
              <div className="mb-5">
                <label className="block font-semibold text-gray-900 text-[14px] mb-2">
                  Name <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <div className="relative">
                  <TagIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Your name or team name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
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
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 active:bg-green-800 disabled:opacity-60 text-white font-semibold py-4 rounded-2xl text-[15px] transition-colors cursor-pointer"
              >
                {loading ? "Creating account…" : "Create Account"}
              </button>
            </>
          )}
        </div>

        <p className="text-center text-gray-400 text-[11px] mt-5">
          © 2026 Flood Disaster Management System
        </p>
      </div>
    </div>
  );
};

export default RescuerSignupPage;
