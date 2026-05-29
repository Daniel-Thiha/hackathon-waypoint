import { prisma } from "../../../db";

export async function findUserByUsername(username: string) {
  return prisma.user.findUnique({ where: { username } });
}
