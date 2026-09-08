-- AlterTable
ALTER TABLE "RestaurantLead" ADD COLUMN "isFinalTop20" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "RestaurantLead" ADD COLUMN "finalRank" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "RestaurantLead_finalRank_key" ON "RestaurantLead"("finalRank");
CREATE INDEX "RestaurantLead_isFinalTop20_idx" ON "RestaurantLead"("isFinalTop20");
