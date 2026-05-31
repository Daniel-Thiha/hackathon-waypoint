import { prisma } from "../../../db";
import type { CreateRegistrationInput, CreateSosInput, UpdateLocationInput } from "../types/survivor.types";

// ── Registration ─────────────────────────────────────────────────────────────

function generateReferenceId(): string {
  const year = new Date().getFullYear();
  const rand = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `WP-${year}-${rand}`;
}

export async function createRegistration(input: CreateRegistrationInput) {
  return prisma.$transaction(async (tx) => {
    const reg = await tx.survivorRegistration.create({
      data: { ...input, referenceId: generateReferenceId() },
    });
    await tx.safePlace.update({
      where: { id: input.safePlaceId },
      data: { currentCount: { increment: 1 } },
    });
    return reg;
  });
}

export async function getRegistrationByReferenceId(referenceId: string) {
  return prisma.survivorRegistration.findUnique({ where: { referenceId } });
}

// ── SOS ──────────────────────────────────────────────────────────────────────

export async function createSosRequest(input: CreateSosInput) {
  if (!input.deviceId) {
    return prisma.sosRequest.create({ data: input });
  }
  // Upsert so a device that already has a pending/assigned SOS gets its location updated
  // instead of accumulating duplicates.
  const { deviceId, ...rest } = input;
  return prisma.sosRequest.upsert({
    where: { deviceId },
    update: { lat: rest.lat, lng: rest.lng, notes: rest.notes, safePlaceId: rest.safePlaceId ?? null, status: "pending", updatedAt: new Date() },
    create: { deviceId, ...rest },
  });
}

export async function getSosRequestByDeviceId(deviceId: string) {
  return prisma.sosRequest.findUnique({ where: { deviceId } });
}

export async function getAllSosRequests() {
  return prisma.sosRequest.findMany({ orderBy: { createdAt: "desc" } });
}

export async function getSosRequestById(id: number) {
  return prisma.sosRequest.findUnique({ where: { id } });
}

export async function updateSosSafePlaceId(id: number, safePlaceId: number) {
  return prisma.sosRequest.update({ where: { id }, data: { safePlaceId } });
}

export async function updateSosLocation(id: number, input: UpdateLocationInput) {
  return prisma.sosRequest.update({
    where: { id },
    data: { lastKnownLat: input.lat, lastKnownLng: input.lng },
  });
}

export async function assignSosRequest(id: number, rescuerId: number) {
  return prisma.sosRequest.update({
    where: { id },
    data: { status: "assigned", assignedRescuerId: rescuerId },
  });
}

export async function completeSosRequest(id: number) {
  return prisma.sosRequest.update({
    where: { id },
    data: { status: "completed" },
  });
}
