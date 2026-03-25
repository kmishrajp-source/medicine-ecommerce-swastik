-- SWASTIK MEDICARE: SUPABASE SECURITY HARDENING SCRIPT
-- RUN THIS IN THE SUPABASE SQL EDITOR

-- 1. Enable RLS on Sensitive Tables
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Lead" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Order" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "OTP" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Withdrawal" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "InsuranceLead" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Prescription" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "WalletTransaction" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ComplianceAuditLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Complaint" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Doctor" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Hospital" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Retailer" ENABLE ROW LEVEL SECURITY;

-- 2. Create Default "Deny All" Policies for Public/Authenticated API access
-- This ensures that PostgREST (Supabase API) cannot read these tables 
-- even if the URL is known, while allowing your Prisma server-side 
-- connection (which bypasses RLS) to continue working normally.

-- For User Table
DROP POLICY IF EXISTS "Deny Public Access" ON "User";
CREATE POLICY "Deny Public Access" ON "User" FOR ALL TO anon, authenticated USING (false);

-- For Lead Table
DROP POLICY IF EXISTS "Deny Public Access" ON "Lead";
CREATE POLICY "Deny Public Access" ON "Lead" FOR ALL TO anon, authenticated USING (false);

-- For Order Table
DROP POLICY IF EXISTS "Deny Public Access" ON "Order";
CREATE POLICY "Deny Public Access" ON "Order" FOR ALL TO anon, authenticated USING (false);

-- For OTP Table
DROP POLICY IF EXISTS "Deny Public Access" ON "OTP";
CREATE POLICY "Deny Public Access" ON "OTP" FOR ALL TO anon, authenticated USING (false);

-- 3. Allow Public READ Access for Directory Data (Non-Sensitive)
-- If you want doctors/hospitals/retailers to be searchable via the API:
ALTER TABLE "Doctor" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow Public Read for Directory" ON "Doctor";
CREATE POLICY "Allow Public Read for Directory" ON "Doctor" FOR SELECT TO anon, authenticated USING (true);

ALTER TABLE "Hospital" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow Public Read for Directory" ON "Hospital";
CREATE POLICY "Allow Public Read for Directory" ON "Hospital" FOR SELECT TO anon, authenticated USING (true);

ALTER TABLE "Retailer" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow Public Read for Directory" ON "Retailer";
CREATE POLICY "Allow Public Read for Directory" ON "Retailer" FOR SELECT TO anon, authenticated USING (true);

-- 4. Protect specific columns (if using PostgREST)
-- Since Prisma bypasses RLS, these policies effectively "turn off" 
-- the Supabase REST API for the sensitive tables, resolving the 
-- "rls_disabled_in_public" and "sensitive_columns_exposed" warnings.

-- REPEAT for all other sensitive tables:
DO $$ 
DECLARE 
    t TEXT;
BEGIN 
    FOR t IN SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('Withdrawal', 'InsuranceLead', 'Prescription', 'WalletTransaction', 'OTP')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS "Deny Public Access" ON %I', t);
        EXECUTE format('CREATE POLICY "Deny Public Access" ON %I FOR ALL TO anon, authenticated USING (false)', t);
    END LOOP;
END $$;
