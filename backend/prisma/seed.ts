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

  const rescueUser = await prisma.user.upsert({
    where: { username: "rescue" },
    update: {},
    create: { username: "rescue", password: rescuePassword, role: "RescueTeam" },
  });

  await prisma.rescueTeamStatus.upsert({
    where: { userId: rescueUser.id },
    update: {},
    create: { userId: rescueUser.id, isAvailable: true, lat: 13.7130, lng: 100.5820 },
  });

  const safePlaceCount = await prisma.safePlace.count();
  let shelterId: number | undefined;
  if (safePlaceCount === 0) {
    const shelter = await prisma.safePlace.create({
      data: {
        name: "Chatuchak Emergency Shelter",
        description: "Main evacuation center — food, water, and medical aid available",
        lat: 13.7985,
        lng: 100.5498,
        capacity: 500,
        hasFood: true,
        hasWater: true,
        adminId: 1,
      },
    });
    shelterId = shelter.id;
    console.log("Seeded: Chatuchak Emergency Shelter (safe place)");
  } else {
    const first = await prisma.safePlace.findFirst();
    shelterId = first?.id;
  }

  const sosCount = await prisma.sosRequest.count();
  if (sosCount === 0) {
    await prisma.sosRequest.createMany({
      data: [
        {
          survivorName: "Somchai Jaidee",
          phone: "081-234-5678",
          lat: 13.7850,
          lng: 100.5350,
          notes: "Stranded on rooftop, 2 children with me",
          safePlaceId: shelterId,
          status: "pending",
        },
        {
          survivorName: "Nipa Wannarat",
          phone: "089-876-5432",
          lat: 13.7450,
          lng: 100.5650,
          lastKnownLat: 13.7460,
          lastKnownLng: 100.5660,
          notes: "Elderly woman, needs medication",
          safePlaceId: shelterId,
          status: "pending",
        },
        {
          survivorName: "Krit Sombat",
          lat: 13.7200,
          lng: 100.5250,
          notes: "Trapped on second floor, water rising fast",
          safePlaceId: shelterId,
          status: "pending",
        },
        {
          survivorName: "Malee Pornpan",
          phone: "062-111-2233",
          lat: 13.7600,
          lng: 100.4850,
          notes: "Family of 4, including infant",
          safePlaceId: shelterId,
          status: "pending",
        },
        {
          survivorName: "Pranee Sukjai",
          phone: "085-999-1122",
          lat: 13.7520,
          lng: 100.5080,
          notes: "Injured leg, needs assistance",
          safePlaceId: shelterId,
          status: "pending",
        },
        {
          survivorName: "Wiroj Chanthai",
          phone: "091-444-5566",
          lat: 13.7680,
          lng: 100.5420,
          notes: "House flooded, 3 family members",
          safePlaceId: shelterId,
          status: "pending",
        },
      ],
    });
    console.log("Seeded: 6 mock SOS requests");
  }

  console.log("Seeded: admin / admin123 (Admin), rescue / rescue123 (RescueTeam)");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
