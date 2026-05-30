import { useNavigate } from "react-router-dom";

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

const StaffPortalPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center px-5 py-8">
      <div className="w-full max-w-[390px]">
        {/* Back */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-1.5 text-gray-400 hover:text-gray-600 text-sm mb-5 transition-colors cursor-pointer"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Back to Emergency Access
        </button>

        <div className="bg-white rounded-3xl shadow-xl px-6 pt-6 pb-7">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-blue-600 font-bold text-xs uppercase tracking-widest">
              Staff Portal
            </span>
          </div>
          <p className="text-gray-800 font-bold text-xl mt-1 mb-1">Who are you?</p>
          <p className="text-gray-500 text-[13px] mb-6">Select your role to continue</p>

          {/* Admin card */}
          <button
            onClick={() => navigate("/staff/admin/login")}
            className="w-full group bg-gray-50 hover:bg-blue-50 border-2 border-gray-200 hover:border-blue-400 rounded-2xl px-4 py-4 flex items-center gap-4 transition-all cursor-pointer mb-3"
          >
            <div className="w-12 h-12 bg-blue-100 group-hover:bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors">
              <ShieldIcon className="w-5 h-5 text-blue-500 group-hover:text-white transition-colors" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-bold text-gray-900 text-[15px]">Administrator</p>
              <p className="text-gray-500 text-[12px] mt-0.5">Manage forecasts, safe places & users</p>
            </div>
            <ArrowRightIcon className="w-4 h-4 text-gray-300 group-hover:text-blue-500 transition-colors flex-shrink-0" />
          </button>

          {/* Rescuer card */}
          <button
            onClick={() => navigate("/staff/rescuer")}
            className="w-full group bg-gray-50 hover:bg-green-50 border-2 border-gray-200 hover:border-green-400 rounded-2xl px-4 py-4 flex items-center gap-4 transition-all cursor-pointer"
          >
            <div className="w-12 h-12 bg-green-100 group-hover:bg-green-500 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors">
              <AmbulanceIcon className="w-5 h-5 text-green-600 group-hover:text-white transition-colors" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-bold text-gray-900 text-[15px]">Rescuer</p>
              <p className="text-gray-500 text-[12px] mt-0.5">Volunteer or official rescue team</p>
            </div>
            <ArrowRightIcon className="w-4 h-4 text-gray-300 group-hover:text-green-500 transition-colors flex-shrink-0" />
          </button>
        </div>

        <p className="text-center text-gray-400 text-[11px] mt-5">
          © 2026 Flood Disaster Management System
        </p>
      </div>
    </div>
  );
};

export default StaffPortalPage;
