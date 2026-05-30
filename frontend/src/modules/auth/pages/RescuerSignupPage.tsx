import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "../apis/auth.api";
import type { RescuerType } from "../types/auth.types";

type Track = "Volunteer" | "OfficialTeam" | null;

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

function BuildingIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M9 3v18M15 3v18M3 9h18M3 15h18" />
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

// Step 1 — Track selection
function TrackSelector({ onSelect }: { onSelect: (t: Track) => void }) {
  return (
    <div>
      <p className="text-gray-800 font-bold text-xl mb-1">Join as a Rescuer</p>
      <p className="text-gray-500 text-[13px] mb-6">Choose the type that best describes you</p>

      {/* Volunteer */}
      <button
        onClick={() => onSelect("Volunteer")}
        className="w-full group bg-gray-50 hover:bg-green-50 border-2 border-gray-200 hover:border-green-400 rounded-2xl px-4 py-4 flex items-center gap-4 transition-all cursor-pointer mb-3 text-left"
      >
        <div className="w-12 h-12 bg-green-100 group-hover:bg-green-500 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors">
          <PersonIcon className="w-5 h-5 text-green-600 group-hover:text-white transition-colors" />
        </div>
        <div className="flex-1">
          <p className="font-bold text-gray-900 text-[14px]">Volunteer</p>
          <p className="text-gray-500 text-[12px] mt-0.5">Individual helping in the field — instant access after signup</p>
        </div>
        <ArrowRightIcon className="w-4 h-4 text-gray-300 group-hover:text-green-500 transition-colors flex-shrink-0" />
      </button>

      {/* Official Team */}
      <button
        onClick={() => onSelect("OfficialTeam")}
        className="w-full group bg-gray-50 hover:bg-blue-50 border-2 border-gray-200 hover:border-blue-400 rounded-2xl px-4 py-4 flex items-center gap-4 transition-all cursor-pointer text-left"
      >
        <div className="w-12 h-12 bg-blue-100 group-hover:bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors">
          <BuildingIcon className="w-5 h-5 text-blue-500 group-hover:text-white transition-colors" />
        </div>
        <div className="flex-1">
          <p className="font-bold text-gray-900 text-[14px]">Official Rescue Team</p>
          <p className="text-gray-500 text-[12px] mt-0.5">Private company or government agency — requires admin approval</p>
        </div>
        <ArrowRightIcon className="w-4 h-4 text-gray-300 group-hover:text-blue-500 transition-colors flex-shrink-0" />
      </button>
    </div>
  );
}

