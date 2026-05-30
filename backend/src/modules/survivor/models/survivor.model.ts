import { prisma } from "../../../db";
import type { CreateRegistrationInput, CreateSosInput, UpdateLocationInput } from "../types/survivor.types";

// ── Registration ─────────────────────────────────────────────────────────────

function generateReferenceId(): string {
  const year = new Date().getFullYear();
  const rand = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `WP-${year}-${rand}`;
}

export async function createRegistration(input: CreateRegistrationInput) {
  return prisma.survivorRegistration.create({
    data: { ...input, referenceId: generateReferenceId() },
  });
}

export async function getRegistrationByReferenceId(referenceId: string) {
  return prisma.survivorRegistration.findUnique({ where: { referenceId } });
}

// ── SOS ──────────────────────────────────────────────────────────────────────

export async function createSosRequest(input: CreateSosInput) {
  return prisma.sosRequest.create({ data: input });
}

export async function getAllSosRequests() {
  return prisma.sosRequest.findMany({ orderBy: { createdAt: "desc" } });
}

export async function getSosRequestById(id: number) {
  return prisma.sosRequest.findUnique({ where: { id } });
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
