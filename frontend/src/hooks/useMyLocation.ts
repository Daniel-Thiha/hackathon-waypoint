import { useState, useEffect, useMemo } from "react";
import { putMyLocation, removeMyLocation } from "../modules/active-location/apis/active-location.api";
import type { ActiveRole } from "../modules/active-location/types/active-location.types";
import type { MapViewerRole } from "../modules/map/contexts/MapContext";

export interface MyLocation {
  lat: number;
  lng: number;
}

const GEO_OPTS: PositionOptions = {
  enableHighAccuracy: false, // high-accuracy requires GPS hardware; false uses network/IP, works on all devices
  maximumAge: 30000,
  timeout: 10000,
};

export function useMyLocation(viewerRole: MapViewerRole, userId: number | undefined, enabled = true) {
  // Admins are never tracked; also skip while auth is still resolving (enabled=false)
  const shouldShare = enabled && viewerRole !== "Admin";

  const sessionId = useMemo<string | null>(() => {
    if (!shouldShare) return null;
    if (userId && (viewerRole === "Volunteer" || viewerRole === "RescueTeam")) return `u-${userId}`;
    let sid = localStorage.getItem("survivor-loc-session");
    if (!sid) {
      sid = crypto.randomUUID();
      localStorage.setItem("survivor-loc-session", sid);
    }
    return sid;
  }, [shouldShare, viewerRole, userId]);

  const role: ActiveRole = (
    viewerRole === "Volunteer" || viewerRole === "RescueTeam"
  ) ? viewerRole : "Survivor";

  const [myLocation, setMyLocation] = useState<MyLocation | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);

  useEffect(() => {
    if (!shouldShare || !sessionId) return;
    if (!navigator.geolocation) return;

    function onPosition({ coords }: GeolocationPosition) {
      const loc: MyLocation = { lat: coords.latitude, lng: coords.longitude };
      setMyLocation(loc);
      putMyLocation({ sessionId: sessionId!, role, lat: loc.lat, lng: loc.lng }).catch(() => {});
    }

    function onError({ code }: GeolocationPositionError) {
      if (code === 1) setPermissionDenied(true); // 1 = PERMISSION_DENIED
    }

    // Get an immediate fix first, then watch for updates
    navigator.geolocation.getCurrentPosition(onPosition, onError, GEO_OPTS);
    const watchId = navigator.geolocation.watchPosition(onPosition, onError, GEO_OPTS);

    return () => {
      navigator.geolocation.clearWatch(watchId);
      removeMyLocation(sessionId).catch(() => {});
    };
  }, [shouldShare, sessionId, role]);

  return { myLocation, permissionDenied, sessionId };
}
