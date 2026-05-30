import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import bcrypt from "bcryptjs";

const adapter = new PrismaLibSql({ url: process.env["DATABASE_URL"]! });
const prisma = new PrismaClient({ adapter });

async function main() {
  // ── Users ────────────────────────────────────────────────────────────────────
  const [adminPw, rescuePw] = await Promise.all([
    bcrypt.hash("admin123", 10),
    bcrypt.hash("rescue123", 10),
  ]);

  const admin = await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: { username: "admin", password: adminPw, role: "Admin", status: "active" },
  });

  const r1 = await prisma.user.upsert({
    where: { username: "rescue1" },
    update: {},
    create: { username: "rescue1", password: rescuePw, role: "RescueTeam", name: "Alpha Emergency Team", status: "active" },
  });

  const r2 = await prisma.user.upsert({
    where: { username: "rescue2" },
    update: {},
    create: { username: "rescue2", password: rescuePw, role: "RescueTeam", name: "Bangkok Rapid Response Unit", status: "active" },
  });

  const r3 = await prisma.user.upsert({
    where: { username: "rescue3" },
    update: {},
    create: { username: "rescue3", password: rescuePw, role: "RescueTeam", name: "Civil Defense Volunteers", status: "active" },
  });

  console.log(`✓ Users: admin / rescue1 / rescue2 / rescue3`);

  // ── Flood Zones ───────────────────────────────────────────────────────────────
  await prisma.floodZone.deleteMany();
  await prisma.floodZone.createMany({
    data: [
      {
        title: "Lat Krabang – Critical Flooding",
        severity: "high",
        lat: 13.7288,
        lng: 100.7479,
        radius: 2200,
        description: "Severe flooding in residential areas. Water levels rising. Evacuation strongly advised.",
        adminId: admin.id,
      },
      {
        title: "Riverside Bangkok – Moderate Flood",
        severity: "medium",
        lat: 13.7350,
        lng: 100.4825,
        radius: 1800,
        description: "Roads partially submerged. Ground floors affected. Use elevated routes.",
        adminId: admin.id,
      },
      {
        title: "Northern Bangkok – Flood Watch",
        severity: "low",
        lat: 13.8800,
        lng: 100.5400,
        radius: 2500,
        description: "Monitoring active. Light flooding expected over the next 24 hours.",
        adminId: admin.id,
      },
    ],
  });
  console.log("✓ FloodZones: 3 zones seeded");

  // ── Safe Places ───────────────────────────────────────────────────────────────
  await prisma.safePlace.deleteMany();
  const [sp1, sp2, sp3, sp4] = await Promise.all([
    prisma.safePlace.create({
      data: {
        name: "Hua Mak Sports Complex",
        description: "Medical aid, food distribution, sanitation facilities",
        lat: 13.7408,
        lng: 100.6350,
        capacity: 1200,
        currentCount: 340,
        hasFood: true,
        hasWater: true,
        adminId: admin.id,
      },
    }),
    prisma.safePlace.create({
      data: {
        name: "Community Center Bangrak",
        description: "Water and basic supplies. Ground floor only — accessible by foot.",
        lat: 13.7281,
        lng: 100.5149,
        capacity: 500,
        currentCount: 178,
        hasFood: true,
        hasWater: true,
        adminId: admin.id,
      },
    }),
    prisma.safePlace.create({
      data: {
        name: "BITEC Emergency Shelter",
        description: "Large capacity facility with full medical and food services.",
        lat: 13.7018,
        lng: 100.7059,
        capacity: 3000,
        currentCount: 2940,
        hasFood: true,
        hasWater: true,
        adminId: admin.id,
      },
    }),
    prisma.safePlace.create({
      data: {
        name: "Kasetsart University Gym",
        description: "University sports hall converted to emergency shelter. North campus.",
        lat: 13.8479,
        lng: 100.5694,
        capacity: 1500,
        currentCount: 610,
        hasFood: false,
        hasWater: true,
        adminId: admin.id,
      },
    }),
  ]);
  console.log("✓ SafePlaces: 4 shelters seeded");

  // ── Rescue Team Statuses (positions on map) ────────────────────────────────
  await prisma.rescueTeamStatus.upsert({
    where: { userId: r1.id },
    update: { lat: 13.7580, lng: 100.5020, isAvailable: true },
    create: { userId: r1.id, lat: 13.7580, lng: 100.5020, isAvailable: true },
  });
  await prisma.rescueTeamStatus.upsert({
    where: { userId: r2.id },
    update: { lat: 13.7820, lng: 100.4950, isAvailable: false },
    create: { userId: r2.id, lat: 13.7820, lng: 100.4950, isAvailable: false },
  });
  await prisma.rescueTeamStatus.upsert({
    where: { userId: r3.id },
    update: { lat: 13.7100, lng: 100.6900, isAvailable: true },
    create: { userId: r3.id, lat: 13.7100, lng: 100.6900, isAvailable: true },
  });
  console.log("✓ RescueTeamStatus: 3 teams positioned");

  // ── Clear stale active locations (only real live sessions should exist) ──────
  await prisma.activeLocation.deleteMany();
  console.log("✓ ActiveLocations: cleared (only live sessions will populate this)");

  // ── Summary ───────────────────────────────────────────────────────────────────
  console.log("\n🗺  Demo data ready:");
  console.log(`   • 3 flood zones  (1 critical, 1 moderate, 1 watch)`);
  console.log(`   • 4 safe shelters  (${sp1.name}, ${sp2.name}, ${sp3.name}, ${sp4.name})`);
  console.log(`   • 3 rescue teams  (2 available, 1 on mission)`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
