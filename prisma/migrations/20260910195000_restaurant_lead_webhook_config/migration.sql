CREATE TABLE IF NOT EXISTS "RestaurantLeadWebhookConfig" (
  "id" TEXT NOT NULL,
  "endpoint" TEXT NOT NULL,
  "resendWebhookId" TEXT,
  "signingSecret" TEXT NOT NULL,
  "eventsJson" TEXT NOT NULL,
  "activationToken" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "RestaurantLeadWebhookConfig_pkey" PRIMARY KEY ("id")
);
