import { useState, useCallback } from "react";
import { Map, List, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { MapProvider } from "../../map/contexts/MapContext";
import { BaseMap } from "../../map/components/BaseMap";
import { usePolling } from "../../../hooks/usePolling";

import { ForecastLayer } from "../../forecast/components/ForecastLayer";
import { listFloodZones } from "../../forecast/apis/forecast.api";
import type { FloodZone } from "../../forecast/types/forecast.types";

import { SafePlaceLayer } from "../../safe-place/components/SafePlaceLayer";
import { listSafePlaces } from "../../safe-place/apis/safe-place.api";
import type { SafePlace } from "../../safe-place/types/safe-place.types";

import { SOSLayer } from "../../survivor/components/SOSLayer";
import { listSosRequests } from "../../survivor/apis/survivor.api";
import type { SosRequest } from "../../survivor/types/survivor.types";

import { RescueTeamLayer } from "../../rescue/components/RescueTeamLayer";
import { listTeamStatuses } from "../../rescue/apis/rescue.api";
import type { RescueTeamStatus } from "../../rescue/types/rescue.types";

import { ActiveLocationLayer } from "../../map/components/ActiveLocationLayer";
import { getActiveLocations } from "../../active-location/apis/active-location.api";
import type { ActiveLocation } from "../../active-location/types/active-location.types";

import { AdminPanel } from "../../map/components/AdminPanel";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [mobileView, setMobileView] = useState<"panel" | "map">("panel");

  const [floodZones, setFloodZones] = useState<FloodZone[]>([]);
  const [safePlaces, setSafePlaces] = useState<SafePlace[]>([]);
  const [sosRequests, setSosRequests] = useState<SosRequest[]>([]);
  const [teamStatuses, setTeamStatuses] = useState<RescueTeamStatus[]>([]);
  const [activeLocations, setActiveLocations] = useState<ActiveLocation[]>([]);

  const refresh = useCallback(async () => {
    const [zones, places, sos, teams, locs] = await Promise.all([
      listFloodZones().catch(() => [] as FloodZone[]),
      listSafePlaces().catch(() => [] as SafePlace[]),
      listSosRequests().catch(() => [] as SosRequest[]),
      listTeamStatuses().catch(() => [] as RescueTeamStatus[]),
      getActiveLocations().catch(() => [] as ActiveLocation[]),
    ]);
    setFloodZones(zones);
    setSafePlaces(places);
    setSosRequests(sos);
    setTeamStatuses(teams);
    setActiveLocations(locs);
  }, []);

  usePolling(refresh, 10000);

  const handleLogout = async () => {
    await logout();
    navigate("/", { replace: true });
  };

  return (
    <MapProvider viewerRole="Admin" username={user?.username ?? null}>
      <div className="h-[100dvh] flex flex-col overflow-hidden bg-gray-50">

        {/* ── Header ─────────────────────────────────────────────────── */}
        <header className="flex-shrink-0 bg-[#0F172A] text-white flex items-center justify-between px-4 py-3 z-[1100]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
              </svg>
            </div>
            <div>
              <p className="font-bold text-sm leading-tight">Admin Dashboard</p>
              <p className="text-[11px] text-slate-400 leading-tight">Flood Disaster Management</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg px-3 py-1.5 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
              <span className="text-blue-300 text-xs font-semibold">{user?.username}</span>
            </div>
            <button
              onClick={handleLogout}
              title="Sign out"
              className="text-slate-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/10 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* ── Content ────────────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0 relative">

          {/* Admin panel */}
          <div className={`
            md:flex md:flex-col md:flex-none md:w-96 md:overflow-y-auto
            md:bg-white md:border-r md:border-gray-100
            ${mobileView === "panel"
              ? "flex flex-col flex-1 overflow-y-auto bg-white"
              : "hidden"}
          `}>
            <AdminPanel
              floodZones={floodZones}
              safePlaces={safePlaces}
              sosRequests={sosRequests}
              teamStatuses={teamStatuses}
              onRefresh={refresh}
            />
            <div className="h-20 flex-shrink-0 md:hidden" />
          </div>

          {/* Map */}
          <div className={`
            md:flex md:flex-1 relative
            ${mobileView === "map" ? "flex flex-1" : "hidden"}
          `}>
            <BaseMap>
              <ForecastLayer zones={floodZones} />
              <SafePlaceLayer places={safePlaces} />
              <SOSLayer sosRequests={sosRequests} />
              <RescueTeamLayer
                teamStatuses={teamStatuses}
                sosRequests={sosRequests}
                activeRescuerId={null}
              />
              <ActiveLocationLayer
                locations={activeLocations}
                myLocation={null}
                sessionId={null}
                authLoading={false}
              />
            </BaseMap>
          </div>

          {/* ── Mobile toggle pill ──────────────────────────────────── */}
          <div className="md:hidden absolute bottom-5 left-1/2 -translate-x-1/2 z-[2000]">
            <div className="flex bg-white rounded-2xl shadow-xl border border-gray-200 p-1 gap-1">
              <button
                onClick={() => setMobileView("panel")}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
                  mobileView === "panel"
                    ? "bg-blue-500 text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <List className="w-4 h-4" />
                Panel
              </button>
              <button
                onClick={() => setMobileView("map")}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
                  mobileView === "map"
                    ? "bg-blue-500 text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <Map className="w-4 h-4" />
                Map
              </button>
            </div>
          </div>

        </div>
      </div>
    </MapProvider>
  );
};

export default AdminDashboard;
