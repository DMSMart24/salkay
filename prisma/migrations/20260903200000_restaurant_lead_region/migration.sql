-- CreateEnum
CREATE TYPE "RestaurantRegion" AS ENUM ('ANADOLU', 'AVRUPA');

-- AlterTable
ALTER TABLE "RestaurantLead" ADD COLUMN "region" "RestaurantRegion" NOT NULL DEFAULT 'ANADOLU';

-- CreateIndex
CREATE INDEX "RestaurantLead_region_idx" ON "RestaurantLead"("region");
