import { useState, useCallback, useEffect } from "react";
import { useAuth } from "../../auth/contexts/AuthContext";
import { MapProvider, type MapViewerRole } from "../contexts/MapContext";
import { AppHeader } from "../components/AppHeader";
import { AdminPanel } from "../components/AdminPanel";
import { BaseMap } from "../components/BaseMap";

import { listFloodZones } from "../../forecast/apis/forecast.api";
import type { FloodZone } from "../../forecast/types/forecast.types";
import { ForecastLayer } from "../../forecast/components/ForecastLayer";

import { listSafePlaces } from "../../safe-place/apis/safe-place.api";
import type { SafePlace } from "../../safe-place/types/safe-place.types";
import { SafePlaceLayer } from "../../safe-place/components/SafePlaceLayer";

export default function MapPage() {
  const { user } = useAuth();
  const viewerRole: MapViewerRole = user?.role ?? "Survivor";
  const username = user?.username ?? null;

  const [floodZones, setFloodZones] = useState<FloodZone[]>([]);
  const [selectedZoneId, setSelectedZoneId] = useState<number | null>(null);

  const [safePlaces, setSafePlaces] = useState<SafePlace[]>([]);
  const [selectedPlaceId, setSelectedPlaceId] = useState<number | null>(null);

  // refresh is called manually by AdminPanel after create/edit/delete
  const refresh = useCallback(async () => {
    const [zones, places] = await Promise.all([
      listFloodZones().catch(() => [] as FloodZone[]),
      listSafePlaces().catch(() => [] as SafePlace[]),
    ]);
    setFloodZones(zones);
    setSafePlaces(places);
  }, []);

  // Polling — setState is called inside .then() callbacks, not the effect body
  useEffect(() => {
    let active = true;
    const poll = () => {
      listFloodZones()
        .then((zones) => { if (active) setFloodZones(zones); })
        .catch(() => {});
      listSafePlaces()
        .then((places) => { if (active) setSafePlaces(places); })
        .catch(() => {});
    };

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
              <SafePlaceLayer
                places={safePlaces}
                selectedId={selectedPlaceId}
                onSelect={(place) =>
                  setSelectedPlaceId(place.id === selectedPlaceId ? null : place.id)
                }
              />
            </BaseMap>
          </div>

          {/* Side panel — bottom on mobile, left on desktop */}
          <div className="order-2 md:order-1 flex-1 md:flex-none md:w-[380px] md:flex-shrink-0 border-t md:border-t-0 md:border-r border-gray-200 overflow-hidden flex flex-col min-h-0">
            {viewerRole === "Admin" && (
              <AdminPanel
                zones={floodZones}
                selectedId={selectedZoneId}
                onSelect={(zone) => setSelectedZoneId(zone?.id ?? null)}
                safePlaces={safePlaces}
                selectedPlaceId={selectedPlaceId}
                onSelectPlace={(place) => setSelectedPlaceId(place?.id ?? null)}
                onRefresh={refresh}
              />
            )}
          </div>

        </div>
      </div>
    </MapProvider>
  );
}
