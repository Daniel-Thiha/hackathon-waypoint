import { useState, useEffect } from "react";
import { Marker, Polyline, CircleMarker, Popup } from "react-leaflet";
import { divIcon } from "leaflet";
import type { RescueTeamStatus } from "../types/rescue.types";
import type { SosRequest } from "../../survivor/types/survivor.types";
import type { SafePlace } from "../../safe-place/types/safe-place.types";
import { fetchDrivingRoute, fetchWalkingRoute } from "../utils/routing";
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

function targetShelterIcon() {
  return divIcon({
    html: `<div style="background:#16A34A;width:34px;height:34px;border-radius:8px;border:3px solid #fff;box-shadow:0 0 0 3px #16A34A,0 4px 12px rgba(0,0,0,.35);display:flex;align-items:center;justify-content:center;font-size:17px;">🏥</div>`,
    className: "",
    iconSize: [34, 34],
    iconAnchor: [17, 17],
  });
}

function dist(a: LatLng, b: { lat: number; lng: number }) {
  return Math.hypot(a.lat - b.lat, a.lng - b.lng);
}

function pickShelter(safePlaces: SafePlace[], registeredId: number | null, victimPos: LatLng): SafePlace | null {
  if (safePlaces.length === 0) return null;

  if (registeredId != null) {
    const registered = safePlaces.find((sp) => sp.id === registeredId);
    if (registered) return registered;
  }

  // Nearest with available capacity, fallback to nearest regardless of capacity
  const available = safePlaces.filter((sp) => sp.currentCount < sp.capacity);
  const pool = available.length > 0 ? available : safePlaces;
  return pool.reduce((best, sp) => dist(victimPos, sp) < dist(victimPos, best) ? sp : best);
}

interface RescueTeamLayerProps {
  teamStatuses: RescueTeamStatus[];
  sosRequests: SosRequest[];
  safePlaces?: SafePlace[];
  activeRescuerId: number | null;
  activeSosRequestId?: number | null;
}

export function RescueTeamLayer({ teamStatuses, sosRequests, safePlaces = [], activeRescuerId, activeSosRequestId }: RescueTeamLayerProps) {
  const [toVictimRoute, setToVictimRoute] = useState<LatLng[] | null>(null);
  const [toShelterRoute, setToShelterRoute] = useState<LatLng[] | null>(null);
  const [targetShelterId, setTargetShelterId] = useState<number | null>(null);

  useEffect(() => {
    if (!activeRescuerId) {
      setToVictimRoute(null);
      setToShelterRoute(null);
      setTargetShelterId(null);
      return;
    }

    const rescuer = teamStatuses.find((t) => t.userId === activeRescuerId);
    const assignedSos = activeSosRequestId != null
      ? sosRequests.find((s) => s.id === activeSosRequestId)
      : sosRequests.find((s) => s.assignedRescuerId === activeRescuerId && s.status === "assigned");

    if (!assignedSos) {
      setToVictimRoute(null);
      setToShelterRoute(null);
      setTargetShelterId(null);
      return;
    }

    const victimPos: LatLng = {
      lat: assignedSos.lastKnownLat ?? assignedSos.lat,
      lng: assignedSos.lastKnownLng ?? assignedSos.lng,
    };

    // Leg 1: rescuer → victim (driving route)
    if (rescuer?.lat && rescuer?.lng) {
      fetchDrivingRoute({ lat: rescuer.lat, lng: rescuer.lng }, victimPos)
        .then(setToVictimRoute)
        .catch(() => setToVictimRoute(null));
    } else {
      setToVictimRoute(null);
    }

    // Leg 2: victim → shelter (walking route)
    const shelter = pickShelter(safePlaces, assignedSos.safePlaceId, victimPos);
    if (shelter) {
      setTargetShelterId(shelter.id);
      fetchWalkingRoute(victimPos, { lat: shelter.lat, lng: shelter.lng })
        .then(setToShelterRoute)
        .catch(() => setToShelterRoute(null));
    } else {
      setTargetShelterId(null);
      setToShelterRoute(null);
    }
  }, [activeRescuerId, activeSosRequestId, teamStatuses, sosRequests, safePlaces]);

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

      {/* Safe place markers — target shelter rendered larger/highlighted */}
      {safePlaces.map((sp) => (
        <Marker
          key={`shelter-${sp.id}`}
          position={[sp.lat, sp.lng]}
          icon={sp.id === targetShelterId ? targetShelterIcon() : shelterIcon()}
          zIndexOffset={sp.id === targetShelterId ? 1000 : 0}
        >
          <Popup>
            <p style={{ fontWeight: 700, fontSize: 13 }}>{sp.name}</p>
            {sp.id === targetShelterId && (
              <p style={{ fontSize: 11, color: "#16A34A", fontWeight: 700, marginTop: 2 }}>📍 Destination</p>
            )}
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

      {/* Leg 1: rescuer → victim (blue solid) */}
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
          pathOptions={{ color: "#16A34A", weight: 4, opacity: 0.8, dashArray: "10 6" }}
        />
      )}
    </>
  );
}
