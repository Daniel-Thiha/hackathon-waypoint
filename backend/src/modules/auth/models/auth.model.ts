import bcrypt from "bcryptjs";
import { prisma } from "../../../db";
import type { RegisterInput } from "../types/auth.types";

export async function findUserByUsername(username: string) {
  return prisma.user.findUnique({ where: { username } });
}

export async function findUserById(id: number) {
  return prisma.user.findUnique({ where: { id } });
}

export async function createUser(input: RegisterInput) {
  const hashedPassword = await bcrypt.hash(input.password, 10);
  const status = input.role === "RescueTeam" ? "pending" : "active";

  return prisma.user.create({
    data: {
      username: input.username,
      password: hashedPassword,
      role: input.role,
      name: input.name ?? null,
      rescuerType: input.rescuerType ?? null,
      status,
    },
  });
}

export async function findPendingRescuers() {
  return prisma.user.findMany({
    where: { status: "pending" },
    select: { id: true, username: true, role: true, name: true, rescuerType: true, status: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });
}

export async function updateUserStatus(id: number, status: "active" | "rejected") {
  return prisma.user.update({ where: { id }, data: { status } });
}
