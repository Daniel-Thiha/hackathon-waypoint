import api from "../../../api";
import type { ActiveLocation, UpsertLocationInput } from "../types/active-location.types";

export async function putMyLocation(input: UpsertLocationInput): Promise<void> {
  await api.put("/active-locations/me", input);
}

export async function getActiveLocations(): Promise<ActiveLocation[]> {
  const res = await api.get<{ locations: ActiveLocation[] }>("/active-locations");
  return res.data.locations;
}

export async function removeMyLocation(sessionId: string): Promise<void> {
  await api.delete("/active-locations/me", { data: { sessionId } });
}
