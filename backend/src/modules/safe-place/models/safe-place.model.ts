import { prisma } from "../../../db";

export async function listSafePlaces() {
  return prisma.safePlace.findMany({ orderBy: { name: "asc" } });
}

export async function getSafePlaceById(id: number) {
  return prisma.safePlace.findUnique({ where: { id } });
}
