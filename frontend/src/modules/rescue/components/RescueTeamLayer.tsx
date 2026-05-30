import { useState, useEffect } from "react";
import { Marker, Polyline, CircleMarker, Popup } from "react-leaflet";
import { divIcon } from "leaflet";
import type { RescueTeamStatus } from "../types/rescue.types";
import type { SosRequest } from "../../survivor/types/survivor.types";
import type { SafePlace } from "../../safe-place/types/safe-place.types";
import { fetchRoute } from "../utils/routing";
import type { LatLng } from "../../map/types/map.types";

function teamIcon(isAvailable: boolean) {
  const bg = isAvailable ? "#2563EB" : "#6B7280";
  return divIcon({
    html: `<div style="background:${bg};width:26px;height:26px;border-radius:6px;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.3);display:flex;align-items:center;justify-content:center;font-size:13px;">🚑</div>`,
    className: "",
    iconSize: [26, 26],
    iconAnchor: [13, 13],
  });
}

function shelterIcon() {
  return divIcon({
    html: `<div style="background:#16A34A;width:26px;height:26px;border-radius:6px;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.3);display:flex;align-items:center;justify-content:center;font-size:13px;">🏥</div>`,
    className: "",
    iconSize: [26, 26],
    iconAnchor: [13, 13],
  });
}

interface RescueTeamLayerProps {
  teamStatuses: RescueTeamStatus[];
  sosRequests: SosRequest[];
  safePlaces?: SafePlace[];
  activeRescuerId: number | null;
}

export function RescueTeamLayer({ teamStatuses, sosRequests, safePlaces = [], activeRescuerId }: RescueTeamLayerProps) {
  const [toVictimRoute, setToVictimRoute] = useState<LatLng[] | null>(null);
  const [toShelterRoute, setToShelterRoute] = useState<LatLng[] | null>(null);

  useEffect(() => {
    if (!activeRescuerId) { setToVictimRoute(null); setToShelterRoute(null); return; }

    const rescuer = teamStatuses.find((t) => t.userId === activeRescuerId);
    const assignedSos = sosRequests.find(
      (s) => s.assignedRescuerId === activeRescuerId && s.status === "assigned"
    );

    if (!assignedSos) { setToVictimRoute(null); setToShelterRoute(null); return; }

    const victimPos: LatLng = {
      lat: assignedSos.lastKnownLat ?? assignedSos.lat,
      lng: assignedSos.lastKnownLng ?? assignedSos.lng,
    };

    if (rescuer?.lat && rescuer?.lng) {
      fetchRoute({ lat: rescuer.lat, lng: rescuer.lng }, victimPos)
        .then(setToVictimRoute)
        .catch(() => setToVictimRoute(null));
    } else {
      setToVictimRoute(null);
    }

    if (assignedSos.safePlaceId) {
      const shelter = safePlaces.find((sp) => sp.id === assignedSos.safePlaceId);
      if (shelter) {
        fetchRoute(victimPos, { lat: shelter.lat, lng: shelter.lng })
          .then(setToShelterRoute)
          .catch(() => setToShelterRoute(null));
      } else {
        setToShelterRoute(null);
      }
    } else {
      setToShelterRoute(null);
    }
  }, [activeRescuerId, teamStatuses, sosRequests, safePlaces]);

  return (
    <>
      {/* Pending SOS requests */}
      {sosRequests
        .filter((s) => s.status === "pending")
        .map((s) => (
          <CircleMarker
            key={`sos-${s.id}`}
            center={[s.lastKnownLat ?? s.lat, s.lastKnownLng ?? s.lng]}
            radius={12}
            pathOptions={{ color: "#B91C1C", fillColor: "#EF4444", fillOpacity: 0.75, weight: 2.5 }}
          >
            <Popup>
              <p style={{ fontWeight: 700, fontSize: 13 }}>{s.survivorName}</p>
              <p style={{ fontSize: 11, color: "#DC2626", fontWeight: 600, marginTop: 2 }}>⚠ Awaiting rescue</p>
              {s.notes && <p style={{ fontSize: 11, color: "#374151", marginTop: 2 }}>"{s.notes}"</p>}
              {s.phone && <p style={{ fontSize: 11, color: "#6B7280", marginTop: 2 }}>{s.phone}</p>}
            </Popup>
          </CircleMarker>
        ))}

      {/* Assigned SOS requests */}
      {sosRequests
        .filter((s) => s.status === "assigned")
        .map((s) => (
          <CircleMarker
            key={`assigned-${s.id}`}
            center={[s.lastKnownLat ?? s.lat, s.lastKnownLng ?? s.lng]}
            radius={10}
            pathOptions={{ color: "#C2410C", fillColor: "#FB923C", fillOpacity: 0.75, weight: 2.5 }}
          >
            <Popup>
              <p style={{ fontWeight: 700, fontSize: 13 }}>{s.survivorName}</p>
              <p style={{ fontSize: 11, color: "#EA580C", fontWeight: 600, marginTop: 2 }}>🚑 Help on the way</p>
              {s.notes && <p style={{ fontSize: 11, color: "#374151", marginTop: 2 }}>"{s.notes}"</p>}
            </Popup>
          </CircleMarker>
        ))}

      {/* Safe place markers (only shown in rescue view) */}
      {safePlaces.map((sp) => (
        <Marker key={`shelter-${sp.id}`} position={[sp.lat, sp.lng]} icon={shelterIcon()}>
          <Popup>
            <p style={{ fontWeight: 700, fontSize: 13 }}>{sp.name}</p>
            <p style={{ fontSize: 11, color: "#16A34A", fontWeight: 600, marginTop: 2 }}>Safe shelter</p>
            {sp.description && <p style={{ fontSize: 11, color: "#374151", marginTop: 2 }}>{sp.description}</p>}
            <p style={{ fontSize: 11, color: "#6B7280", marginTop: 2 }}>Capacity: {sp.currentCount}/{sp.capacity}</p>
          </Popup>
        </Marker>
      ))}

      {/* Rescue team positions */}
      {teamStatuses
        .filter((t) => t.lat !== null && t.lng !== null)
        .map((t) => (
          <Marker key={t.userId} position={[t.lat!, t.lng!]} icon={teamIcon(t.isAvailable)}>
            <Popup>
              <p style={{ fontWeight: 700, fontSize: 13 }}>Team #{t.userId}</p>
              <p style={{ fontSize: 11, color: t.isAvailable ? "#2563EB" : "#6B7280", fontWeight: 600, marginTop: 2 }}>
                {t.isAvailable ? "Available" : "On Mission"}
              </p>
            </Popup>
          </Marker>
        ))}

      {/* Leg 1: rescuer → victim (blue) */}
      {toVictimRoute && toVictimRoute.length > 1 && (
        <Polyline
          positions={toVictimRoute.map((c) => [c.lat, c.lng] as [number, number])}
          pathOptions={{ color: "#2563EB", weight: 5, opacity: 0.85 }}
        />
      )}

      {/* Leg 2: victim → shelter (green dashed) */}
      {toShelterRoute && toShelterRoute.length > 1 && (
        <Polyline
          positions={toShelterRoute.map((c) => [c.lat, c.lng] as [number, number])}
          pathOptions={{ color: "#16A34A", weight: 4, opacity: 0.75, dashArray: "10 6" }}
        />
      )}
    </>
  );
}
