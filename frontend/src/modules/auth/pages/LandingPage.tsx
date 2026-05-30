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

        {/* Staff Portal divider */}
        <div className="flex items-center gap-3 mt-1">
          <div className="flex-1 h-px bg-orange-100" />
          <span className="text-orange-300 text-[11px] font-medium">Staff Access</span>
          <div className="flex-1 h-px bg-orange-100" />
        </div>

        {/* Staff Portal button */}
        <button
          onClick={() => navigate("/staff")}
          className="w-full bg-white hover:bg-orange-50 border border-orange-200 rounded-2xl px-4 py-3 flex items-center justify-between text-gray-700 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-orange-600" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
              </svg>
            </div>
            <div className="text-left">
              <p className="font-semibold text-[13px] text-gray-800">Staff Portal</p>
              <p className="text-[11px] text-gray-400">Admin &amp; Rescue Team Login</p>
            </div>
          </div>
          <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </button>

      </div>

      <p className="text-center text-gray-400 text-[11px] mt-5">
        © 2026 Flood Disaster Management System
      </p>
    </div>
  );
};

export default LandingPage;
