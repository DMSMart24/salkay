-- Additive live-send statuses for RestaurantLead outreach batches.

ALTER TYPE "RestaurantLeadOutreachBatchStatus" ADD VALUE IF NOT EXISTS 'COMPLETED';
ALTER TYPE "RestaurantLeadOutreachBatchStatus" ADD VALUE IF NOT EXISTS 'PARTIAL';
ALTER TYPE "RestaurantLeadOutreachBatchStatus" ADD VALUE IF NOT EXISTS 'ABORTED';
