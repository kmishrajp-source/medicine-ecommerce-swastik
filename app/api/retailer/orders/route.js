import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(req) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "RETAILER") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const status = searchParams.get('status') || 'Pending_Retailer_Acceptance';

        const retailer = await prisma.retailer.findUnique({
            where: { userId: session.user.id }
        });

        if (!retailer) {
            return NextResponse.json({ error: "Retailer profile not found" }, { status: 404 });
        }

        const orders = await prisma.order.findMany({
            where: {
                assignedRetailerId: retailer.id,
                status: status
            },
            include: {
                user: { select: { name: true, phone: true } },
                items: { 
                    include: { 
                        product: {
                            select: { name: true, image: true, category: true, mrp: true }
                        } 
                    } 
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        const responseKey = status === 'Preparing' ? 'preparingOrders' : 'pendingOrders';

        return NextResponse.json({ 
            success: true, 
            [responseKey]: orders 
        });
    } catch (error) {
        console.error("Retailer Orders Fetch Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
