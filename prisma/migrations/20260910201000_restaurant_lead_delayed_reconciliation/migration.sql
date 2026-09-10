ALTER TYPE "RestaurantLeadDeliveryStatus" ADD VALUE IF NOT EXISTS 'DELAYED';
ALTER TYPE "RestaurantLeadTimelineKind" ADD VALUE IF NOT EXISTS 'DELAYED';

ALTER TABLE "RestaurantLeadSendHistory"
  ADD COLUMN IF NOT EXISTS "providerLastEvent" TEXT,
  ADD COLUMN IF NOT EXISTS "providerStatusSyncedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "providerStatusSource" TEXT;
