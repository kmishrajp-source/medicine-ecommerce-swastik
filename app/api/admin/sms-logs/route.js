import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req) {
    try {
        const session = await getServerSession(authOptions);

        // Security Check
        // if (!session || session.user.role !== 'ADMIN') {
        //    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        // }

        const logs = await prisma.sMSLog.findMany({
            orderBy: { createdAt: 'desc' },
            take: 100 // Limit to last 100 logs
        });

        // Format dates
        const formattedLogs = logs.map(log => ({
            ...log,
            createdAt: log.createdAt.toISOString()
        }));

        return NextResponse.json({ success: true, logs: formattedLogs });

    } catch (error) {
        console.error("Failed to fetch SMS logs:", error);
        return NextResponse.json({ error: "Failed to fetch logs: " + error.message }, { status: 500 });
    }
}
