import { useState, useCallback } from "react";
import { Map, List, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { MapProvider } from "../../map/contexts/MapContext";
import type { MapViewerRole } from "../../map/contexts/MapContext";
import { BaseMap } from "../../map/components/BaseMap";
import { usePolling } from "../../../hooks/usePolling";
import { useMyLocation } from "../../../hooks/useMyLocation";

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

import { RescuePanel } from "../../rescue/components/RescuePanel";

const RescueDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const viewerRole = (user?.role ?? "Volunteer") as MapViewerRole;
  const { myLocation, sessionId } = useMyLocation(viewerRole, user?.id ?? undefined, true);

  const [mobileView, setMobileView] = useState<"panel" | "map">("panel");
  const [activeRescuerId, setActiveRescuerId] = useState<number | null>(null);
  const [activeSosRequestId, setActiveSosRequestId] = useState<number | null>(null);

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
    <MapProvider viewerRole={viewerRole} username={user?.username ?? null}>
      <div className="h-[100dvh] flex flex-col overflow-hidden bg-gray-50">

        {/* ── Header ─────────────────────────────────────────────────── */}
        <header className="flex-shrink-0 bg-[#0F172A] text-white flex items-center justify-between px-4 py-3 z-[1100]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-green-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 17H2V7h10v10z" />
                <path d="M10 9h4l3 3v5h-7V9z" />
                <circle cx="5" cy="17" r="2" />
                <circle cx="15.5" cy="17" r="2" />
                <path d="M5 10v3M3.5 11.5h3" />
              </svg>
            </div>
            <div>
              <p className="font-bold text-sm leading-tight">Rescue Operations</p>
              <p className="text-[11px] text-slate-400 leading-tight">Flood Emergency Response</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-green-500/20 border border-green-500/30 rounded-lg px-3 py-1.5 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-green-300 text-xs font-semibold">{user?.username}</span>
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

          {/* Rescue panel */}
          <div className={`
            md:flex md:flex-col md:flex-none md:w-96 md:overflow-y-auto
            md:bg-white md:border-r md:border-gray-100
            ${mobileView === "panel"
              ? "flex flex-col flex-1 overflow-y-auto bg-white"
              : "hidden"}
          `}>
            <RescuePanel
              sosRequests={sosRequests}
              teamStatuses={teamStatuses}
              onRefresh={refresh}
              onActiveMissionChange={(rescuerId, sosRequestId) => {
                setActiveRescuerId(rescuerId);
                setActiveSosRequestId(sosRequestId);
              }}
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
                safePlaces={safePlaces}
                activeRescuerId={activeRescuerId}
                activeSosRequestId={activeSosRequestId}
              />
              <ActiveLocationLayer
                locations={activeLocations}
                myLocation={myLocation}
                sessionId={sessionId}
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
                    ? "bg-green-500 text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <List className="w-4 h-4" />
                Ops
              </button>
              <button
                onClick={() => setMobileView("map")}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
                  mobileView === "map"
                    ? "bg-green-500 text-white shadow-sm"
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

export default RescueDashboard;
