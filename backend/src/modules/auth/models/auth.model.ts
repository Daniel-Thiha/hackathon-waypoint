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
  return prisma.user.create({
    data: {
      username: input.username,
      password: hashedPassword,
      role: "RescueTeam",
      name: input.name ?? null,
      status: "active",
    },
  });
}
