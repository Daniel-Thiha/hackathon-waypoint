export type SosStatus = "pending" | "assigned" | "completed";

export interface SosRequest {
  id: number;
  survivorName: string;
  phone: string | null;
  lat: number;
  lng: number;
  lastKnownLat: number | null;
  lastKnownLng: number | null;
  notes: string | null;
  safePlaceId: number | null;
  status: SosStatus;
  assignedRescuerId: number | null;
  createdAt: string;
  updatedAt: string;
}
