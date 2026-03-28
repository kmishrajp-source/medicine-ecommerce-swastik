import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { sanitizeProfile } from "@/lib/security";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        const isAuthenticated = !!session;

        const labs = await prisma.lab.findMany({
            include: { tests: true }
        });

        const formattedLabs = labs.map(l => sanitizeProfile(l, isAuthenticated));

        return NextResponse.json({ success: true, labs: formattedLabs });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
