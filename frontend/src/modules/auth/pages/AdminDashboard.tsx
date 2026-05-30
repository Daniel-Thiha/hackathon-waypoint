import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
    </svg>
  );
}

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#FFF5EE] flex flex-col items-center justify-center px-5 py-8">
      <div className="w-full max-w-[360px]">
        <div className="bg-white rounded-3xl p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <ShieldIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="font-bold text-gray-900 text-lg">Admin Dashboard</p>
              <p className="text-gray-500 text-sm">Flood Disaster Management</p>
            </div>
          </div>

          <div className="bg-blue-50 rounded-2xl p-4 mb-6">
            <p className="text-blue-600 text-xs font-semibold uppercase tracking-wide mb-1">
              Logged in as
            </p>
            <p className="text-blue-900 font-bold text-lg">{user?.username}</p>
            <p className="text-blue-500 text-sm">Administrator</p>
          </div>

          <p className="text-gray-500 text-sm text-center mb-6">
            Welcome! This is the Admin dashboard. You can manage forecasts,
            safe places, and oversee the flood disaster response.
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

export default AdminDashboard;
