export interface SupplyScheduleEntry {
  item: string;
  scheduledAt: string; // ISO datetime string
}

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
  supplies: string | null; // JSON: SupplyScheduleEntry[]
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
  hasFood?: boolean;
  hasWater?: boolean;
  supplies?: string; // JSON stringified SupplyScheduleEntry[]
}

export interface UpdateSafePlaceInput {
  name?: string;
  description?: string;
  capacity?: number;
  hasFood?: boolean;
  hasWater?: boolean;
  supplies?: string;
}
