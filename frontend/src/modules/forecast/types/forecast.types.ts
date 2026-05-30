export type Severity = "low" | "medium" | "high";
export type FloodType = "flash" | "river" | "coastal" | "urban";

export interface FloodZone {
  id: number;
  title: string;
  severity: Severity;
  floodType: FloodType | null;
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
  severity: Severity;
  floodType?: FloodType;
  lat: number;
  lng: number;
  radius: number;
  description?: string;
}
