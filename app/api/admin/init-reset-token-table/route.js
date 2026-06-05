import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req) {
    try {
        // Create table using raw SQL if it doesn't exist
        await prisma.$executeRawUnsafe(`
            CREATE TABLE IF NOT EXISTS "PasswordResetToken" (
                "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
                "email" TEXT NOT NULL,
                "token" TEXT NOT NULL,
                "expiresAt" TIMESTAMP(3) NOT NULL,
                "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
            );
        `);

        await prisma.$executeRawUnsafe(`
            CREATE UNIQUE INDEX IF NOT EXISTS "PasswordResetToken_token_key" ON "PasswordResetToken"("token");
        `);

        // Verify it was created
        const check = await prisma.$queryRaw`
            SELECT EXISTS (
                SELECT FROM information_schema.tables
                WHERE table_name = 'PasswordResetToken'
            ) AS exists;
        `;

        return NextResponse.json({
            success: true,
            message: "PasswordResetToken table is ready.",
            tableExists: check[0]?.exists
        });
    } catch (error) {
        console.error("Init table error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
