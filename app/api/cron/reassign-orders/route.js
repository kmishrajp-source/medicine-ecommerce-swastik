import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { assignOrderToNearestRetailer } from "@/utils/routing";

const prisma = new PrismaClient();

// GET /api/cron/reassign-orders
// Triggered every 1-2 minutes by Vercel Cron
export async function GET(req) {
  try {
    // 1. Authenticate the cron request
    const authHeader = req.headers.get("authorization");
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Find orders stuck in 'Pending_Retailer_Acceptance' for more than 2 minutes
    const twoMinutesAgo = new Date();
    twoMinutesAgo.setMinutes(twoMinutesAgo.getMinutes() - 2);

    const pendingOrders = await prisma.order.findMany({
      where: {
        status: "Pending_Retailer_Acceptance",
        assignedAt: { lt: twoMinutesAgo },
        assignedRetailerId: { not: null }
      },
      select: { id: true, assignedRetailerId: true }
    });

    if (pendingOrders.length === 0) {
      return NextResponse.json({ success: true, message: "No stale orders to reassign." });
    }

    let reassignedCount = 0;

    // 3. Process Reassignments
    for (const order of pendingOrders) {
      // Add the ignoring retailer to the declined list so they don't get it again
      await prisma.order.update({
        where: { id: order.id },
        data: {
          assignedRetailerId: null, // Wipe current
          status: "Received", // Reset status so router picks it up
          declinedRetailers: { push: order.assignedRetailerId }
        }
      });
      
      // Attempt to find the next nearest retailer
      const routed = await assignOrderToNearestRetailer(order.id);
      
      if (routed) {
          reassignedCount++;
      } else {
         // If no one is left, log it as a critical system failure
         await prisma.systemHealthLog.create({
            data: {
              component: "ORDER_ROUTING",
              issueType: "NO_PHARMACIES_AVAILABLE",
              severity: "CRITICAL",
              message: `Order #${order.id} exhausted all nearby pharmacies. Manual admin intervention required.`,
              details: { orderId: order.id }
            }
         });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${pendingOrders.length} stale orders. successfully routed ${reassignedCount}.`
    });

  } catch (error) {
    console.error("Order Reassignment Cron Error:", error);
    return NextResponse.json({ error: "Failed to reassign orders" }, { status: 500 });
  }
}
