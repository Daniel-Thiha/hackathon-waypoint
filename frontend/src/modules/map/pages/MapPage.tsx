import { useState, useCallback, useEffect } from "react";
import { useAuth } from "../../auth/contexts/AuthContext";
import { MapProvider, type MapViewerRole } from "../contexts/MapContext";
import { AppHeader } from "../components/AppHeader";
import { AdminPanel } from "../components/AdminPanel";
import { BaseMap } from "../components/BaseMap";

import { listFloodZones } from "../../forecast/apis/forecast.api";
import type { FloodZone } from "../../forecast/types/forecast.types";
import { ForecastLayer } from "../../forecast/components/ForecastLayer";

// import { listSafePlaces } from "../../safe-place/apis/safe-place.api";
// import type { SafePlace } from "../../safe-place/types/safe-place.types";
// import { SafePlaceLayer } from "../../safe-place/components/SafePlaceLayer";

// import { listSosRequests } from "../../survivor/apis/survivor.api";
// import type { SosRequest } from "../../survivor/types/survivor.types";
// import { SOSLayer } from "../../survivor/components/SOSLayer";
// import { SurvivorPanel } from "../../survivor/components/SurvivorPanel";

// import { listTeamStatuses } from "../../rescue/apis/rescue.api";
// import type { RescueTeamStatus } from "../../rescue/types/rescue.types";
// import { RescueTeamLayer } from "../../rescue/components/RescueTeamLayer";
// import { RescuePanel } from "../../rescue/components/RescuePanel";

export default function MapPage() {
  const { user } = useAuth();
  const viewerRole: MapViewerRole = user?.role ?? "Survivor";
  const username = user?.username ?? null;

  const [floodZones, setFloodZones] = useState<FloodZone[]>([]);
  const [selectedZoneId, setSelectedZoneId] = useState<number | null>(null);

  // const [safePlaces, setSafePlaces] = useState<SafePlace[]>([]);
  // const [sosRequests, setSosRequests] = useState<SosRequest[]>([]);
  // const [teamStatuses, setTeamStatuses] = useState<RescueTeamStatus[]>([]);
  // const [activeRescuerId, setActiveRescuerId] = useState<number | null>(null);

  // refresh is called manually by AdminPanel after create/edit/delete
  const refresh = useCallback(async () => {
    const zones = await listFloodZones().catch(() => [] as FloodZone[]);
    setFloodZones(zones);

    // const [places, teams] = await Promise.all([
    //   listSafePlaces().catch(() => [] as SafePlace[]),
    //   listTeamStatuses().catch(() => [] as RescueTeamStatus[]),
    // ]);
    // setSafePlaces(places);
    // setTeamStatuses(teams);

    // if (user && (user.role === "Admin" || user.role === "RescueTeam")) {
    //   const sos = await listSosRequests().catch(() => [] as SosRequest[]);
    //   setSosRequests(sos);
    // }
  }, []);

  // Polling — setState is called inside .then() callbacks, not the effect body
  useEffect(() => {
    let active = true;
    const poll = () =>
      listFloodZones()
        .then((zones) => { if (active) setFloodZones(zones); })
        .catch(() => {});

    poll();
    const id = setInterval(poll, 10000);
    return () => { active = false; clearInterval(id); };
  }, []);

  return (
    <MapProvider viewerRole={viewerRole} username={username}>
      <div className="h-screen flex flex-col overflow-hidden">

        <AppHeader />

        <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">

          {/* Map — top on mobile, right on desktop */}
          <div className="order-1 md:order-2 h-64 md:h-auto flex-shrink-0 md:flex-1 relative min-w-0">
            <BaseMap>
              <ForecastLayer
                zones={floodZones}
                selectedId={selectedZoneId}
                onSelect={(zone) =>
                  setSelectedZoneId(zone.id === selectedZoneId ? null : zone.id)
                }
              />
              {/* <SafePlaceLayer places={safePlaces} /> */}
              {/* {(viewerRole === "Admin" || viewerRole === "RescueTeam") && ( */}
              {/*   <SOSLayer sosRequests={sosRequests} /> */}
              {/* )} */}
              {/* <RescueTeamLayer */}
              {/*   teamStatuses={teamStatuses} */}
              {/*   sosRequests={sosRequests} */}
              {/*   activeRescuerId={activeRescuerId} */}
              {/* /> */}
            </BaseMap>
          </div>

          {/* Side panel — bottom on mobile, left on desktop */}
          <div className="order-2 md:order-1 flex-1 md:flex-none md:w-[380px] md:flex-shrink-0 border-t md:border-t-0 md:border-r border-gray-200 overflow-hidden flex flex-col min-h-0">
            {viewerRole === "Admin" && (
              <AdminPanel
                zones={floodZones}
                selectedId={selectedZoneId}
                onSelect={(zone) => setSelectedZoneId(zone?.id ?? null)}
                onRefresh={refresh}
              />
            )}
            {/* {viewerRole === "RescueTeam" && ( */}
            {/*   <RescuePanel */}
            {/*     sosRequests={sosRequests} */}
            {/*     teamStatuses={teamStatuses} */}
            {/*     activeRescuerId={activeRescuerId} */}
            {/*     setActiveRescuerId={setActiveRescuerId} */}
            {/*     onRefresh={refresh} */}
            {/*   /> */}
            {/* )} */}
            {/* {viewerRole === "Survivor" && ( */}
            {/*   <SurvivorPanel safePlaces={safePlaces} onRefresh={refresh} /> */}
            {/* )} */}
          </div>

        </div>
      </div>
    </MapProvider>
  );
}
