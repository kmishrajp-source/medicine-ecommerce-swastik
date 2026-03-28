import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(req) {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'ADMIN') {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { partnerId, partnerType, revenueType, amount } = await req.json();

        if (!partnerId || !amount) {
            return NextResponse.json({ error: "Partner ID and Amount are required" }, { status: 400 });
        }

        const revenue = await prisma.partnerRevenue.create({
            data: {
                partnerId,
                partnerType,
                revenueType,
                amount: parseFloat(amount),
                paymentStatus: "paid"
            }
        });

        return NextResponse.json({ success: true, revenue });
    } catch (error) {
        console.error("Record Revenue Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
