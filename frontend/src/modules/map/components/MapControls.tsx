import { useNavigate } from "react-router-dom";
import { Waves, Shield, Truck, User, LogOut } from "lucide-react";
import { useAuth } from "../../auth/contexts/AuthContext";
import { useMapContext, type MapViewerRole } from "../contexts/MapContext";

const ROLE_CONFIG: Record<
  MapViewerRole,
  { label: string; bg: string; Icon: React.ElementType }
> = {
  Admin: { label: "Admin", bg: "bg-blue-500", Icon: Shield },
  RescueTeam: { label: "Rescue Team", bg: "bg-orange-500", Icon: Truck },
  Volunteer: { label: "Volunteer", bg: "bg-green-500", Icon: Truck },
  Survivor: { label: "Survivor", bg: "bg-red-500", Icon: User },
};

export function MapControls() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { viewerRole, username } = useMapContext();

  const { label, bg, Icon } = ROLE_CONFIG[viewerRole];

  const handleExit = async () => {
    if (viewerRole === "Survivor") {
      navigate("/");
    } else {
      await logout();
      navigate("/", { replace: true });
    }
  };

  return (
    <>
      {/* Top-left: App branding */}
      <div className="absolute top-4 left-4 z-[1000] pointer-events-none">
        <div className="bg-white rounded-2xl shadow-lg px-4 py-2.5 pointer-events-auto flex items-center gap-2">
          <Waves className="w-5 h-5 text-blue-500" strokeWidth={2} />
          <span className="font-bold text-gray-900 text-sm tracking-tight">
            FloodAid
          </span>
        </div>
      </div>

      {/* Top-right: Role badge + username + exit */}
      <div className="absolute top-4 right-4 z-[1000] pointer-events-none">
        <div className="bg-white rounded-2xl shadow-lg px-3 py-2 pointer-events-auto flex items-center gap-2.5">
          <span
            className={`${bg} text-white text-xs font-semibold px-2.5 py-1 rounded-lg flex items-center gap-1.5`}
          >
            <Icon className="w-3 h-3" strokeWidth={2.5} />
            {label}
          </span>
          {username && (
            <span className="text-gray-700 text-sm font-medium">{username}</span>
          )}
          <button
            onClick={handleExit}
            title={viewerRole === "Survivor" ? "Exit map" : "Sign out"}
            className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-lg hover:bg-red-50 cursor-pointer"
          >
            <LogOut className="w-4 h-4" strokeWidth={2} />
          </button>
        </div>
      </div>

      {/*
       * SLOT: bottom panel
       * Future features drop their UI panels here using absolute positioning.
       * e.g. SOS request panel, safe place list, rescue dispatch panel.
       */}
    </>
  );
}
