-- Additive RestaurantLead bulk chunk/progress fields. Does not touch Company.

ALTER TABLE "RestaurantLeadOutreachBatch" ADD COLUMN "chunkSize" INTEGER NOT NULL DEFAULT 10;
ALTER TABLE "RestaurantLeadOutreachBatch" ADD COLUMN "processedCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "RestaurantLeadOutreachBatch" ADD COLUMN "successCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "RestaurantLeadOutreachBatch" ADD COLUMN "failedCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "RestaurantLeadSendHistory" ADD COLUMN "errorMessage" TEXT;
