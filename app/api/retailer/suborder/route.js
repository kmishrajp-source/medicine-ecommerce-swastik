import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { performAutomaticSubstitution } from "@/utils/marketplace";

/**
 * Retailer SubOrder Management API
 * Allows retailers to view their assigned sub-orders and mark items as OUT_OF_STOCK,
 * which triggers the automatic substitution engine.
 */

export async function GET(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "RETAILER") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Find the retailer profile for this user
        const retailer = await prisma.retailer.findUnique({
            where: { userId: session.user.id }
        });

        if (!retailer) return NextResponse.json({ error: "Retailer profile not found" }, { status: 404 });

        const subOrders = await prisma.subOrder.findMany({
            where: { retailerId: retailer.id },
            include: { order: true },
            orderBy: { createdAt: "desc" }
        });

        return NextResponse.json({ success: true, subOrders });

    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

/**
 * Update SubOrder item status (e.g., Mark as out of stock)
 */
export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "RETAILER") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { subOrderId, outOfStockItemName } = await req.json();

        // 1. Verify this sub-order belongs to the retailer
        const retailer = await prisma.retailer.findUnique({
            where: { userId: session.user.id }
        });

        const subOrder = await prisma.subOrder.findUnique({
            where: { id: subOrderId }
        });

        if (!subOrder || subOrder.retailerId !== retailer?.id) {
            return NextResponse.json({ error: "Invalid access to sub-order" }, { status: 403 });
        }

        // 2. Trigger Automatic Substitution Engine
        console.log(`[RETAILER API] Retailer marked ${outOfStockItemName} as out of stock in SubOrder ${subOrderId}`);
        const substitutionResult = await performAutomaticSubstitution(subOrderId, outOfStockItemName);

        if (substitutionResult) {
            return NextResponse.json({
                success: true,
                message: `Substitution successful: Generic alternative found and assigned to another retailer.`,
                newSubOrderId: substitutionResult.id
            });
        } else {
            return NextResponse.json({
                success: false,
                message: "No generic substitute found in nearby retailers. Manual admin intervention required."
            });
        }

    } catch (error) {
        console.error("[RETAILER API ERROR]", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

