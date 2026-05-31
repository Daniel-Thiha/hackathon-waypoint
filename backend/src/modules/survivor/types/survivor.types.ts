export type SosStatus = "pending" | "assigned" | "completed";

export interface SurvivorRegistration {
  id: number;
  referenceId: string;
  name: string;
  phone: string | null;
  lat: number;
  lng: number;
  safePlaceId: number;
  createdAt: Date;
}

export interface CreateRegistrationInput {
  name: string;
  phone?: string;
  lat: number;
  lng: number;
  safePlaceId: number;
}

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
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSosInput {
  deviceId?: string;
  survivorName: string;
  phone?: string;
  lat: number;
  lng: number;
  notes?: string;
  safePlaceId?: number;
}

export interface UpdateLocationInput {
  lat: number;
  lng: number;
}
