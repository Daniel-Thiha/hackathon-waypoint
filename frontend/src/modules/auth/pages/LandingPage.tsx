import { useNavigate } from "react-router-dom";

function PersonIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
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

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center px-5 py-8">
      <div className="w-full max-w-[390px] bg-[#FFF5EE] rounded-3xl shadow-xl px-6 pt-6 pb-7">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 rounded-full bg-orange-500" />
          <span className="text-orange-600 font-bold text-xs uppercase tracking-widest">
            Emergency Access
          </span>
        </div>

        <p className="text-gray-800 text-[15px] leading-relaxed mb-5">
          Are you affected by the flood? Get immediate access to rescue teams,
          safe shelters, and emergency support.
        </p>

        {/* I Need Help */}
        <button
          onClick={() => navigate("/map")}
          className="w-full bg-orange-500 hover:bg-orange-600 active:bg-orange-700 rounded-2xl px-4 py-4 flex items-center gap-3 text-white transition-colors cursor-pointer mb-4"
        >
          <div className="bg-orange-600/50 rounded-xl p-2.5 flex-shrink-0">
            <PersonIcon className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 text-left">
            <div className="font-bold text-[17px] leading-tight">I Need Help</div>
            <div className="text-orange-100 text-[13px] mt-0.5">
              Access survivor portal instantly — no login needed
            </div>
          </div>
          <ArrowRightIcon className="w-5 h-5 text-white flex-shrink-0" />
        </button>

        {/* Hotline */}
        <div className="bg-orange-50 border border-orange-100 rounded-2xl px-4 py-4 text-center">
          <p className="text-orange-700 font-semibold text-sm mb-1">Emergency Hotline</p>
          <p className="text-orange-600 font-bold text-4xl tracking-tight">199</p>
          <p className="text-orange-500 text-[13px] mt-1">Available 24/7 — Flood Emergency Response</p>
        </div>

      </div>

      <p className="text-center text-gray-400 text-[11px] mt-5">
        © 2026 Flood Disaster Management System
      </p>
    </div>
  );
};

export default LandingPage;
