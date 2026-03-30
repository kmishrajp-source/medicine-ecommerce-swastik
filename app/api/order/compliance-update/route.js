import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(req) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orderId, action, details } = await req.json();

    try {
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { user: true }
        });

        if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

        let nextStatus = order.status;

        if (action === "PHARMACIST_APPROVE") {
            nextStatus = "Pharmacist_Approved";
        } else if (action === "PACKING_VALIDATE") {
            nextStatus = "Ready_for_Packing";
        } else if (action === "SHIP") {
            nextStatus = "Out_for_Delivery";
        }

        const updatedOrder = await prisma.order.update({
            where: { id: orderId },
            data: {
                status: nextStatus,
                packingChecklist: action === "PACKING_VALIDATE" ? JSON.stringify(details) : order.packingChecklist
            }
        });

        // Audit Log entry
        await prisma.complianceAuditLog.create({
            data: {
                orderId,
                action,
                adminId: session.user.id,
                details: JSON.stringify(details || {})
            }
        });

        return NextResponse.json({ success: true, status: nextStatus });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

