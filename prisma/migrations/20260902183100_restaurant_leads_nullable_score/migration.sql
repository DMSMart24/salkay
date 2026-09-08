-- AlterTable
ALTER TABLE "RestaurantLead" ALTER COLUMN "leadScore" DROP NOT NULL;
ALTER TABLE "RestaurantLead" ALTER COLUMN "priority" SET DEFAULT 'PENDING';
