import { prisma } from "../../../db";
import type { CreateSafePlaceInput, UpdateSafePlaceInput } from "../types/safe-place.types";

export function listSafePlaces() {
  return prisma.safePlace.findMany({ orderBy: { createdAt: "desc" } });
}

export function createSafePlace(input: CreateSafePlaceInput, adminId: number) {
  return prisma.safePlace.create({
    data: {
      name: input.name,
      description: input.description ?? null,
      lat: input.lat,
      lng: input.lng,
      capacity: input.capacity,
      currentCount: input.currentCount ?? 0,
      hasFood: input.hasFood ?? false,
      hasWater: input.hasWater ?? false,
      supplies: input.supplies ?? null,
      adminId,
    },
  });
}

export function updateSafePlace(id: number, input: UpdateSafePlaceInput) {
  return prisma.safePlace.update({ where: { id }, data: input });
}

export function deleteSafePlace(id: number) {
  return prisma.safePlace.delete({ where: { id } });
}

export function findSafePlaceById(id: number) {
  return prisma.safePlace.findUnique({ where: { id } });
}
