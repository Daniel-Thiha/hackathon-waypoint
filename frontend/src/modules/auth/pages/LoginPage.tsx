import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { login } from "../apis/auth.api";
import type { UserRole } from "../types/auth.types";

function PersonIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
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

function LockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
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

const LoginPage = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, setUser } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole>("Admin");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      navigate("/map", { replace: true });
    }
  }, [user, authLoading, navigate]);

  const handleLogin = async () => {
    if (!username.trim() || !password) {
      setError("Please enter your username and password.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const loggedInUser = await login(username.trim(), password, selectedRole);
      setUser(loggedInUser);
      navigate("/map", { replace: true });
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Login failed. Please try again.";
      setError(
        msg.includes("Invalid credentials")
          ? "Incorrect username or password."
          : msg
      );
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
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center px-5 py-8">
      <div className="w-full max-w-[390px] rounded-3xl shadow-xl overflow-hidden">

        {/* Top section — warm cream background */}
        <div className="bg-[#FFF5EE] px-6 pt-6 pb-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-orange-500" />
            <span className="text-orange-600 font-bold text-xs uppercase tracking-widest">
              Emergency Access
            </span>
          </div>

          <button
            onClick={() => navigate("/map")}
            className="w-full bg-orange-500 hover:bg-orange-600 active:bg-orange-700 rounded-2xl px-4 py-4 flex items-center gap-3 text-white transition-colors cursor-pointer"
          >
            <div className="bg-orange-600/50 rounded-xl p-2.5 flex-shrink-0">
              <PersonIcon className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 text-left">
              <div className="font-bold text-[17px] leading-tight">I Need Help</div>
              <div className="text-orange-100 text-[13px] mt-0.5">
                Access survivor portal instantly
              </div>
            </div>
            <ArrowRightIcon className="w-5 h-5 text-white flex-shrink-0" />
          </button>
        </div>

        {/* Bottom section — white background */}
        <div className="bg-white px-6 pt-2 pb-6">
          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-gray-400 text-sm">Staff Portal</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Role Selection */}
          <p className="font-bold text-gray-900 text-[15px] mb-3">Select Role</p>
          <div className="grid grid-cols-2 gap-3 mb-5">
            {/* Admin Card */}
            <button
              onClick={() => setSelectedRole("Admin")}
              className={`relative rounded-2xl p-4 text-center transition-all cursor-pointer ${
                selectedRole === "Admin"
                  ? "bg-blue-50 border-2 border-blue-500"
                  : "bg-gray-50 border-2 border-gray-200 hover:border-gray-300"
              }`}
            >
              {selectedRole === "Admin" && (
                <div className="absolute top-2 right-2 bg-blue-500 rounded-full w-5 h-5 flex items-center justify-center">
                  <CheckIcon className="w-3 h-3 text-white" />
                </div>
              )}
              <div
                className={`mx-auto mb-2 w-11 h-11 rounded-xl flex items-center justify-center ${
                  selectedRole === "Admin" ? "bg-blue-500" : "bg-gray-100"
                }`}
              >
                <ShieldIcon
                  className={`w-5 h-5 ${
                    selectedRole === "Admin" ? "text-white" : "text-gray-400"
                  }`}
                />
              </div>
              <p className="font-bold text-gray-900 text-[13px]">Admin</p>
              <p className="text-gray-500 text-[11px] mt-1 leading-snug">
                Manage forecasts and safe places
              </p>
            </button>

            {/* Rescue Team Card */}
            <button
              onClick={() => setSelectedRole("RescueTeam")}
              className={`relative rounded-2xl p-4 text-center transition-all cursor-pointer ${
                selectedRole === "RescueTeam"
                  ? "bg-green-50 border-2 border-green-500"
                  : "bg-gray-50 border-2 border-gray-200 hover:border-gray-300"
              }`}
            >
              {selectedRole === "RescueTeam" && (
                <div className="absolute top-2 right-2 bg-green-500 rounded-full w-5 h-5 flex items-center justify-center">
                  <CheckIcon className="w-3 h-3 text-white" />
                </div>
              )}
              <div
                className={`mx-auto mb-2 w-11 h-11 rounded-xl flex items-center justify-center ${
                  selectedRole === "RescueTeam" ? "bg-green-500" : "bg-gray-100"
                }`}
              >
                <AmbulanceIcon
                  className={`w-5 h-5 ${
                    selectedRole === "RescueTeam" ? "text-white" : "text-gray-400"
                  }`}
                />
              </div>
              <p className="font-bold text-gray-900 text-[13px]">Rescue Team</p>
              <p className="text-gray-500 text-[11px] mt-1 leading-snug">
                Respond to emergency requests
              </p>
            </button>
          </div>

          {/* Username */}
          <div className="mb-4">
            <label className="block font-semibold text-gray-900 text-[14px] mb-2">
              Username
            </label>
            <div className="relative">
              <PersonIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3.5 pl-12 pr-4 text-gray-800 placeholder-gray-400 text-[14px] focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-shadow"
              />
            </div>
          </div>

          {/* Password */}
          <div className="mb-5">
            <label className="block font-semibold text-gray-900 text-[14px] mb-2">
              Password
            </label>
            <div className="relative">
              <LockIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3.5 pl-12 pr-4 text-gray-800 placeholder-gray-400 text-[14px] focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-shadow"
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-[13px]">
              {error}
            </div>
          )}

          {/* Sign In Button */}
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-60 text-white font-semibold py-4 rounded-2xl flex items-center justify-center gap-2.5 transition-colors cursor-pointer"
          >
            <LoginArrowIcon className="w-5 h-5" />
            <span className="text-[15px]">Sign In to Dashboard</span>
            <ArrowRightIcon className="w-4 h-4" />
          </button>

          {/* Footer */}
          <p className="text-center text-gray-400 text-[11px] mt-6">
            © 2026 Flood Disaster Management System
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
