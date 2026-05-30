import { prisma } from "../../../db";
import type { UpsertLocationInput } from "../types/active-location.types";

const STALE_MS = 60 * 60 * 1000; // 1 hour

export async function upsertLocation(input: UpsertLocationInput) {
  return prisma.activeLocation.upsert({
    where: { sessionId: input.sessionId },
    create: input,
    update: { lat: input.lat, lng: input.lng, role: input.role },
  });
}

export async function getActiveLocations() {
  const cutoff = new Date(Date.now() - STALE_MS);
  return prisma.activeLocation.findMany({
    where: { updatedAt: { gte: cutoff } },
    select: { sessionId: true, role: true, lat: true, lng: true },
  });
}

export async function deleteLocation(sessionId: string) {
  return prisma.activeLocation.deleteMany({ where: { sessionId } });
}
