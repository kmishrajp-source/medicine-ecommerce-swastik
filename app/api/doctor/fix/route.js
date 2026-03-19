import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req) {
    try {
        const statements = [
            `ALTER TABLE "Doctor" ALTER COLUMN "userId" DROP NOT NULL`,
            `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Doctor' AND column_name='name') THEN ALTER TABLE "Doctor" ADD COLUMN "name" TEXT; END IF; END $$;`,
            `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Doctor' AND column_name='isDirectory') THEN ALTER TABLE "Doctor" ADD COLUMN "isDirectory" BOOLEAN DEFAULT FALSE; END IF; END $$;`,
            `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Doctor' AND column_name='location') THEN ALTER TABLE "Doctor" ADD COLUMN "location" TEXT; END IF; END $$;`,
            `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Doctor' AND column_name='isClaimed') THEN ALTER TABLE "Doctor" ADD COLUMN "isClaimed" BOOLEAN DEFAULT FALSE; END IF; END $$;`,
            // Inject / Reset Sample Directory Doctor
            `DELETE FROM "Doctor" WHERE id = 'dir_doctor_kushinagar'`,
            `INSERT INTO "Doctor" (id, specialization, hospital, experience, verified, "consultationFee", phone, name, "isDirectory", location) 
             VALUES ('dir_doctor_kushinagar', 'General Physician', 'Kushinagar Health Center', 12, true, 200.0, '9876543210', 'Rajesh Pratap Singh', true, 'Kushinagar')`
        ];

        for (const sql of statements) {
            await prisma.$executeRawUnsafe(sql);
        }

        const stats = {
            total: await prisma.doctor.count(),
            directory: await prisma.doctor.count({ where: { isDirectory: true } })
        };

        return NextResponse.json({ success: true, message: "Doctor Directory Sync Successful", stats });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
