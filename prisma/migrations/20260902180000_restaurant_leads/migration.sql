-- CreateEnum
CREATE TYPE "RestaurantWebsiteStatus" AS ENUM ('NO_WEBSITE', 'VERY_WEAK', 'WEAK', 'IMPROVABLE', 'GOOD', 'VERY_GOOD', 'NOT_VERIFIED');

-- CreateEnum
CREATE TYPE "RestaurantLeadPriority" AS ENUM ('HIGH', 'MEDIUM', 'LOW', 'QUALIFIED_OUT');

-- CreateEnum
CREATE TYPE "RestaurantContactStatus" AS ENUM ('NOT_CONTACTED', 'READY_TO_CONTACT', 'CONTACTED', 'REPLIED', 'FOLLOW_UP', 'INTERESTED', 'MEETING', 'WON', 'LOST');

-- CreateTable
CREATE TABLE "RestaurantLead" (
    "id" TEXT NOT NULL,
    "restaurantName" TEXT NOT NULL,
    "nameNorm" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "districtNorm" TEXT NOT NULL,
    "neighborhood" TEXT,
    "address" TEXT,
    "website" TEXT,
    "websiteDomain" TEXT,
    "websiteStatus" "RestaurantWebsiteStatus" NOT NULL DEFAULT 'NOT_VERIFIED',
    "websiteScore" DOUBLE PRECISION,
    "leadScore" DOUBLE PRECISION NOT NULL,
    "priority" "RestaurantLeadPriority" NOT NULL DEFAULT 'MEDIUM',
    "publicEmail" TEXT,
    "phone" TEXT,
    "whatsapp" TEXT,
    "instagram" TEXT,
    "googleMapsUrl" TEXT,
    "googleRating" DOUBLE PRECISION,
    "googleReviewCount" INTEGER,
    "category" TEXT,
    "problem1" TEXT,
    "problem2" TEXT,
    "problem3" TEXT,
    "websiteAnalysis" TEXT,
    "opportunities" TEXT,
    "salkayPitch" TEXT,
    "source" TEXT,
    "dateChecked" TIMESTAMP(3),
    "contactStatus" "RestaurantContactStatus" NOT NULL DEFAULT 'NOT_CONTACTED',
    "outreachNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RestaurantLead_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "RestaurantLead_nameNorm_districtNorm_key" ON "RestaurantLead"("nameNorm", "districtNorm");
CREATE INDEX "RestaurantLead_district_idx" ON "RestaurantLead"("district");
CREATE INDEX "RestaurantLead_priority_idx" ON "RestaurantLead"("priority");
CREATE INDEX "RestaurantLead_websiteStatus_idx" ON "RestaurantLead"("websiteStatus");
CREATE INDEX "RestaurantLead_contactStatus_idx" ON "RestaurantLead"("contactStatus");
CREATE INDEX "RestaurantLead_leadScore_idx" ON "RestaurantLead"("leadScore");
CREATE INDEX "RestaurantLead_updatedAt_idx" ON "RestaurantLead"("updatedAt");
CREATE INDEX "RestaurantLead_publicEmail_idx" ON "RestaurantLead"("publicEmail");

ALTER TABLE "RestaurantLead"
ADD CONSTRAINT "RestaurantLead_websiteScore_status_check"
CHECK (
  ("websiteStatus" IN ('NO_WEBSITE', 'NOT_VERIFIED') AND "websiteScore" IS NULL)
  OR ("websiteStatus" NOT IN ('NO_WEBSITE', 'NOT_VERIFIED'))
);
