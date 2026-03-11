import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { autoAssignDelivery } from "@/utils/delivery-service";

/**
 * Admin API to review current marketplace status.
 * Returns pending invoices, substitutions, and delivery delays.
 */
export async function GET(req) {
    try {
        const session = await getServerSession(authOptions);
        if (session?.user?.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 1. Fetch data for the dashboard
        const pendingInvoices = await prisma.draftInvoice.findMany({
            where: { status: "Pending" },
            include: { subOrder: { include: { retailer: true, order: true } } }
        });

        const activeSubOrders = await prisma.subOrder.findMany({
            where: { status: { in: ["Invoice_Pending", "Approved"] } },
            include: { retailer: true, order: true }
        });

        const assignments = await prisma.deliveryAssignment.findMany({
            orderBy: { assignedAt: "desc" },
            take: 20,
            include: { agent: true, order: true }
        });

        return NextResponse.json({
            pendingInvoices,
            activeSubOrders,
            assignments
        });

    } catch (error) {
        console.error("[ADMIN DASHBOARD ERROR]", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

/**
 * Dedicated POST for manual delivery assignment or status correction
 */
export async function POST(req) {
    try {
        const { orderId, agentId } = await req.json();
        // Manual override for smart delivery
        const assignment = await autoAssignDelivery(orderId);
        return NextResponse.json({ success: true, assignment });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
