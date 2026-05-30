export type ActiveRole = "Survivor" | "Volunteer" | "RescueTeam";

export interface ActiveLocation {
  sessionId: string;
  role: ActiveRole;
  lat: number;
  lng: number;
}

export interface UpsertLocationInput {
  sessionId: string;
  role: ActiveRole;
  lat: number;
  lng: number;
}
