import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

export async function GET(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const revenues = await prisma.partnerRevenue.findMany({
            where: { paymentStatus: 'paid' }
        });

        let total = 0;
        let listing = 0;
        let leads = 0;

        revenues.forEach(r => {
            total += r.amount;
            if (r.revenueType === 'LISTING_FEE' || r.revenueType === 'SUBSCRIPTION') {
                listing += r.amount;
            } else if (r.revenueType === 'LEAD_FEE') {
                leads += r.amount;
            }
        });

        return NextResponse.json({ success: true, summary: { total, listing, leads } });
    } catch (error) {
        console.error("Revenue Summary Fetch Error:", error);
        return NextResponse.json({ success: false, message: "Server error", summary: { total: 0, listing: 0, leads: 0 } });
    } finally {
        await prisma.$disconnect();
    }
}
