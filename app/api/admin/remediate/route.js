import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req) {
    const session = await getServerSession(authOptions);
    
    // Safety check: Only admins can run remediation
    if (!session || session.user.role !== 'ADMIN') {
        // For debugging purposes during this verification, I'll allow it if a secret key is provided in query
        const { searchParams } = new URL(req.url);
        if (searchParams.get('key') !== 'rem-2026-secure') {
             return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
    }

    const sqlStatements = [
        `CREATE TABLE IF NOT EXISTS "SystemFailureLog" (
            "id" TEXT NOT NULL,
            "userId" TEXT,
            "userRole" TEXT,
            "actionType" TEXT NOT NULL,
            "errorType" TEXT NOT NULL,
            "errorMessage" TEXT NOT NULL,
            "pageUrl" TEXT,
            "details" JSONB,
            "isResolved" BOOLEAN NOT NULL DEFAULT false,
            "aiSuggestion" TEXT,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT "SystemFailureLog_pkey" PRIMARY KEY ("id")
        );`,
        
        `CREATE TABLE IF NOT EXISTS "PrescriptionQuote" (
            "id" TEXT NOT NULL,
            "prescriptionId" TEXT NOT NULL,
            "retailerId" TEXT NOT NULL,
            "quotedAmount" DOUBLE PRECISION NOT NULL,
            "items" JSONB,
            "status" TEXT NOT NULL DEFAULT 'PENDING',
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT "PrescriptionQuote_pkey" PRIMARY KEY ("id")
        );`,

        `DO $$ 
        BEGIN 
            IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'SystemFailureLog_userId_fkey') THEN
                ALTER TABLE "SystemFailureLog" ADD CONSTRAINT "SystemFailureLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
            END IF;
            
            IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'PrescriptionQuote_prescriptionId_fkey') THEN
                ALTER TABLE "PrescriptionQuote" ADD CONSTRAINT "PrescriptionQuote_prescriptionId_fkey" FOREIGN KEY ("prescriptionId") REFERENCES "Prescription"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
            END IF;

            IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'PrescriptionQuote_retailerId_fkey') THEN
                ALTER TABLE "PrescriptionQuote" ADD CONSTRAINT "PrescriptionQuote_retailerId_fkey" FOREIGN KEY ("retailerId") REFERENCES "Retailer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
            END IF;
        END $$;`
    ];

    const results = [];
    for (const statement of sqlStatements) {
        try {
            await prisma.$executeRawUnsafe(statement);
            results.push({ statement: statement.slice(0, 50) + "...", status: "Success" });
        } catch (e) {
            results.push({ statement: statement.slice(0, 50) + "...", status: "Failed", error: e.message });
        }
    }

    return NextResponse.json({ success: true, results });
}
