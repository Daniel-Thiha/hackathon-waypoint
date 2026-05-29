import { useNavigate } from "react-router-dom";

function WaveIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
      <path d="M2 12c.6.5 1.2 1 2.5 1C7 13 7 11 9.5 11c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
      <path d="M2 18c.6.5 1.2 1 2.5 1C7 19 7 17 9.5 17c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
    </svg>
  );
}

const SurvivorPortal = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#FFF5EE] flex flex-col items-center justify-center px-5 py-8">
      <div className="w-full max-w-[360px]">
        <div className="bg-white rounded-3xl p-8 shadow-sm text-center">
          <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <WaveIcon className="w-8 h-8 text-white" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Survivor Portal
          </h1>
          <p className="text-gray-500 text-sm mb-6 leading-relaxed">
            You have accessed the survivor portal. Help is on the way. Stay
            calm and follow the instructions provided by rescue teams.
          </p>

          <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 mb-6">
            <p className="text-orange-700 font-semibold text-sm mb-1">
              Emergency Hotline
            </p>
            <p className="text-orange-600 text-2xl font-bold">199</p>
            <p className="text-orange-500 text-xs mt-1">
              Available 24/7 — Flood Emergency Response
            </p>
          </div>

          <button
            onClick={() => navigate("/login")}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-600 font-medium py-3 rounded-2xl text-sm transition-colors cursor-pointer"
          >
            ← Back to Login
          </button>
        </div>

        <p className="text-center text-gray-400 text-[11px] mt-6">
          © 2026 Flood Disaster Management System
        </p>
      </div>
    </div>
  );
};

export default SurvivorPortal;
