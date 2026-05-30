import { LogOut, Shield, Waves } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/contexts/AuthContext";

export function AppHeader() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="bg-[#1e2433] text-white flex items-center px-5 h-14 flex-shrink-0 z-50">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
          <Waves className="w-4 h-4 text-white" strokeWidth={2.5} />
        </div>
        <div className="min-w-0">
          <p className="font-bold text-[13px] leading-tight truncate">Flood Disaster Management</p>
          <p className="text-gray-400 text-[10px] leading-tight hidden sm:block">Real-time Emergency Response System</p>
        </div>
      </div>

      {user && (
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="bg-blue-600 rounded-xl px-3 py-1.5 flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-white" strokeWidth={2} />
            <div>
              <p className="text-xs font-bold leading-none">{user.role === "Admin" ? "Admin" : "Rescue"}</p>
              <p className="text-blue-200 text-[10px] leading-none mt-0.5">{user.id}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-gray-300 hover:text-white text-xs font-medium transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" strokeWidth={2} />
            Logout
          </button>
        </div>
      )}
    </header>
  );
}
