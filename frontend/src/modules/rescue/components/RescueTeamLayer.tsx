import { useState, useEffect } from "react";
import { Polyline, CircleMarker, Popup } from "react-leaflet";
import type { RescueTeamStatus } from "../types/rescue.types";
import type { SosRequest } from "../../survivor/types/survivor.types";
import { fetchRoute } from "../utils/routing";
import type { LatLng } from "../../map/types/map.types";

interface RescueTeamLayerProps {
  teamStatuses: RescueTeamStatus[];
  sosRequests: SosRequest[];
  activeRescuerId: number | null;
}

export function RescueTeamLayer({ teamStatuses, sosRequests, activeRescuerId }: RescueTeamLayerProps) {
  const [route, setRoute] = useState<LatLng[] | null>(null);

  useEffect(() => {
    if (!activeRescuerId) { setRoute(null); return; }
    const rescuer = teamStatuses.find((t) => t.userId === activeRescuerId);
    if (!rescuer?.lat || !rescuer?.lng) return;

    const assignedSos = sosRequests.find(
      (s) => s.assignedRescuerId === activeRescuerId && s.status === "assigned"
    );
    if (!assignedSos) { setRoute(null); return; }

    fetchRoute(
      { lat: rescuer.lat, lng: rescuer.lng },
      { lat: assignedSos.lastKnownLat ?? assignedSos.lat, lng: assignedSos.lastKnownLng ?? assignedSos.lng }
    ).then(setRoute).catch(() => setRoute(null));
  }, [activeRescuerId, teamStatuses, sosRequests]);

  return (
    <>
      {/* Route line to active mission target */}
      {route && route.length > 1 && (
        <Polyline
          positions={route.map((c) => [c.lat, c.lng] as [number, number])}
          pathOptions={{ color: "#2563EB", weight: 5, opacity: 0.85 }}
        />
      )}

      {/* Mission target marker */}
      {sosRequests
        .filter((s) => s.status === "assigned" && s.assignedRescuerId === activeRescuerId)
        .map((s) => (
          <CircleMarker
            key={`target-${s.id}`}
            center={[s.lastKnownLat ?? s.lat, s.lastKnownLng ?? s.lng]}
            radius={13}
            pathOptions={{ color: "#B91C1C", fillColor: "#EF4444", fillOpacity: 0.6, weight: 3 }}
          >
            <Popup>
              <p style={{ fontWeight: 700, fontSize: 13 }}>{s.survivorName}</p>
              <p style={{ fontSize: 11, color: "#EF4444" }}>Rescue target</p>
            </Popup>
          </CircleMarker>
        ))}
    </>
  );
}
