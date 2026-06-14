import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { WhatsAppTriggers } from "@/lib/whatsapp";

export async function GET(req) {
    try {
        // Secure the endpoint via Vercel CRON_SECRET
        const authHeader = req.headers.get('authorization');
        if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://medicine-ecommerce-swastik.vercel.app';

        // Define the 2-hour abandonment window
        // We look for orders updated between 2h and 3h ago (to avoid double-messaging)
        const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
        const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000);

        // Find all orders that are in the "Pharmacist_Approved" status
        // but have NOT yet been paid — i.e., the status has not advanced beyond this point
        const abandonedOrders = await prisma.order.findMany({
            where: {
                status: "Pharmacist_Approved",
                updatedAt: {
                    gte: threeHoursAgo,
                    lte: twoHoursAgo
                }
            },
            include: {
                user: true
            }
        });

        let remindersSent = 0;
        let failCount = 0;

        for (const order of abandonedOrders) {
            const phone = order.guestPhone || order.user?.phone;
            const name = order.guestName || order.user?.name || "Customer";

            if (!phone) {
                failCount++;
                continue;
            }

            // Build a deep-link to the order payment page
            const paymentLink = `${siteUrl}/en/orders/${order.id}`;

            try {
                await WhatsAppTriggers.abandonedCartReminder(phone, name, paymentLink);
                remindersSent++;
            } catch (e) {
                console.error(`Abandoned cart WA failed for order ${order.id}:`, e);
                failCount++;
            }
        }

        return NextResponse.json({
            success: true,
            message: `Cron executed. Found ${abandonedOrders.length} abandoned Rx quotes. Sent ${remindersSent} reminders, ${failCount} failed.`
        });

    } catch (error) {
        console.error("Abandoned Cart Cron Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
