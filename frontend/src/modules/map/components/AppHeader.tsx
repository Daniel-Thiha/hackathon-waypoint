import { useNavigate } from "react-router-dom";
import { Waves, LogOut } from "lucide-react";
import { useAuth } from "../../auth/contexts/AuthContext";
import type { MapViewerRole } from "../contexts/MapContext";

interface AppHeaderProps {
  viewerRole: MapViewerRole;
  username: string | null;
}

export function AppHeader({ viewerRole, username }: AppHeaderProps) {
  const navigate = useNavigate();
  const { logout } = useAuth();

  async function handleLogout() {
    if (viewerRole === "Survivor") {
      navigate("/");
    } else {
      await logout();
      navigate("/", { replace: true });
    }
  }

  return (
    <header className="bg-[#0F172A] text-white flex items-center justify-between px-4 py-3 flex-shrink-0 z-[1100]">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
          <Waves className="w-5 h-5 text-white" strokeWidth={2} />
        </div>
        <div>
          <p className="font-bold text-sm leading-tight">Flood Disaster Management</p>
          <p className="text-[11px] text-slate-400 leading-tight">Real-time Emergency Response System</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {viewerRole !== "Survivor" && username && (
          <>
            <div className="hidden sm:flex items-center gap-2 bg-white/10 rounded-lg px-3 py-1.5">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                viewerRole === "Admin" ? "bg-blue-500" : "bg-orange-500"
              }`}>
                {username[0].toUpperCase()}
              </div>
              <span className="text-sm font-medium">{username}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg cursor-pointer transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </>
        )}
        {viewerRole === "Survivor" && (
          <button
            onClick={handleLogout}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 cursor-pointer transition-colors"
            title="Exit"
          >
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>
    </header>
  );
}
