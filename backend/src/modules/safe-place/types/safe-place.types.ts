export interface SafePlace {
  id: number;
  name: string;
  description: string | null;
  lat: number;
  lng: number;
  capacity: number;
  currentCount: number;
  hasFood: boolean;
  hasWater: boolean;
  supplies: string | null;
  adminId: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSafePlaceInput {
  name: string;
  description?: string;
  lat: number;
  lng: number;
  capacity: number;
  currentCount?: number;
  hasFood?: boolean;
  hasWater?: boolean;
  supplies?: string; // JSON: { item: string; scheduledAt: string }[]
}

export interface UpdateSafePlaceInput {
  name?: string;
  description?: string | null;
  lat?: number;
  lng?: number;
  capacity?: number;
  currentCount?: number;
  hasFood?: boolean;
  hasWater?: boolean;
  supplies?: string | null;
}
