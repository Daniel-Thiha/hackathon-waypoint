export interface Supply {
  id?: string; // generated dynamically for tracking/react keys
  item: string;
  scheduledAt: string;
  quantity: string;
  description: string;
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
  supplies: string | null; // JSON string containing Supply[]
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
  currentCount?: number;
  hasFood?: boolean;
  hasWater?: boolean;
  supplies?: string | null;
}
