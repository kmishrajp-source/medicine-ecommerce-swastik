import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// POST: Customer submits a return request
export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);
        const body = await req.json();
        const { orderId, reason, description, photoUrl, guestName, guestPhone } = body;

        if (!orderId || !reason || !description) {
            return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
        }

        // Eligible reasons per SOP
        const ELIGIBLE_REASONS = ["wrong_product", "damaged_product", "delivery_error"];
        if (!ELIGIBLE_REASONS.includes(reason)) {
            return NextResponse.json({ success: false, error: "This return reason is not eligible under our policy." }, { status: 400 });
        }

        // Check the order exists
        const order = await prisma.order.findUnique({ where: { id: orderId } });
        if (!order) {
            return NextResponse.json({ success: false, error: "Order not found." }, { status: 404 });
        }

        // Only allow returns within 48 hours of delivery per SOP
        const now = new Date();
        const orderDate = new Date(order.createdAt);
        const hoursSinceOrder = (now - orderDate) / (1000 * 60 * 60);
        if (hoursSinceOrder > 48 && order.isDelivered) {
            return NextResponse.json({ success: false, error: "Return window has expired. Returns must be requested within 48 hours of delivery." }, { status: 400 });
        }

        // Check if a return already exists for this order
        const existing = await prisma.returnRequest.findFirst({ where: { orderId } });
        if (existing) {
            return NextResponse.json({ success: false, error: "A return request already exists for this order." }, { status: 409 });
        }

        const returnRequest = await prisma.returnRequest.create({
            data: {
                orderId,
                userId: session?.user?.id || null,
                guestName: guestName || null,
                guestPhone: guestPhone || null,
                reason,
                description,
                photoUrl: photoUrl || null,
                status: "Pending",
            }
        });

        return NextResponse.json({ success: true, returnRequest }, { status: 201 });
    } catch (error) {
        console.error("Return submission error:", error);
        return NextResponse.json({ success: false, error: "Failed to submit return request." }, { status: 500 });
    }
}

// GET: Customer checks their return status
export async function GET(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const orderId = searchParams.get("orderId");

        const where = orderId
            ? { orderId, userId: session.user.id }
            : { userId: session.user.id };

        const returns = await prisma.returnRequest.findMany({
            where,
            include: { order: { select: { id: true, total: true, status: true, createdAt: true } } },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json({ success: true, returns });
    } catch (error) {
        console.error("Return GET error:", error);
        return NextResponse.json({ success: false, error: "Failed to fetch returns." }, { status: 500 });
    }
}
