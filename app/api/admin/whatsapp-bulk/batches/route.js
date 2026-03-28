import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(req) {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'ADMIN') {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const batches = await prisma.whatsappBatch.findMany({
            orderBy: { createdAt: 'desc' },
            take: 20
        });

        return NextResponse.json({ success: true, batches });
    } catch (error) {
        console.error("Fetch Batches Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
