-- SAFE VERSION: Run this if you get "column already exists" errors

-- 1. Add columns only if they don't exist
DO $$ 
BEGIN 
    BEGIN
        ALTER TABLE "User" ADD COLUMN "lastIpAddress" TEXT;
    EXCEPTION
        WHEN duplicate_column THEN RAISE NOTICE 'column lastIpAddress already exists, skipping...';
    END;
    
    BEGIN
        ALTER TABLE "User" ADD COLUMN "deviceId" TEXT;
    EXCEPTION
        WHEN duplicate_column THEN RAISE NOTICE 'column deviceId already exists, skipping...';
    END;
END $$;

-- 2. Create SystemSettings only if it doesn't exist
CREATE TABLE IF NOT EXISTS "SystemSettings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "referralBonusAmount" DOUBLE PRECISION NOT NULL DEFAULT 50.0,
    "welcomeBonusAmount" DOUBLE PRECISION NOT NULL DEFAULT 50.0,
    "minimumWithdrawal" DOUBLE PRECISION NOT NULL DEFAULT 100.0,
    "deliveryAgentFee" DOUBLE PRECISION NOT NULL DEFAULT 50.0,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT NOW(),
    CONSTRAINT "SystemSettings_pkey" PRIMARY KEY ("id")
);

-- 3. Insert default settings if missing
INSERT INTO "SystemSettings" ("id") VALUES ('default') ON CONFLICT ("id") DO NOTHING;
