-- Additive post-send tracking for RestaurantLead outreach. No Company changes.

DO $$ BEGIN
  CREATE TYPE "RestaurantLeadDeliveryStatus" AS ENUM ('PENDING', 'DELIVERED', 'BOUNCED', 'COMPLAINED', 'FAILED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "RestaurantLeadReplyStatus" AS ENUM ('NO_REPLY', 'REPLIED', 'POSITIVE', 'NEGATIVE', 'AUTO_REPLY', 'UNKNOWN');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "RestaurantLeadFollowUpStatus" AS ENUM ('NOT_DUE', 'DUE', 'DRAFT_READY', 'NEEDS_REVIEW', 'SENT', 'STOPPED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "RestaurantLeadTimelineKind" AS ENUM (
    'INITIAL_PREPARED',
    'INITIAL_SENT',
    'DELIVERED',
    'BOUNCED',
    'COMPLAINED',
    'REPLY',
    'FOLLOW_UP_DUE',
    'FOLLOW_UP_DRAFT',
    'FOLLOW_UP_SENT',
    'MEETING',
    'OFFER',
    'WON',
    'LOST',
    'NOTE'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "RestaurantLead"
  ADD COLUMN IF NOT EXISTS "deliveryStatus" "RestaurantLeadDeliveryStatus" NOT NULL DEFAULT 'PENDING',
  ADD COLUMN IF NOT EXISTS "replyStatus" "RestaurantLeadReplyStatus" NOT NULL DEFAULT 'NO_REPLY',
  ADD COLUMN IF NOT EXISTS "followUpStatus" "RestaurantLeadFollowUpStatus" NOT NULL DEFAULT 'NOT_DUE',
  ADD COLUMN IF NOT EXISTS "deliveredAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "bouncedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "complainedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "repliedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "lastInboundAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "followUpCount" INTEGER NOT NULL DEFAULT 0;

ALTER TABLE "RestaurantLeadSendHistory"
  ADD COLUMN IF NOT EXISTS "deliveryStatus" "RestaurantLeadDeliveryStatus" NOT NULL DEFAULT 'PENDING',
  ADD COLUMN IF NOT EXISTS "deliveredAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "bouncedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "complainedAt" TIMESTAMP(3);

CREATE TABLE IF NOT EXISTS "RestaurantLeadFollowUpDraft" (
  "id" TEXT NOT NULL,
  "restaurantLeadId" TEXT NOT NULL,
  "sourceSendId" TEXT NOT NULL,
  "subject" TEXT NOT NULL,
  "bodyText" TEXT NOT NULL,
  "opportunityUsed" TEXT,
  "excludeReason" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "RestaurantLeadFollowUpDraft_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "RestaurantLeadTimelineEvent" (
  "id" TEXT NOT NULL,
  "restaurantLeadId" TEXT NOT NULL,
  "kind" "RestaurantLeadTimelineKind" NOT NULL,
  "at" TIMESTAMP(3) NOT NULL,
  "source" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "metadata" TEXT,
  "sendHistoryId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "RestaurantLeadTimelineEvent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "RestaurantLeadWebhookEvent" (
  "id" TEXT NOT NULL,
  "providerEventId" TEXT NOT NULL,
  "eventType" TEXT NOT NULL,
  "providerMessageId" TEXT,
  "payloadJson" TEXT NOT NULL,
  "processedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "RestaurantLeadWebhookEvent_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "RestaurantLeadWebhookEvent_providerEventId_key" ON "RestaurantLeadWebhookEvent"("providerEventId");
CREATE INDEX IF NOT EXISTS "RestaurantLead_deliveryStatus_idx" ON "RestaurantLead"("deliveryStatus");
CREATE INDEX IF NOT EXISTS "RestaurantLead_replyStatus_idx" ON "RestaurantLead"("replyStatus");
CREATE INDEX IF NOT EXISTS "RestaurantLead_followUpStatus_idx" ON "RestaurantLead"("followUpStatus");
CREATE INDEX IF NOT EXISTS "RestaurantLeadSendHistory_providerMessageId_idx" ON "RestaurantLeadSendHistory"("providerMessageId");
CREATE INDEX IF NOT EXISTS "RestaurantLeadSendHistory_deliveryStatus_idx" ON "RestaurantLeadSendHistory"("deliveryStatus");
CREATE INDEX IF NOT EXISTS "RestaurantLeadFollowUpDraft_restaurantLeadId_createdAt_idx" ON "RestaurantLeadFollowUpDraft"("restaurantLeadId", "createdAt");
CREATE INDEX IF NOT EXISTS "RestaurantLeadTimelineEvent_restaurantLeadId_at_idx" ON "RestaurantLeadTimelineEvent"("restaurantLeadId", "at");
CREATE INDEX IF NOT EXISTS "RestaurantLeadTimelineEvent_kind_idx" ON "RestaurantLeadTimelineEvent"("kind");
CREATE INDEX IF NOT EXISTS "RestaurantLeadWebhookEvent_providerMessageId_idx" ON "RestaurantLeadWebhookEvent"("providerMessageId");
CREATE INDEX IF NOT EXISTS "RestaurantLeadWebhookEvent_eventType_idx" ON "RestaurantLeadWebhookEvent"("eventType");

DO $$ BEGIN
  ALTER TABLE "RestaurantLeadFollowUpDraft"
    ADD CONSTRAINT "RestaurantLeadFollowUpDraft_restaurantLeadId_fkey"
    FOREIGN KEY ("restaurantLeadId") REFERENCES "RestaurantLead"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "RestaurantLeadTimelineEvent"
    ADD CONSTRAINT "RestaurantLeadTimelineEvent_restaurantLeadId_fkey"
    FOREIGN KEY ("restaurantLeadId") REFERENCES "RestaurantLead"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