// Step 2 — Form
function SignupForm({
  track,
  onBack,
}: {
  track: Exclude<Track, null>;
  onBack: () => void;
}) {
  const navigate = useNavigate();
  const isVolunteer = track === "Volunteer";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [rescuerType, setRescuerType] = useState<RescuerType>("PrivateTeam");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async () => {
    if (!username.trim() || !password) {
      setError("Username and password are required.");
      return;
    }
    if (!isVolunteer && !name.trim()) {
      setError("Organization name is required.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await register({
        username: username.trim(),
        password,
        role: isVolunteer ? "Volunteer" : "RescueTeam",
        name: name.trim() || undefined,
        rescuerType: isVolunteer ? undefined : rescuerType,
      });
      setDone(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Registration failed.";
      setError(msg.includes("409") || msg.toLowerCase().includes("taken") ? "That username is already taken." : msg);
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="text-center py-4">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckIcon className="w-8 h-8 text-green-600" />
        </div>
        <p className="font-bold text-gray-900 text-xl mb-2">
          {isVolunteer ? "You're registered!" : "Application Submitted!"}
        </p>
        <p className="text-gray-500 text-[13px] mb-6 leading-relaxed">
          {isVolunteer
            ? "Your volunteer account is ready. You can log in now."
            : "Your application is pending admin approval. You'll be able to log in once approved."}
        </p>
        <button
          onClick={() => navigate("/staff/rescuer/login")}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3.5 rounded-2xl text-[14px] transition-colors cursor-pointer"
        >
          Go to Login
        </button>
      </div>
    );
  }

  const accentRing = isVolunteer ? "focus:ring-green-400" : "focus:ring-blue-400";

  return (
    <div>
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-gray-400 hover:text-gray-600 text-sm mb-4 transition-colors cursor-pointer"
      >
        <ArrowLeftIcon className="w-4 h-4" />
        Choose different type
      </button>

      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold mb-4 ${isVolunteer ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}>
        {isVolunteer ? "Volunteer" : "Official Rescue Team"}
      </div>

      {/* Username */}
      <div className="mb-3">
        <label className="block font-semibold text-gray-900 text-[14px] mb-2">Username</label>
        <div className="relative">
          <PersonIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Choose a username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={`w-full bg-gray-50 border border-gray-200 rounded-2xl py-3.5 pl-12 pr-4 text-gray-800 placeholder-gray-400 text-[14px] focus:outline-none focus:ring-2 ${accentRing} focus:border-transparent transition-shadow`}
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
            className={`w-full bg-gray-50 border border-gray-200 rounded-2xl py-3.5 pl-12 pr-4 text-gray-800 placeholder-gray-400 text-[14px] focus:outline-none focus:ring-2 ${accentRing} focus:border-transparent transition-shadow`}
          />
        </div>
      </div>

      {/* Name / Org */}
      <div className="mb-3">
        <label className="block font-semibold text-gray-900 text-[14px] mb-2">
          {isVolunteer ? "Full Name (optional)" : "Organization Name"}
        </label>
        <div className="relative">
          <BuildingIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder={isVolunteer ? "Your full name" : "e.g. Red Cross Myanmar"}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={`w-full bg-gray-50 border border-gray-200 rounded-2xl py-3.5 pl-12 pr-4 text-gray-800 placeholder-gray-400 text-[14px] focus:outline-none focus:ring-2 ${accentRing} focus:border-transparent transition-shadow`}
          />
        </div>
      </div>

      {/* Rescuer type — official teams only */}
      {!isVolunteer && (
        <div className="mb-4">
          <label className="block font-semibold text-gray-900 text-[14px] mb-2">Organization Type</label>
          <div className="grid grid-cols-2 gap-3">
            {(["PrivateTeam", "GovernmentTeam"] as RescuerType[]).map((t) => (
              <button
                key={t}
                onClick={() => setRescuerType(t)}
                className={`rounded-2xl py-3 px-3 text-center text-[13px] font-semibold border-2 transition-all cursor-pointer ${
                  rescuerType === t
                    ? "bg-blue-50 border-blue-500 text-blue-700"
                    : "bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
              >
                {t === "PrivateTeam" ? "Private" : "Government"}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Pending notice for official teams */}
      {!isVolunteer && (
        <div className="mb-4 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-[12px] leading-relaxed">
          Your account will be reviewed by an admin before you can log in.
        </div>
      )}

      {error && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-[13px]">
          {error}
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={loading}
        className={`w-full font-semibold py-4 rounded-2xl flex items-center justify-center gap-2 transition-colors disabled:opacity-60 cursor-pointer text-white text-[15px] ${
          isVolunteer
            ? "bg-green-600 hover:bg-green-700 active:bg-green-800"
            : "bg-blue-600 hover:bg-blue-700 active:bg-blue-800"
        }`}
      >
        {loading ? "Creating account…" : isVolunteer ? "Create Account" : "Submit Application"}
      </button>
    </div>
  );
}

const RescuerSignupPage = () => {
  const navigate = useNavigate();
  const [track, setTrack] = useState<Track>(null);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center px-5 py-8">
      <div className="w-full max-w-[390px]">
        {track === null && (
          <button
            onClick={() => navigate("/staff/rescuer")}
            className="flex items-center gap-1.5 text-gray-400 hover:text-gray-600 text-sm mb-5 transition-colors cursor-pointer"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back
          </button>
        )}

        <div className="bg-white rounded-3xl shadow-xl px-6 pt-6 pb-7">
          {track === null ? (
            <TrackSelector onSelect={setTrack} />
          ) : (
            <SignupForm track={track} onBack={() => setTrack(null)} />
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
