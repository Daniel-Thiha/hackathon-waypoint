import { prisma } from "../../../db";
import type { UpdatePositionInput, SetAvailabilityInput } from "../types/rescue.types";

// ── Missions ─────────────────────────────────────────────────────────────────

export async function createMission(sosRequestId: number, rescuerId: number) {
  return prisma.rescueMission.create({ data: { sosRequestId, rescuerId } });
}

export async function getMissionById(id: number) {
  return prisma.rescueMission.findUnique({ where: { id } });
}

export async function getActiveMissions() {
  return prisma.rescueMission.findMany({
    where: { status: "active" },
    orderBy: { startedAt: "desc" },
  });
}

export async function completeMission(id: number) {
  return prisma.rescueMission.update({
    where: { id },
    data: { status: "completed", completedAt: new Date() },
  });
}

// ── Team Status ───────────────────────────────────────────────────────────────

export async function getAllTeamStatuses() {
  return prisma.rescueTeamStatus.findMany();
}

export async function upsertTeamStatus(userId: number, input: SetAvailabilityInput) {
  return prisma.rescueTeamStatus.upsert({
    where: { userId },
    update: { isAvailable: input.isAvailable },
    create: { userId, isAvailable: input.isAvailable },
  });
}

export async function updateTeamPosition(userId: number, input: UpdatePositionInput) {
  return prisma.rescueTeamStatus.upsert({
    where: { userId },
    update: { lat: input.lat, lng: input.lng },
    create: { userId, lat: input.lat, lng: input.lng, isAvailable: true },
  });
}
