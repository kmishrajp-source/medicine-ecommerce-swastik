const { PrismaClient } = require('@prisma/client');

async function main() {
    // DIRECT_URL to bypass pgbouncer for DDL
    const directUrl = "postgresql://postgres.kklkpnzwxaxekxraqswh:Shivangi%40%23%242004@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres";

    const prisma = new PrismaClient({
        datasources: {
            db: {
                url: directUrl
            }
        }
    });

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

        // Add Foreign Keys (using DO block to avoid errors if they already exist)
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

    console.log("Starting Production DB Remediation v2...");

    for (const statement of sqlStatements) {
        try {
            await prisma.$executeRawUnsafe(statement);
            console.log("✅ Executed statement successfully.");
        } catch (e) {
            console.error("❌ Statement failed:", e.message);
        }
    }

    await prisma.$disconnect();
    console.log("Done.");
}

main();
