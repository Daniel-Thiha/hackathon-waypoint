export type FloodSeverity = "low" | "medium" | "high";

export interface FloodZone {
  id: number;
  title: string;
  severity: FloodSeverity;
  lat: number;
  lng: number;
  radius: number;
  description: string | null;
  adminId: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFloodZoneInput {
  title: string;
  severity: FloodSeverity;
  lat: number;
  lng: number;
  radius: number;
  description?: string;
}
