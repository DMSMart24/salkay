-- Additive RestaurantLead outreach snapshot/history. Does not touch Company.

CREATE TYPE "RestaurantLeadOutreachMode" AS ENUM ('TEST', 'LIVE');
CREATE TYPE "RestaurantLeadOutreachBatchStatus" AS ENUM ('PREPARED', 'BLOCKED');
CREATE TYPE "RestaurantLeadSendStatus" AS ENUM ('PREPARED', 'SENT', 'FAILED');

CREATE TABLE "RestaurantLeadOutreachBatch" (
    "id" TEXT NOT NULL,
    "mode" "RestaurantLeadOutreachMode" NOT NULL,
    "status" "RestaurantLeadOutreachBatchStatus" NOT NULL DEFAULT 'PREPARED',
    "leadIds" TEXT[],
    "snapshotJson" TEXT NOT NULL,
    "checksJson" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RestaurantLeadOutreachBatch_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "RestaurantLeadSendHistory" (
    "id" TEXT NOT NULL,
    "restaurantLeadId" TEXT NOT NULL,
    "batchId" TEXT,
    "toAddress" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "bodyText" TEXT NOT NULL,
    "provider" TEXT,
    "providerMessageId" TEXT,
    "status" "RestaurantLeadSendStatus" NOT NULL DEFAULT 'PREPARED',
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RestaurantLeadSendHistory_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "RestaurantLeadOutreachBatch_createdAt_idx" ON "RestaurantLeadOutreachBatch"("createdAt");
CREATE INDEX "RestaurantLeadSendHistory_restaurantLeadId_status_idx" ON "RestaurantLeadSendHistory"("restaurantLeadId", "status");
CREATE INDEX "RestaurantLeadSendHistory_status_idx" ON "RestaurantLeadSendHistory"("status");

ALTER TABLE "RestaurantLeadSendHistory" ADD CONSTRAINT "RestaurantLeadSendHistory_restaurantLeadId_fkey" FOREIGN KEY ("restaurantLeadId") REFERENCES "RestaurantLead"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RestaurantLeadSendHistory" ADD CONSTRAINT "RestaurantLeadSendHistory_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "RestaurantLeadOutreachBatch"("id") ON DELETE SET NULL ON UPDATE CASCADE;
