-- Drop old coordinates column and add circle-based columns
-- Wipe existing rows since schema is incompatible
DELETE FROM "FloodZone";

-- Drop old column
ALTER TABLE "FloodZone" DROP COLUMN "coordinates";

-- Add new columns
ALTER TABLE "FloodZone" ADD COLUMN "lat" REAL NOT NULL DEFAULT 13.7563;
ALTER TABLE "FloodZone" ADD COLUMN "lng" REAL NOT NULL DEFAULT 100.5018;
ALTER TABLE "FloodZone" ADD COLUMN "radius" INTEGER NOT NULL DEFAULT 1000;
ALTER TABLE "FloodZone" ADD COLUMN "description" TEXT;

-- Remove the temporary defaults (SQLite doesn't support this, but it's fine with DEFAULT)
