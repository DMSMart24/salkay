-- CreateEnum
CREATE TYPE "OutreachStatus" AS ENUM ('NEW', 'READY', 'SENT', 'REPLIED', 'FAILED', 'DO_NOT_CONTACT');

-- CreateEnum
CREATE TYPE "WebsiteStatus" AS ENUM ('GOOD', 'AVERAGE', 'NEEDS_UPGRADE', 'UNKNOWN');

-- AlterEnum
ALTER TYPE "EmailMessageStatus" ADD VALUE 'SENDING';
ALTER TYPE "EmailMessageStatus" ADD VALUE 'REPLIED';

-- AlterEnum
ALTER TYPE "ActivityType" ADD VALUE 'GROUP_CREATED';
ALTER TYPE "ActivityType" ADD VALUE 'COMPANIES_IMPORTED';
ALTER TYPE "ActivityType" ADD VALUE 'EMAIL_QUEUED';

-- CreateTable
CREATE TABLE "LeadGroup" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "industry" TEXT,
    "city" TEXT,
    "country" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LeadGroup_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "Company"
ADD COLUMN "district" TEXT,
ADD COLUMN "outreachStatus" "OutreachStatus" NOT NULL DEFAULT 'NEW',
ADD COLUMN "websiteScore" INTEGER,
ADD COLUMN "websiteStatus" "WebsiteStatus" NOT NULL DEFAULT 'UNKNOWN',
ADD COLUMN "websiteIssues" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN "recommendedServices" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN "researchSource" TEXT,
ADD COLUMN "researchedAt" TIMESTAMP(3),
ADD COLUMN "groupId" TEXT;

-- AlterTable
ALTER TABLE "EmailMessage" ADD COLUMN "failureReason" TEXT;

-- AlterTable
ALTER TABLE "Suppression" ADD COLUMN "domain" TEXT,
ADD COLUMN "source" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "LeadGroup_slug_key" ON "LeadGroup"("slug");

-- CreateIndex
CREATE INDEX "LeadGroup_industry_idx" ON "LeadGroup"("industry");

-- CreateIndex
CREATE INDEX "LeadGroup_city_idx" ON "LeadGroup"("city");

-- CreateIndex
CREATE INDEX "Company_outreachStatus_idx" ON "Company"("outreachStatus");

-- CreateIndex
CREATE INDEX "Company_groupId_idx" ON "Company"("groupId");

-- CreateIndex
CREATE INDEX "Company_websiteStatus_idx" ON "Company"("websiteStatus");

-- CreateIndex
CREATE INDEX "Company_district_idx" ON "Company"("district");

-- CreateIndex
CREATE INDEX "Suppression_domain_idx" ON "Suppression"("domain");

-- AddForeignKey
ALTER TABLE "Company" ADD CONSTRAINT "Company_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "LeadGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Backfill outreach status from the existing sales-pipeline field without deleting data.
UPDATE "Company"
SET "outreachStatus" = CASE
  WHEN "status" = 'DO_NOT_CONTACT' THEN 'DO_NOT_CONTACT'::"OutreachStatus"
  WHEN "status" = 'REPLIED' THEN 'REPLIED'::"OutreachStatus"
  WHEN "status" IN ('CONTACTED', 'FOLLOW_UP', 'MEETING', 'OFFER_SENT', 'WON') THEN 'SENT'::"OutreachStatus"
  WHEN "status" = 'LOST' THEN 'FAILED'::"OutreachStatus"
  ELSE 'NEW'::"OutreachStatus"
END;

UPDATE "Suppression"
SET "domain" = split_part("emailNorm", '@', 2)
WHERE "domain" IS NULL AND "emailNorm" LIKE '%@%';
