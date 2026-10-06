import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function GET(req) {
    try {
        const session = await getServerSession(authOptions);
        
        // Basic admin check (Assuming session.user.role exists, otherwise adjust to your auth logic)
        if (!session || !session.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
            // For now, if we don't have a strict role in session, we might just block or allow based on a custom flag.
            // Returning 403 Forbidden for strict environments. If this causes issues, adjust auth check.
            return NextResponse.json({ success: false, error: "Unauthorized access" }, { status: 403 });
        }

        const projects = await prisma.researchProject.findMany({
            orderBy: {
                createdAt: 'desc'
            },
            include: {
                organization: true,
                contact: true
            }
        });

        return NextResponse.json({
            success: true,
            data: projects
        }, { status: 200 });

    } catch (error) {
        console.error("Fetch research projects error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch research projects." },
            { status: 500 }
        );
    }
}
