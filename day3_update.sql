-- Add fraud tracking columns to User table
ALTER TABLE "User" ADD COLUMN "lastIpAddress" TEXT;
ALTER TABLE "User" ADD COLUMN "deviceId" TEXT;

-- Create SystemSettings table for dynamic variables
CREATE TABLE "SystemSettings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "referralBonusAmount" DOUBLE PRECISION NOT NULL DEFAULT 50.0,
    "welcomeBonusAmount" DOUBLE PRECISION NOT NULL DEFAULT 50.0,
    "minimumWithdrawal" DOUBLE PRECISION NOT NULL DEFAULT 100.0,
    "deliveryAgentFee" DOUBLE PRECISION NOT NULL DEFAULT 50.0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SystemSettings_pkey" PRIMARY KEY ("id")
);

-- Insert the default singleton row for the application to consume
INSERT INTO "SystemSettings" ("id", "referralBonusAmount", "welcomeBonusAmount", "minimumWithdrawal", "deliveryAgentFee", "updatedAt") 
VALUES ('default', 50.0, 50.0, 100.0, 50.0, CURRENT_TIMESTAMP);
