import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.user?.role)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const sosRequests = await prisma.emergencyRequest.findMany({
            orderBy: {
                createdAt: 'desc'
            }
        });

        return NextResponse.json({ success: true, sosRequests });
    } catch (error) {
        console.error("Admin SOS GET Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PUT(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.user?.role)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { id, status, notes } = body;

        if (!id || !status) {
            return NextResponse.json({ error: "Missing id or status" }, { status: 400 });
        }

        const updatedRequest = await prisma.emergencyRequest.update({
            where: { id },
            data: { 
                status,
                ...(notes !== undefined && { notes })
            }
        });

        return NextResponse.json({ success: true, updatedRequest });
    } catch (error) {
        console.error("Admin SOS PUT Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
