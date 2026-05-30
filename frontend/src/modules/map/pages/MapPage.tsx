// import { useState, useCallback } from "react";
import { useAuth } from "../../auth/contexts/AuthContext";
import { MapProvider, type MapViewerRole } from "../contexts/MapContext";
// import { BaseMap } from "../components/BaseMap";           
// import { AppHeader } from "../components/AppHeader";       
// import { AdminPanel } from "../components/AdminPanel";     
// import { usePolling } from "../../../hooks/usePolling";    

// import { ForecastLayer } from "../../forecast/components/ForecastLayer";  
// import { listFloodZones } from "../../forecast/apis/forecast.api";         
// import type { FloodZone } from "../../forecast/types/forecast.types";      

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

  // const [safePlaces, setSafePlaces] = useState<SafePlace[]>([]);
  // const [sosRequests, setSosRequests] = useState<SosRequest[]>([]);
  // const [teamStatuses, setTeamStatuses] = useState<RescueTeamStatus[]>([]);
  // const [activeRescuerId, setActiveRescuerId] = useState<number | null>(null);

  // const refresh = useCallback(async () => {
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
  // }, [user]);

  // usePolling(refresh, 10000);  hook — call refresh manually for now
  // void refresh; void activeRescuerId; // suppress unused warnings

  return (
    <MapProvider viewerRole={viewerRole} username={username}>
      <div className="h-screen flex flex-col overflow-hidden">

        {/* <AppHeader viewerRole={viewerRole} username={username} /> */}

        <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">

          {/* Side / top panel */}
          <div className="flex-1 md:flex-none md:w-96 overflow-y-auto bg-white md:border-r border-gray-100 min-h-0">
            {/* AdminPanel, RescuePanel, SurvivorPanel */}
          </div>

          {/* Map */}
          <div className="h-52 flex-shrink-0 md:h-auto md:flex-1 relative">
            {/* <BaseMap> */}
            {/*   <ForecastLayer zones={floodZones} /> */}
            {/*   <SafePlaceLayer places={safePlaces} /> */}
            {/*   {(viewerRole === "Admin" || viewerRole === "RescueTeam") && ( */}
            {/*     <SOSLayer sosRequests={sosRequests} /> */}
            {/*   )} */}
            {/*   <RescueTeamLayer */}
            {/*     teamStatuses={teamStatuses} */}
            {/*     sosRequests={sosRequests} */}
            {/*     activeRescuerId={activeRescuerId} */}
            {/*   /> */}
            {/* </BaseMap> */}
          </div>

        </div>
      </div>
    </MapProvider>
  );
}
