import api from "../../../api";
import type { FloodZone, CreateFloodZoneInput } from "../types/forecast.types";

export async function listFloodZones(): Promise<FloodZone[]> {
  const res = await api.get<FloodZone[]>("/forecast");
  return Array.isArray(res.data) ? res.data : [];
}

export async function createFloodZone(input: CreateFloodZoneInput): Promise<FloodZone> {
  const res = await api.post<FloodZone>("/forecast", input);
  return res.data;
}

export async function deleteFloodZone(id: number): Promise<void> {
  await api.delete(`/forecast/${id}`);
}

export async function updateFloodZone(
  id: number,
  input: Partial<CreateFloodZoneInput>
): Promise<FloodZone> {
  const res = await api.put<FloodZone>(`/forecast/${id}`, input);
  return res.data;
}
