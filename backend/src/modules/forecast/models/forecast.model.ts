import { prisma } from "../../../db";
import type { CreateFloodZoneInput, UpdateFloodZoneInput } from "../types/forecast.types";

export async function getAllFloodZones() {
  return prisma.floodZone.findMany({ orderBy: { createdAt: "desc" } });
}

export async function getFloodZoneById(id: number) {
  return prisma.floodZone.findUnique({ where: { id } });
}

export async function createFloodZone(input: CreateFloodZoneInput, adminId: number) {
  return prisma.floodZone.create({ data: { ...input, adminId } });
}

export async function updateFloodZone(id: number, input: UpdateFloodZoneInput) {
  return prisma.floodZone.update({ where: { id }, data: input });
}

export async function deleteFloodZone(id: number) {
  return prisma.floodZone.delete({ where: { id } });
}
