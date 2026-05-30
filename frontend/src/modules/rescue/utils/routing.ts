import type { LatLng } from "../../map/types/map.types";

interface OSRMResponse {
  routes: { geometry: { coordinates: [number, number][] } }[];
}

export async function fetchRoute(from: LatLng, to: LatLng): Promise<LatLng[]> {
  const url =
    `https://router.project-osrm.org/route/v1/driving/` +
    `${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Route request failed");
  const data = (await res.json()) as OSRMResponse;
  if (!data.routes.length) throw new Error("No route found");
  return data.routes[0].geometry.coordinates.map(([lng, lat]) => ({ lat, lng }));
}
