-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_FloodZone" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "lat" REAL NOT NULL,
    "lng" REAL NOT NULL,
    "radius" INTEGER NOT NULL DEFAULT 1000,
    "description" TEXT,
    "adminId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_FloodZone" ("adminId", "createdAt", "description", "id", "lat", "lng", "radius", "severity", "title", "updatedAt") SELECT "adminId", "createdAt", "description", "id", "lat", "lng", "radius", "severity", "title", "updatedAt" FROM "FloodZone";
DROP TABLE "FloodZone";
ALTER TABLE "new_FloodZone" RENAME TO "FloodZone";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
