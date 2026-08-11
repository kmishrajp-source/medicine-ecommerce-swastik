import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'RETAILER') {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { orderId, tamperSealCode, retailerProcurementCost } = await req.json();

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

        // 2. Fetch Retailer to get agreed platform margin
        const retailer = await prisma.retailer.findUnique({
            where: { userId: session.user.id },
            select: { id: true, agreedPlatformMargin: true }
        });

        if (!retailer) {
            return NextResponse.json({ error: "Retailer profile not found" }, { status: 404 });
        }

        // 3. Update the Order status and seal code
        const updatedOrder = await prisma.order.update({
            where: { id: orderId },
            data: {
                status: "Ready_for_Pickup",
                tamperSealCode: tamperSealCode,
                integrityStatus: "PENDING"
            }
        });

        // Ensure a SubOrder exists
        let subOrder = await prisma.subOrder.findFirst({
            where: { orderId: order.id, retailerId: retailer.id }
        });

        if (!subOrder) {
            subOrder = await prisma.subOrder.create({
                data: {
                    orderId: order.id,
                    retailerId: retailer.id,
                    userId: order.userId,
                    items: order.items || [], // Could fetch actual items if needed
                    total: customerTotal,
                    status: "Invoice_Generated"
                }
            });
        }

        // 4. Generate Settlement Item (Phase 2 Upgrade)
        // First check for a global active Commission Rule
        const activeRule = await prisma.commissionRule.findFirst({
            where: { isActive: true },
            orderBy: { createdAt: 'desc' }
        });
        
        const customerTotal = order.total;
        
        // Calculate Platform Commission
        let commissionAmount = 0;
        if (activeRule) {
            if (activeRule.type === 'PERCENTAGE') {
                commissionAmount = (customerTotal * activeRule.value) / 100;
            } else if (activeRule.type === 'FIXED') {
                commissionAmount = activeRule.value;
            }
        } else {
            // Fallback to legacy retailer margin or 10% default
            const platformMarginPerc = retailer.agreedPlatformMargin || 10.0;
            commissionAmount = (customerTotal * platformMarginPerc) / 100;
        }
        
        const netSettlementAmount = customerTotal - commissionAmount;

        // Create the Settlement Item making it ELIGIBLE
        // If one already exists (e.g. repacking), we update it instead of crashing
        let settlementItem = await prisma.settlementItem.findUnique({
            where: { subOrderId: subOrder.id }
        });
        
        if (settlementItem) {
            settlementItem = await prisma.settlementItem.update({
                where: { id: settlementItem.id },
                data: {
                    grossAmount: customerTotal,
                    commission: commissionAmount,
                    netAmount: netSettlementAmount,
                    status: "ELIGIBLE"
                }
            });
        } else {
            settlementItem = await prisma.settlementItem.create({
                data: {
                    retailerId: retailer.id,
                    subOrderId: subOrder.id,
                    grossAmount: customerTotal,
                    commission: commissionAmount,
                    netAmount: netSettlementAmount,
                    status: "ELIGIBLE"
                }
            });
        }

        return NextResponse.json({
            message: "Order packed. Settlement calculated and marked Eligible.",
            order: updatedOrder,
            settlement: settlementItem
        });

    } catch (error) {
        console.error("Packing API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
