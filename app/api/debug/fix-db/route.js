import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const sqlPath = path.join(process.cwd(), 'supabase_schema.sql');
    if (!fs.existsSync(sqlPath)) {
      return NextResponse.json({ success: false, error: 'supabase_schema.sql not found at ' + sqlPath });
    }
    
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Split into statements
    const statements = sql.split(';').map(s => s.trim()).filter(s => s.length > 0);
    
    const results = [];
    for (const stmt of statements) {
      if (stmt.includes('CREATE TABLE') || stmt.includes('ALTER TABLE') || stmt.includes('CREATE UNIQUE INDEX')) {
        try {
          await prisma.$executeRawUnsafe(stmt);
          results.push({ stmt: stmt.slice(0, 100), status: 'success' });
        } catch (err) {
          // Ignore "already exists" errors
          if (!err.message.includes('already exists')) {
             results.push({ stmt: stmt.slice(0, 100), status: 'error', error: err.message });
          }
        }
      }
    }
    
    // Also push a manual User table creation just in case
    try {
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "User" (
            "id" TEXT NOT NULL,
            "email" TEXT NOT NULL,
            "password" TEXT NOT NULL,
            "name" TEXT,
            "role" TEXT NOT NULL DEFAULT 'CUSTOMER',
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "referralCode" TEXT,
            "referredBy" TEXT,
            "walletBalance" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
            "fcmTokens" TEXT[] DEFAULT ARRAY[]::TEXT[],
            CONSTRAINT "User_pkey" PRIMARY KEY ("id")
        )
      `);
      
      await prisma.$executeRawUnsafe(`
        CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email")
      `);
      
    } catch(e) {
      // Ignore
    }
    
    return NextResponse.json({ success: true, results });
  } catch (e) {
    return NextResponse.json({ success: false, error: e.message });
  }
}
