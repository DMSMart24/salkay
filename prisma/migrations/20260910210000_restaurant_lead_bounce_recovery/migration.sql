DO $$ BEGIN
  CREATE TYPE "RestaurantLeadReplacementEmailStatus" AS ENUM ('NONE', 'NEEDS_HUMAN_APPROVAL', 'APPROVED', 'REJECTED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "RestaurantLeadRetryStatus" AS ENUM ('NONE', 'HUMAN_REVIEW_REQUIRED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "RestaurantLeadBounceRecoveryAction" AS ENUM ('USE_NEW_EMAIL', 'MANUAL_CONTACT', 'KEEP_SUPPRESSED', 'RETRY_LATER_TRANSIENT');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "RestaurantLead"
  ADD COLUMN IF NOT EXISTS "emailSuppressed" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "emailSuppressedReason" TEXT,
  ADD COLUMN IF NOT EXISTS "approvedReplacementEmail" TEXT,
  ADD COLUMN IF NOT EXISTS "replacementEmailStatus" "RestaurantLeadReplacementEmailStatus" NOT NULL DEFAULT 'NONE',
  ADD COLUMN IF NOT EXISTS "retryStatus" "RestaurantLeadRetryStatus" NOT NULL DEFAULT 'NONE',
  ADD COLUMN IF NOT EXISTS "bounceRecoveryAction" "RestaurantLeadBounceRecoveryAction",
  ADD COLUMN IF NOT EXISTS "hasOfficialContactForm" BOOLEAN NOT NULL DEFAULT false;
