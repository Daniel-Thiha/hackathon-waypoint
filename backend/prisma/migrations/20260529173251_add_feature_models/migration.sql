/*
  Warnings:

  - You are about to drop the `AdditionRecord` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MultiplicationRecord` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "AdditionRecord";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "MultiplicationRecord";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "FloodZone" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "coordinates" TEXT NOT NULL,
    "adminId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "SafePlace" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "lat" REAL NOT NULL,
    "lng" REAL NOT NULL,
    "capacity" INTEGER NOT NULL,
    "currentCount" INTEGER NOT NULL DEFAULT 0,
    "hasFood" BOOLEAN NOT NULL DEFAULT false,
    "hasWater" BOOLEAN NOT NULL DEFAULT false,
    "supplies" TEXT,
    "adminId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "SurvivorRegistration" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "referenceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "lat" REAL NOT NULL,
    "lng" REAL NOT NULL,
    "safePlaceId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "SosRequest" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "survivorName" TEXT NOT NULL,
    "phone" TEXT,
    "lat" REAL NOT NULL,
    "lng" REAL NOT NULL,
    "lastKnownLat" REAL,
    "lastKnownLng" REAL,
    "notes" TEXT,
    "safePlaceId" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "assignedRescuerId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "RescueMission" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "sosRequestId" INTEGER NOT NULL,
    "rescuerId" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME
);

-- CreateTable
CREATE TABLE "RescueTeamStatus" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "lat" REAL,
    "lng" REAL,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "SurvivorRegistration_referenceId_key" ON "SurvivorRegistration"("referenceId");

-- CreateIndex
CREATE UNIQUE INDEX "RescueMission_sosRequestId_key" ON "RescueMission"("sosRequestId");

-- CreateIndex
CREATE UNIQUE INDEX "RescueTeamStatus_userId_key" ON "RescueTeamStatus"("userId");
