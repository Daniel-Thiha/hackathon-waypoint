import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

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

const RescueDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#FFF5EE] flex flex-col items-center justify-center px-5 py-8">
      <div className="w-full max-w-[360px]">
        <div className="bg-white rounded-3xl p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <AmbulanceIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="font-bold text-gray-900 text-lg">Rescue Dashboard</p>
              <p className="text-gray-500 text-sm">Flood Disaster Management</p>
            </div>
          </div>

          <div className="bg-orange-50 rounded-2xl p-4 mb-6">
            <p className="text-orange-600 text-xs font-semibold uppercase tracking-wide mb-1">
              Logged in as
            </p>
            <p className="text-orange-900 font-bold text-lg">{user?.username}</p>
            <p className="text-orange-500 text-sm">Rescue Team Member</p>
          </div>

          <p className="text-gray-500 text-sm text-center mb-6">
            Welcome! This is the Rescue Team dashboard. You can view and
            respond to emergency requests from flood survivors.
          </p>

          <button
            onClick={handleLogout}
            className="w-full bg-gray-100 hover:bg-red-50 hover:text-red-600 text-gray-600 font-medium py-3.5 rounded-2xl text-sm transition-colors cursor-pointer"
          >
            Sign Out
          </button>
        </div>

        <p className="text-center text-gray-400 text-[11px] mt-6">
          © 2026 Flood Disaster Management System
        </p>
      </div>
    </div>
  );
};

export default RescueDashboard;
