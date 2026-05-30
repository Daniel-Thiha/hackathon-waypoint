import { prisma } from "../../../db";

export async function listSosRequests() {
  return prisma.sosRequest.findMany({ orderBy: { createdAt: "desc" } });
}

export async function assignSosRequest(sosRequestId: number, rescuerId: number) {
  return prisma.sosRequest.update({
    where: { id: sosRequestId },
    data: { status: "assigned", assignedRescuerId: rescuerId },
  });
}

export async function completeSosRequest(sosRequestId: number) {
  return prisma.sosRequest.update({
    where: { id: sosRequestId },
    data: { status: "completed" },
  });
}
