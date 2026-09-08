-- CreateEnum
CREATE TYPE "RestaurantSalesStatus" AS ENUM (
  'NEW',
  'READY_TO_CONTACT',
  'CONTACTED',
  'REPLIED',
  'INTERESTED',
  'MEETING',
  'PROPOSAL',
  'WON',
  'LOST',
  'DO_NOT_CONTACT'
);

-- AlterTable
ALTER TABLE "RestaurantLead" ADD COLUMN "salesStatus" "RestaurantSalesStatus" NOT NULL DEFAULT 'NEW';
ALTER TABLE "RestaurantLead" ADD COLUMN "lastContactAt" TIMESTAMP(3);
ALTER TABLE "RestaurantLead" ADD COLUMN "nextFollowUpAt" TIMESTAMP(3);
ALTER TABLE "RestaurantLead" ADD COLUMN "contactAttempts" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "RestaurantLead_salesStatus_idx" ON "RestaurantLead"("salesStatus");
