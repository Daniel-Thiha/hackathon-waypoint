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
  // Zone 1 – Lat Krabang (eastern Bangkok): ~13.7288, 100.7479, r=2200m
  // Zone 2 – Riverside/Thon Buri (western Bangkok): ~13.7350, 100.4825, r=1800m
  // Zone 3 – Northern Bangkok (Pathum Thani border): ~13.8800, 100.5400, r=2500m
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
        title: "Thon Buri Riverside – Moderate Flood",
        severity: "medium",
        lat: 13.7350,
        lng: 100.4825,
        radius: 1800,
        description: "Roads partially submerged near the river. Ground floors affected. Use elevated routes.",
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
  // Placed outside flood zones on higher ground / robust buildings, within
  // reasonable evacuation distance from each zone.
  await prisma.safePlace.deleteMany();
  const [sp1, sp2, sp3, sp4] = await Promise.all([
    // NW of Lat Krabang zone (~6 km) — university campus, large & sturdy
    prisma.safePlace.create({
      data: {
        name: "Ramkhamhaeng University Shelter",
        description: "Medical aid, food distribution, sanitation. Main gymnasium building.",
        lat: 13.7574,
        lng: 100.6864,
        capacity: 1500,
        currentCount: 420,
        hasFood: true,
        hasWater: true,
        adminId: admin.id,
      },
    }),
    // SE of Riverside zone (~4.5 km) — inner-city elevated area
    prisma.safePlace.create({
      data: {
        name: "Silom Community Relief Center",
        description: "Water, food and basic medical supplies. Multi-storey building, ground floor accessible.",
        lat: 13.7180,
        lng: 100.5190,
        capacity: 600,
        currentCount: 600,
        hasFood: true,
        hasWater: true,
        adminId: admin.id,
      },
    }),
    // S of Northern zone (~5 km) — main road corridor
    prisma.safePlace.create({
      data: {
        name: "Laksi District Emergency Hub",
        description: "Large open facility on Vibhavadi-Rangsit road. Full medical and supply station.",
        lat: 13.8350,
        lng: 100.5610,
        capacity: 1000,
        currentCount: 75,
        hasFood: true,
        hasWater: true,
        adminId: admin.id,
      },
    }),
    // Central Bangkok — serves all zones as overflow, safely elevated
    prisma.safePlace.create({
      data: {
        name: "Hua Mak Indoor Stadium",
        description: "Large covered arena. Full capacity shelter with coordinated supply drops.",
        lat: 13.7450,
        lng: 100.6530,
        capacity: 2500,
        currentCount: 860,
        hasFood: true,
        hasWater: true,
        adminId: admin.id,
      },
    }),
  ]);
  console.log("✓ SafePlaces: 4 shelters seeded");

  // ── Rescue Team Statuses ───────────────────────────────────────────────────
  // Teams are staged just outside their respective flood zones, all available.
  await prisma.rescueMission.deleteMany();
  await prisma.rescueTeamStatus.upsert({
    where:  { userId: r1.id },
    // NW staging point for Lat Krabang zone
    update: { lat: 13.7490, lng: 100.7240, isAvailable: true },
    create: { userId: r1.id, lat: 13.7490, lng: 100.7240, isAvailable: true },
  });
  await prisma.rescueTeamStatus.upsert({
    where:  { userId: r2.id },
    // N staging point for Riverside zone
    update: { lat: 13.7530, lng: 100.4820, isAvailable: true },
    create: { userId: r2.id, lat: 13.7530, lng: 100.4820, isAvailable: true },
  });
  await prisma.rescueTeamStatus.upsert({
    where:  { userId: r3.id },
    // S staging point for Northern zone
    update: { lat: 13.8570, lng: 100.5410, isAvailable: true },
    create: { userId: r3.id, lat: 13.8570, lng: 100.5410, isAvailable: true },
  });
  console.log("✓ RescueTeamStatus: 3 teams staged outside zones, all available");

  // ── SOS Requests ─────────────────────────────────────────────────────────────
  // All pending — no pre-assignments. Survivors placed inside flood zones.
  await prisma.sosRequest.deleteMany();
  await prisma.sosRequest.createMany({
    data: [
      // ── Lat Krabang critical zone (5 survivors) ──────────────────────────
      {
        deviceId: "seed-device-001",
        survivorName: "Somchai Jaidee",
        phone: "081-234-5001",
        lat: 13.7250,
        lng: 100.7420,
        notes: "Stranded on rooftop with 3 others",
        status: "pending",
      },
      {
        deviceId: "seed-device-002",
        survivorName: "Nida Phongphan",
        phone: "082-345-6002",
        lat: 13.7340,
        lng: 100.7530,
        notes: "Elderly, needs medical assistance",
        status: "pending",
      },
      {
        deviceId: "seed-device-003",
        survivorName: "Prawit Suksri",
        phone: null,
        lat: 13.7195,
        lng: 100.7390,
        notes: "Family of 5, first floor fully submerged",
        status: "pending",
      },
      {
        deviceId: "seed-device-004",
        survivorName: "Malee Wongthong",
        phone: "083-456-7003",
        lat: 13.7270,
        lng: 100.7580,
        notes: null,
        status: "pending",
      },
      {
        deviceId: "seed-device-005",
        survivorName: "Chaiwat Duangjai",
        phone: "084-111-2233",
        lat: 13.7380,
        lng: 100.7460,
        notes: "Diabetic, needs insulin urgently",
        status: "pending",
      },
      // ── Thon Buri Riverside moderate zone (3 survivors) ──────────────────
      {
        deviceId: "seed-device-006",
        survivorName: "Korn Rattanapruk",
        phone: "084-567-8004",
        lat: 13.7370,
        lng: 100.4860,
        notes: "Car stalled in floodwater, 2 passengers",
        status: "pending",
      },
      {
        deviceId: "seed-device-007",
        survivorName: "Supatra Charoenwit",
        phone: null,
        lat: 13.7290,
        lng: 100.4790,
        notes: "Two small children, needs immediate evacuation",
        status: "pending",
      },
      {
        deviceId: "seed-device-008",
        survivorName: "Anon Boonmee",
        phone: "085-678-9005",
        lat: 13.7430,
        lng: 100.4900,
        notes: null,
        status: "pending",
      },
      // ── Northern Bangkok watch zone (2 survivors) ─────────────────────────
      {
        deviceId: "seed-device-009",
        survivorName: "Ratree Phanomwan",
        phone: "086-789-0006",
        lat: 13.8830,
        lng: 100.5370,
        notes: "Motorcycle submerged, on foot",
        status: "pending",
      },
      {
        deviceId: "seed-device-010",
        survivorName: "Thana Lertsiri",
        phone: null,
        lat: 13.8750,
        lng: 100.5460,
        notes: null,
        status: "pending",
      },
    ],
  });
  console.log("✓ SosRequests: 10 survivors seeded (all pending)");

  // ── Clear stale active locations ──────────────────────────────────────────
  await prisma.activeLocation.deleteMany();
  console.log("✓ ActiveLocations: cleared");

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log("\n🗺  Demo data ready:");
  console.log(`   • 3 flood zones  (1 critical · 1 moderate · 1 watch)`);
  console.log(`   • 4 safe shelters  (${sp1.name}, ${sp2.name}, ${sp3.name}, ${sp4.name})`);
  console.log(`   • 3 rescue teams  (all available, staged outside zones)`);
  console.log(`   • 10 SOS requests  (all pending — no pre-assignments)`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
