import api from "../../../api";
import type { RescueMission, RescueTeamStatus } from "../types/rescue.types";

// ── Missions ─────────────────────────────────────────────────────────────────

export async function listActiveMissions(): Promise<RescueMission[]> {
  const res = await api.get<RescueMission[]>("/rescue/missions");
  return res.data;
}

export async function acceptSos(sosRequestId: number): Promise<RescueMission> {
  const res = await api.post<RescueMission>("/rescue/missions/accept", { sosRequestId });
  return res.data;
}

export async function completeMission(missionId: number): Promise<RescueMission> {
  const res = await api.patch<RescueMission>(`/rescue/missions/${missionId}/complete`);
  return res.data;
}

// ── Team Status ───────────────────────────────────────────────────────────────

export async function listTeamStatuses(): Promise<RescueTeamStatus[]> {
  const res = await api.get<RescueTeamStatus[]>("/rescue/team-status");
  return res.data;
}

export async function setAvailability(isAvailable: boolean): Promise<RescueTeamStatus> {
  const res = await api.patch<RescueTeamStatus>("/rescue/status/availability", { isAvailable });
  return res.data;
}

export async function updateMyPosition(lat: number, lng: number): Promise<RescueTeamStatus> {
  const res = await api.patch<RescueTeamStatus>("/rescue/status/position", { lat, lng });
  return res.data;
}
