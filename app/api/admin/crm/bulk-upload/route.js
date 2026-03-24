import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req) {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'ADMIN') {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { leads } = await req.json(); // Array of {name, phone, area, type}

        if (!Array.isArray(leads) || leads.length === 0) {
            return NextResponse.json({ error: "Invalid leads data" }, { status: 400 });
        }

        // Batch create leads
        const result = await prisma.lead.createMany({
            data: leads.map(l => ({
                guestName: l.name,
                guestPhone: l.phone,
                area: l.area || "Gorakhpur",
                serviceType: l.type || "doctor",
                source: "bulk_upload",
                status: "new"
            })),
            skipDuplicates: true
        });

        return NextResponse.json({ success: true, count: result.count });
    } catch (error) {
        console.error("Bulk Upload Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
