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
  supplies: SupplyScheduleEntry[] | null; // parsed from JSON string
  adminId: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSafePlaceInput {
  name: string;
  description?: string;
  lat: number;
  lng: number;
  capacity: number;
  hasFood?: boolean;
  hasWater?: boolean;
  supplies?: SupplyScheduleEntry[];
}
