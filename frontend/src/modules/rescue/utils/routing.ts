import type { LatLng } from "../../map/types/map.types";

interface OSRMResponse {
  routes: { geometry: { coordinates: [number, number][] } }[];
}

async function osrmRoute(profile: "driving" | "foot", from: LatLng, to: LatLng): Promise<LatLng[]> {
  const base = profile === "foot"
    ? "https://routing.openstreetmap.de/routed-foot/route/v1/foot"
    : "https://router.project-osrm.org/route/v1/driving";
  const url = `${base}/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Route request failed");
  const data = (await res.json()) as OSRMResponse;
  if (!data.routes.length) throw new Error("No route found");
  return data.routes[0].geometry.coordinates.map(([lng, lat]) => ({ lat, lng }));
}

/** Rescuer vehicle route — follows driveable roads */
export function fetchDrivingRoute(from: LatLng, to: LatLng): Promise<LatLng[]> {
  return osrmRoute("driving", from, to);
}

/** Survivor foot route — follows walkable paths */
export function fetchWalkingRoute(from: LatLng, to: LatLng): Promise<LatLng[]> {
  return osrmRoute("foot", from, to).catch(() => osrmRoute("driving", from, to));
}

/** @deprecated use fetchDrivingRoute or fetchWalkingRoute */
export function fetchRoute(from: LatLng, to: LatLng): Promise<LatLng[]> {
  return fetchDrivingRoute(from, to);
}
