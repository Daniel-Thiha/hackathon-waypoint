import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import bcrypt from "bcryptjs";

const adapter = new PrismaLibSql({
  url: process.env["DATABASE_URL"]!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  const [adminPassword, rescuePassword] = await Promise.all([
    bcrypt.hash("admin123", 10),
    bcrypt.hash("rescue123", 10),
  ]);

  await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: { username: "admin", password: adminPassword, role: "Admin" },
  });

  await prisma.user.upsert({
    where: { username: "rescue" },
    update: {},
    create: { username: "rescue", password: rescuePassword, role: "RescueTeam" },
  });

  console.log("Seeded: admin / admin123 (Admin), rescue / rescue123 (RescueTeam)");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
