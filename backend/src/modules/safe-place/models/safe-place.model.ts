import { prisma } from "../../../db";
import type { CreateSafePlaceInput, UpdateSafePlaceInput } from "../types/safe-place.types";

export async function getAllSafePlaces() {
  return prisma.safePlace.findMany({ orderBy: { createdAt: "desc" } });
}

export async function listSafePlaces() {
  return prisma.safePlace.findMany({ orderBy: { name: "asc" } });
}

export async function getSafePlaceById(id: number) {
  return prisma.safePlace.findUnique({ where: { id } });
}

export async function createSafePlace(input: CreateSafePlaceInput, adminId: number) {
  return prisma.safePlace.create({ data: { ...input, adminId } });
}

export async function updateSafePlace(id: number, input: UpdateSafePlaceInput) {
  return prisma.safePlace.update({ where: { id }, data: input });
}

export async function deleteSafePlace(id: number) {
  return prisma.safePlace.delete({ where: { id } });
}

export async function incrementOccupancy(id: number) {
  return prisma.safePlace.update({
    where: { id },
    data: { currentCount: { increment: 1 } },
  });
}
