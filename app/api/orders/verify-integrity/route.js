import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req) {
    try {
        const { orderId, status, notes } = await req.json();

        if (!orderId || !status) {
            return NextResponse.json({ error: "Order ID and Status are required" }, { status: 400 });
        }

        // 1. Fetch the order
        const order = await prisma.order.findUnique({
            where: { id: orderId }
        });

        if (!order) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        // 2. Update Integrity Status
        const updatedOrder = await prisma.order.update({
            where: { id: orderId },
            data: {
                integrityStatus: status, // INTACT, TAMPERED, DAMAGED
                integrityCheckAt: new Date(),
                integrityCheckNotes: notes || ""
            }
        });

        // 3. If TAMPERED or DAMAGED, automatically create a Complaint
        if (status === "TAMPERED" || status === "DAMAGED") {
            await prisma.complaint.create({
                data: {
                    userId: order.userId || "guest", // Assuming we track guestId or similar if needed
                    orderId: orderId,
                    subject: `Package Integrity Issue: ${status}`,
                    description: `Customer reported the package as ${status.toLowerCase()}. Code found on seal: ${order.tamperSealCode || 'None'}. Notes: ${notes || 'No additional notes provided.'}`,
                    status: "Open",
                    priority: "High"
                }
            });
            
            // Note: In a real system, you'd also decrement the Delivery Agent's reputation or flag them here.
        }

        return NextResponse.json({
            success: true,
            message: "Integrity check completed.",
            order: updatedOrder
        });

    } catch (error) {
        console.error("Integrity Verification Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
