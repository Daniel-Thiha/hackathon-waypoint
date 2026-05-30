import { useState, useCallback } from "react";
import { Map, List, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { MapProvider } from "../contexts/MapContext";
import { BaseMap } from "../components/BaseMap";
import { usePolling } from "../../../hooks/usePolling";

import { ForecastLayer } from "../../forecast/components/ForecastLayer";
import { listFloodZones } from "../../forecast/apis/forecast.api";
import type { FloodZone } from "../../forecast/types/forecast.types";

import { SafePlaceLayer } from "../../safe-place/components/SafePlaceLayer";
import { listSafePlaces } from "../../safe-place/apis/safe-place.api";
import type { SafePlace } from "../../safe-place/types/safe-place.types";

import { SurvivorPanel } from "../../survivor/components/SurvivorPanel";

import { RescueTeamLayer } from "../../rescue/components/RescueTeamLayer";
import { listTeamStatuses } from "../../rescue/apis/rescue.api";
import type { RescueTeamStatus } from "../../rescue/types/rescue.types";

import { ActiveLocationLayer } from "../components/ActiveLocationLayer";
import { getActiveLocations } from "../../active-location/apis/active-location.api";
import type { ActiveLocation } from "../../active-location/types/active-location.types";
import { useMyLocation } from "../../../hooks/useMyLocation";

export default function MapPage() {
  const navigate = useNavigate();
  const { myLocation, sessionId } = useMyLocation("Survivor", undefined, true);
  const [mobileView, setMobileView] = useState<"panel" | "map">("panel");

  const [floodZones, setFloodZones] = useState<FloodZone[]>([]);
  const [safePlaces, setSafePlaces] = useState<SafePlace[]>([]);
  const [teamStatuses, setTeamStatuses] = useState<RescueTeamStatus[]>([]);
  const [activeLocations, setActiveLocations] = useState<ActiveLocation[]>([]);

  const refresh = useCallback(async () => {
    const [zones, places, teams, locs] = await Promise.all([
      listFloodZones().catch(() => [] as FloodZone[]),
      listSafePlaces().catch(() => [] as SafePlace[]),
      listTeamStatuses().catch(() => [] as RescueTeamStatus[]),
      getActiveLocations().catch(() => [] as ActiveLocation[]),
    ]);
    setFloodZones(zones);
    setSafePlaces(places);
    setTeamStatuses(teams);
    setActiveLocations(locs);
  }, []);

  usePolling(refresh, 10000);

  return (
    <MapProvider viewerRole="Survivor" username={null}>
      <div className="h-[100dvh] flex flex-col overflow-hidden bg-gray-50">

        {/* ── Header ─────────────────────────────────────────────────── */}
        <header className="flex-shrink-0 bg-[#0F172A] text-white flex items-center justify-between px-4 py-3 z-[1100]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-orange-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
                <path d="M2 12c.6.5 1.2 1 2.5 1C7 13 7 11 9.5 11c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
                <path d="M2 18c.6.5 1.2 1 2.5 1C7 19 7 17 9.5 17c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
              </svg>
            </div>
            <div>
              <p className="font-bold text-sm leading-tight">Survivor Portal</p>
              <p className="text-[11px] text-slate-400 leading-tight">Flood Emergency Assistance</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-orange-500/20 border border-orange-500/30 rounded-lg px-3 py-1.5 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
              <span className="text-orange-300 text-xs font-semibold">Emergency Active</span>
            </div>
            <button
              onClick={() => navigate("/")}
              title="Exit to landing page"
              className="text-slate-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/10 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* ── Content ────────────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0 relative">

          {/* Survivor panel — full screen on mobile when panel view active */}
          <div className={`
            md:flex md:flex-col md:flex-none md:w-96 md:overflow-y-auto
            md:bg-white md:border-r md:border-gray-100
            ${mobileView === "panel"
              ? "flex flex-col flex-1 overflow-y-auto bg-white"
              : "hidden"}
          `}>
            <SurvivorPanel
              safePlaces={safePlaces}
              floodZones={floodZones}
              teamStatuses={teamStatuses}
              locationShared={myLocation !== null}
              onSwitchToMap={() => setMobileView("map")}
            />
            {/* Extra bottom padding on mobile so content isn't hidden behind the toggle */}
            <div className="h-20 flex-shrink-0 md:hidden" />
          </div>

          {/* Map — full screen on mobile when map view active */}
          <div className={`
            md:flex md:flex-1 relative
            ${mobileView === "map" ? "flex flex-1" : "hidden"}
          `}>
            <BaseMap>
              <ForecastLayer zones={floodZones} />
              <SafePlaceLayer places={safePlaces} />
              <RescueTeamLayer
                teamStatuses={teamStatuses}
                sosRequests={[]}
                activeRescuerId={null}
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
                    ? "bg-orange-500 text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <List className="w-4 h-4" />
                Info
              </button>
              <button
                onClick={() => setMobileView("map")}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
                  mobileView === "map"
                    ? "bg-orange-500 text-white shadow-sm"
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
}
