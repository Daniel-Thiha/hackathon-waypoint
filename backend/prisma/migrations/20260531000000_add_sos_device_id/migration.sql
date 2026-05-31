-- AlterTable: add deviceId for SOS deduplication per device
ALTER TABLE "SosRequest" ADD COLUMN "deviceId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "SosRequest_deviceId_key" ON "SosRequest"("deviceId");
