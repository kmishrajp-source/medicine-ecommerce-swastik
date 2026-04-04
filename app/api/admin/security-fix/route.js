import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        console.log("Executing Global RLS Lockdown...");

        // 1. Enable RLS on all tables in public schema
        // 2. Drop any existing broad public policies
        await prisma.$executeRawUnsafe(`
            DO $$ 
            DECLARE 
                r RECORD;
            BEGIN
                -- Enable RLS for all tables
                FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
                    EXECUTE 'ALTER TABLE public.' || quote_ident(r.tablename) || ' ENABLE ROW LEVEL SECURITY';
                    
                    -- Drop common broad policies if they exist (clean slate)
                    EXECUTE 'DROP POLICY IF EXISTS "Allow All" ON public.' || quote_ident(r.tablename);
                    EXECUTE 'DROP POLICY IF EXISTS "Public access" ON public.' || quote_ident(r.tablename);
                    EXECUTE 'DROP POLICY IF EXISTS "Enable read access for all users" ON public.' || quote_ident(r.tablename);
                END LOOP;
            END $$;
        `);

        return NextResponse.json({ 
            success: true, 
            message: "Global RLS enabled and public policies removed. Database is now locked down." 
        });
    } catch (error) {
        console.error("Security Fix Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
