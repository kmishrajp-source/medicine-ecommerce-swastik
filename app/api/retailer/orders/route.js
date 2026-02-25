import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "RETAILER") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const retailer = await prisma.retailer.findUnique({
            where: { userId: session.user.id }
        });

        if (!retailer) {
            return NextResponse.json({ error: "Retailer profile not found" }, { status: 404 });
        }

        const pendingOrders = await prisma.order.findMany({
            where: {
                assignedRetailerId: retailer.id,
                status: "Pending_Retailer_Acceptance"
            },
            include: {
                user: { select: { name: true, phone: true } },
                items: { include: { product: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({ success: true, pendingOrders });
    } catch (error) {
        console.error("Retailer Orders Fetch Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
