import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'RETAILER') {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { orderId, tamperSealCode } = await req.json();

        if (!orderId || !tamperSealCode) {
            return NextResponse.json({ error: "Order ID and Seal Code are required" }, { status: 400 });
        }

        // 1. Verify the order belongs to this retailer and is in the correct status
        const order = await prisma.order.findUnique({
            where: { id: orderId }
        });

        if (!order) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        if (order.status !== "Preparing") {
            return NextResponse.json({ error: "Order must be in 'Preparing' status to pack." }, { status: 400 });
        }

        // 2. Update the Order status and seal code
        const updatedOrder = await prisma.order.update({
            where: { id: orderId },
            data: {
                status: "Ready_for_Pickup",
                tamperSealCode: tamperSealCode,
                integrityStatus: "PENDING"
            }
        });

        return NextResponse.json({
            success: true,
            message: "Order packed and sealed successfully. Ready for pickup.",
            order: updatedOrder
        });

    } catch (error) {
        console.error("Packing API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
