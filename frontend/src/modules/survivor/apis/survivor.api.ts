import api from "../../../api";
import type {
  SurvivorRegistration,
  CreateRegistrationInput,
  SosRequest,
  CreateSosInput,
} from "../types/survivor.types";

// ── Registration ─────────────────────────────────────────────────────────────

export async function registerSurvivor(
  input: CreateRegistrationInput
): Promise<SurvivorRegistration> {
  const res = await api.post<SurvivorRegistration>("/survivor/register", input);
  return res.data;
}

export async function getRegistration(referenceId: string): Promise<SurvivorRegistration> {
  const res = await api.get<SurvivorRegistration>(`/survivor/register/${referenceId}`);
  return res.data;
}

// ── SOS ──────────────────────────────────────────────────────────────────────

export async function createSosRequest(input: CreateSosInput): Promise<SosRequest> {
  const res = await api.post<SosRequest>("/survivor/sos", input);
  return res.data;
}

export async function listSosRequests(): Promise<SosRequest[]> {
  const res = await api.get<SosRequest[]>("/survivor/sos");
  return res.data;
}

export async function getSosRequest(id: number): Promise<SosRequest> {
  const res = await api.get<SosRequest>(`/survivor/sos/${id}`);
  return res.data;
}

export async function getSosStatus(id: number): Promise<{ id: number; status: SosStatus; assignedRescuerId: number | null }> {
  const res = await api.get<{ id: number; status: SosStatus; assignedRescuerId: number | null }>(`/survivor/sos/${id}/status`);
  return res.data;
}

export async function updateSurvivorLocation(
  sosId: number,
  lat: number,
  lng: number
): Promise<SosRequest> {
  const res = await api.patch<SosRequest>(`/survivor/sos/${sosId}/location`, { lat, lng });
  return res.data;
}
