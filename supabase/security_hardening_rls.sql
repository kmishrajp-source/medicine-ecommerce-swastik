-- Swastik Medicare - Security Hardening SQL Migration
-- This script enables RLS and sets up access policies for public and authenticated users.

-- 1. Enable RLS on all tables
ALTER TABLE "Hospital" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Doctor" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Retailer" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Lead" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "InsuranceLead" ENABLE ROW LEVEL SECURITY;

-- 2. Hospitals Table Policies
DROP POLICY IF EXISTS "Public can view hospital basic info" ON "Hospital";
CREATE POLICY "Public can view hospital basic info" ON "Hospital"
FOR SELECT USING (true); -- Everyone can select, but we will mask in API/UI

-- 3. Doctors Table Policies
DROP POLICY IF EXISTS "Public can view doctor basic info" ON "Doctor";
CREATE POLICY "Public can view doctor basic info" ON "Doctor"
FOR SELECT USING (true);

-- 4. Retailers Table Policies
DROP POLICY IF EXISTS "Public can view retailer basic info" ON "Retailer";
CREATE POLICY "Public can view retailer basic info" ON "Retailer"
FOR SELECT USING (true);

-- 5. User Table Policies
DROP POLICY IF EXISTS "Users can see their own profile" ON "User";
CREATE POLICY "Users can see their own profile" ON "User"
FOR SELECT USING (auth.uid()::text = id);

DROP POLICY IF EXISTS "Admin can see all users" ON "User";
CREATE POLICY "Admin can see all users" ON "User"
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM "User" WHERE id = auth.uid()::text AND role = 'ADMIN'
  )
);

-- 6. Leads Table Policies (SLN Leads)
DROP POLICY IF EXISTS "Authenticated users can create leads" ON "Lead";
CREATE POLICY "Authenticated users can create leads" ON "Lead"
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can see their own leads" ON "Lead";
CREATE POLICY "Users can see their own leads" ON "Lead"
FOR SELECT USING (userId = auth.uid()::text);

DROP POLICY IF EXISTS "Admin can see all leads" ON "Lead";
CREATE POLICY "Admin can see all leads" ON "Lead"
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM "User" WHERE id = auth.uid()::text AND role = 'ADMIN'
  )
);

-- Note: In Supabase, the public anon key can still SELECT data if RLS says 'true'.
-- To TRULY hide phone/email at the DB level for anon, we would usually use Views
-- or RPCs, but here we will enforce the masking in the Next.js API layer 
-- as requested (🔹 3️⃣ API Protection).
