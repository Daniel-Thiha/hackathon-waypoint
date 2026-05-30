export type MissionStatus = "active" | "completed";

export interface RescueMission {
  id: number;
  sosRequestId: number;
  rescuerId: number;
  status: MissionStatus;
  startedAt: string;
  completedAt: string | null;
}

export interface RescueTeamStatus {
  id: number;
  userId: number;
  isAvailable: boolean;
  lat: number | null;
  lng: number | null;
  updatedAt: string;
}
