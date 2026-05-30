import { useState, useCallback } from "react";
import { List, Map as MapIcon } from "lucide-react";
import { useAuth } from "../../auth/contexts/AuthContext";
import { MapProvider, type MapViewerRole } from "../contexts/MapContext";
import { BaseMap } from "../components/BaseMap";
import { AppHeader } from "../components/AppHeader";
import { usePolling } from "../../../hooks/usePolling";

import { RescueTeamLayer } from "../../rescue/components/RescueTeamLayer";
import { RescuePanel } from "../../rescue/components/RescuePanel";
import { listTeamStatuses } from "../../rescue/apis/rescue.api";
import type { RescueTeamStatus } from "../../rescue/types/rescue.types";

import { listSosRequests } from "../../survivor/apis/survivor.api";
import type { SosRequest } from "../../survivor/types/survivor.types";

import { listSafePlaces } from "../../safe-place/apis/safe-place.api";
import type { SafePlace } from "../../safe-place/types/safe-place.types";

type MobileTab = "map" | "info";

export default function MapPage() {
  const { user } = useAuth();
  const viewerRole: MapViewerRole = user?.role ?? "Survivor";
  const username = user?.username ?? null;

  const [mobileTab, setMobileTab] = useState<MobileTab>("map");
  const [sosRequests, setSosRequests] = useState<SosRequest[]>([]);
  const [teamStatuses, setTeamStatuses] = useState<RescueTeamStatus[]>([]);
  const [safePlaces, setSafePlaces] = useState<SafePlace[]>([]);
  const [activeRescuerId, setActiveRescuerId] = useState<number | null>(null);

  const refresh = useCallback(async () => {
    const [teams, places] = await Promise.all([
      listTeamStatuses().catch(() => [] as RescueTeamStatus[]),
      listSafePlaces().catch(() => [] as SafePlace[]),
    ]);
    setTeamStatuses(teams);
    setSafePlaces(places);

    if (user && (user.role === "Admin" || user.role === "RescueTeam")) {
      const sos = await listSosRequests().catch(() => [] as SosRequest[]);
      setSosRequests(sos);
    }
  }, [user]);

  usePolling(refresh, 10000);

  const panel = (
    <>
      {viewerRole === "RescueTeam" && (
        <RescuePanel
          sosRequests={sosRequests}
          teamStatuses={teamStatuses}
          onRefresh={refresh}
          onActiveMissionChange={setActiveRescuerId}
          onSwitchToMap={() => setMobileTab("map")}
        />
      )}
      {viewerRole === "Admin" && (
        <div className="p-4">
          <h2 className="text-xl font-semibold mb-4">Admin Dashboard</h2>
        </div>
      )}
      {viewerRole === "Survivor" && (
        <div className="p-4">
          <h2 className="text-xl font-semibold mb-4">Survivor Page</h2>
        </div>
      )}
    </>
  );

  return (
    <MapProvider viewerRole={viewerRole} username={username}>
      <div className="h-screen flex flex-col overflow-hidden">

        <AppHeader viewerRole={viewerRole} username={username} />

        {/*
          Single container — one BaseMap instance shared across breakpoints.
          Desktop: map offset right of sidebar via md:left-96.
          Mobile:  map fills full screen; panel overlays it when Info tab is active.
        */}
        <div className="flex-1 relative overflow-hidden min-h-0">

          {/* Map — full height, starts after sidebar on desktop, full width on mobile */}
          <div className="absolute inset-0 md:left-96">
            <BaseMap>
              <RescueTeamLayer
                teamStatuses={teamStatuses}
                sosRequests={sosRequests}
                safePlaces={safePlaces}
                activeRescuerId={activeRescuerId}
              />
            </BaseMap>
          </div>

          {/* Panel — desktop: fixed left sidebar; mobile: full-screen overlay or hidden */}
          <div className={[
            "absolute top-0 bottom-0 left-0 bg-white overflow-y-auto",
            "md:w-96 md:border-r md:border-gray-100 md:z-10 md:block md:right-auto md:pb-0",
            mobileTab === "info"
              ? "right-0 z-400 pb-24"
              : "hidden md:block",
          ].join(" ")}>
            {panel}
          </div>

          {/* Floating pill tab switcher — mobile only */}
          <div className="md:hidden absolute bottom-6 left-1/2 -translate-x-1/2 z-500 bg-white rounded-full shadow-xl p-1.5 flex gap-1">
            <button
              onClick={() => setMobileTab("info")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-colors ${
                mobileTab === "info" ? "bg-orange-500 text-white" : "text-gray-500"
              }`}
            >
              <List className="w-4 h-4" />
              Info
            </button>
            <button
              onClick={() => setMobileTab("map")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-colors ${
                mobileTab === "map" ? "bg-orange-500 text-white" : "text-gray-500"
              }`}
            >
              <MapIcon className="w-4 h-4" />
              Map
            </button>
          </div>

        </div>

      </div>
    </MapProvider>
  );
}
