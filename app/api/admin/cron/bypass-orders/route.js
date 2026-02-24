import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { assignOrderToNearestRetailer } from "@/utils/routing";

export async function GET(req) {
    // In production, you would secure this endpoint via a secret cron key
    // For e.g. if (req.headers.get("Authorization") !== `Bearer ${process.env.CRON_SECRET}`)

    try {
        // Calculate the threshold time: 3 minutes ago
        const threeMinutesAgo = new Date(Date.now() - 3 * 60 * 1000);

        // Find all orders that have been waiting for a retailer's response for longer than 3 minutes
        const timedOutOrders = await prisma.order.findMany({
            where: {
                status: "Pending_Retailer_Acceptance",
                assignedAt: { lt: threeMinutesAgo },
                assignedRetailerId: { not: null }
            }
        });

        if (timedOutOrders.length === 0) {
            return NextResponse.json({ message: "No timed-out orders found." });
        }

        const bypassResults = [];

        for (const order of timedOutOrders) {
            // 1. Log the timeout and append the unresponsive retailer to the 'declined' list
            const updatedOrder = await prisma.order.update({
                where: { id: order.id },
                data: {
                    status: "Processing", // Reset momentarily before re-routing
                    assignedRetailerId: null, // Clear the assigned retailer
                    declinedRetailers: {
                        push: order.assignedRetailerId // Track that they missed the window
                    }
                }
            });

            // 2. Mathematically bounce the order to the NEXT closest vendor within 5km
            // The routing engine now natively filters out the newly pushed `declinedRetailers` array
            const newAssignment = await assignOrderToNearestRetailer(order.id);

            bypassResults.push({
                orderId: order.id,
                bypassedRetailerId: order.assignedRetailerId,
                successfullyReassignedTo: newAssignment ? newAssignment.assignedRetailerId : "ADMIN_MANUAL_INTERVENTION_REQUIRED"
            });
        }

        return NextResponse.json({
            success: true,
            message: `Processed ${bypassResults.length} timed-out orders.`,
            bypasses: bypassResults
        });

    } catch (error) {
        console.error("[CRON_ERROR] Failed to execute auto-bypass logic:", error);
        return NextResponse.json({ error: "Internal Cron Job Failure", details: error.message }, { status: 500 });
    }
}
