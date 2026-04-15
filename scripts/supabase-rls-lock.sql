-- 🛡️ SWASTIK MEDICARE: ZERO-TRUST REST API HARDENING
-- This script crawls every single table in your 'public' schema and activates Row Level Security.
-- Because Next.js Prisma connects as the 'postgres' superuser, it will bypass this lock,
-- remaining 100% operational, but any hacker using the 'anon' REST API key will be blocked.

DO $$ 
DECLARE 
    r RECORD;
    table_name TEXT;
BEGIN 
    -- 1. Loop through all tables securely isolated in the 'public' schema
    FOR r IN (
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public'
    ) LOOP
        table_name := r.tablename;
        
        -- 2. Force Enable Row Level Security
        -- This inherently triggers a 'Deny All' for public API roles (anon, authenticated)
        -- unless specific ALLOW policies are explicitly created later.
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', table_name);
        
        RAISE NOTICE 'Locked down table: %', table_name;
    END LOOP;

    -- 3. We deliberately do NOT create permissive policies here.
    -- Prisma operates outside RLS boundaries when bridging via pooled connections,
    -- meaning zero-trust RLS on the DB side perfectly secures the vulnerable API surface!
    
END $$;
