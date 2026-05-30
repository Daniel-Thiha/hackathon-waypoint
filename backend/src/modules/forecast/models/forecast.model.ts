import { prisma } from "../../../db";
import type { CreateFloodZoneInput, UpdateFloodZoneInput } from "../types/forecast.types";

export function listFloodZones() {
  return prisma.floodZone.findMany({ orderBy: { createdAt: "desc" } });
}

export function createFloodZone(input: CreateFloodZoneInput, adminId: number) {
  return prisma.floodZone.create({
    data: {
      title: input.title,
      severity: input.severity,
      floodType: input.floodType ?? null,
      lat: input.lat,
      lng: input.lng,
      radius: input.radius,
      description: input.description ?? null,
      adminId,
    },
  });
}

export function updateFloodZone(id: number, input: UpdateFloodZoneInput) {
  return prisma.floodZone.update({ where: { id }, data: input });
}

export function deleteFloodZone(id: number) {
  return prisma.floodZone.delete({ where: { id } });
}

export function findFloodZoneById(id: number) {
  return prisma.floodZone.findUnique({ where: { id } });
}
