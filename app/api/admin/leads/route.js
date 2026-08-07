import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const source = searchParams.get("source");

        const query = {};
        if (source) query.source = source;

        const leads = await prisma.lead.findMany({
            where: query,
            orderBy: { createdAt: "desc" },
            take: 200 // limit to recent 200
        });

        return NextResponse.json({ success: true, leads });

    } catch (error) {
        console.error("Fetch Leads API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
