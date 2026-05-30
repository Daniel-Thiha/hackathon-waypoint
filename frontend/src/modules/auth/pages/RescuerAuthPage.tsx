import { useNavigate } from "react-router-dom";

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

function LoginArrowIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
      <polyline points="10 17 15 12 10 7" />
      <line x1="15" y1="12" x2="3" y2="12" />
    </svg>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

const RescuerAuthPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center px-5 py-8">
      <div className="w-full max-w-[390px]">
        <button
          onClick={() => navigate("/staff")}
          className="flex items-center gap-1.5 text-gray-400 hover:text-gray-600 text-sm mb-5 transition-colors cursor-pointer"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Back
        </button>

        <div className="bg-white rounded-3xl shadow-xl px-6 pt-6 pb-7">
          {/* Header */}
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <AmbulanceIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-gray-900 text-lg">Rescuer Portal</p>
              <p className="text-gray-400 text-[13px]">Rescuer Portal</p>
            </div>
          </div>

          <p className="text-gray-500 text-[13px] mb-6 leading-relaxed">
            Already registered? Log in. New here? Create an account to join the rescue effort.
          </p>

          {/* Login */}
          <button
            onClick={() => navigate("/staff/rescuer/login")}
            className="w-full group bg-gray-50 hover:bg-green-50 border-2 border-gray-200 hover:border-green-400 rounded-2xl px-4 py-4 flex items-center gap-4 transition-all cursor-pointer mb-3"
          >
            <div className="w-11 h-11 bg-green-100 group-hover:bg-green-500 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors">
              <LoginArrowIcon className="w-5 h-5 text-green-600 group-hover:text-white transition-colors" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-bold text-gray-900 text-[14px]">Log In</p>
              <p className="text-gray-500 text-[12px] mt-0.5">I already have an account</p>
            </div>
            <ArrowRightIcon className="w-4 h-4 text-gray-300 group-hover:text-green-500 transition-colors flex-shrink-0" />
          </button>

          {/* Sign Up */}
          <button
            onClick={() => navigate("/staff/rescuer/signup")}
            className="w-full group bg-gray-50 hover:bg-orange-50 border-2 border-gray-200 hover:border-orange-400 rounded-2xl px-4 py-4 flex items-center gap-4 transition-all cursor-pointer"
          >
            <div className="w-11 h-11 bg-orange-100 group-hover:bg-orange-500 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors">
              <PlusIcon className="w-5 h-5 text-orange-500 group-hover:text-white transition-colors" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-bold text-gray-900 text-[14px]">Sign Up</p>
              <p className="text-gray-500 text-[12px] mt-0.5">Create a new rescuer account</p>
            </div>
            <ArrowRightIcon className="w-4 h-4 text-gray-300 group-hover:text-orange-500 transition-colors flex-shrink-0" />
          </button>
        </div>

        <p className="text-center text-gray-400 text-[11px] mt-5">
          © 2026 Flood Disaster Management System
        </p>
      </div>
    </div>
  );
};

export default RescuerAuthPage;
