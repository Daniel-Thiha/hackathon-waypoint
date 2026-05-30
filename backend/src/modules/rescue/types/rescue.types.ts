export type MissionStatus = "active" | "completed";

export interface RescueMission {
  id: number;
  sosRequestId: number;
  rescuerId: number;
  status: MissionStatus;
  startedAt: Date;
  completedAt: Date | null;
}

export interface RescueTeamStatus {
  id: number;
  userId: number;
  isAvailable: boolean;
  lat: number | null;
  lng: number | null;
  updatedAt: Date;
}

export interface AcceptSosInput {
  sosRequestId: number;
}

export interface UpdatePositionInput {
  lat: number;
  lng: number;
}

export interface SetAvailabilityInput {
  isAvailable: boolean;
}
