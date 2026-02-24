import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

/**
 * Fetches the complete Order History for the authenticated User.
 * This powers the Patient Profile Dashboard and links to the Live GPS Tracker.
 */
export async function GET(req) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const orders = await prisma.order.findMany({
            where: {
                userId: session.user.id
            },
            orderBy: {
                createdAt: 'desc'
            },
            select: {
                id: true,
                total: true,
                status: true,
                createdAt: true,
                paymentMethod: true,
                isPaid: true
            }
        });

        return NextResponse.json({ success: true, orders });

    } catch (error) {
        console.error("Failed fetching user orders:", error);
        return NextResponse.json({ error: "Server Error", details: error.message }, { status: 500 });
    }
}
