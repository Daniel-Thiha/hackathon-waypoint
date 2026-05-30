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
