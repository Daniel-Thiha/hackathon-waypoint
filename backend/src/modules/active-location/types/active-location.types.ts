export type ActiveRole = "Survivor" | "Volunteer" | "RescueTeam";

export interface ActiveLocationRecord {
  id: number;
  sessionId: string;
  role: ActiveRole;
  lat: number;
  lng: number;
  updatedAt: Date;
}

export interface UpsertLocationInput {
  sessionId: string;
  role: ActiveRole;
  lat: number;
  lng: number;
}
