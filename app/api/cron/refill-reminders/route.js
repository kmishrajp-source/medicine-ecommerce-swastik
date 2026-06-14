import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { WhatsAppTriggers } from "@/lib/whatsapp";

// Chronic keywords for filtering
const CHRONIC_CATEGORIES = ["diabetes", "blood pressure", "heart", "thyroid", "cholesterol", "asthma", "cardiac"];
const CHRONIC_SALTS = ["metformin", "losartan", "insulin", "amlodipine", "atorvastatin", "thyroxine", "levothyroxine", "rosuvastatin", "telmisartan", "glimepiride"];

function isChronic(product) {
    if (!product) return false;
    
    const cat = (product.category || "").toLowerCase();
    const name = (product.name || "").toLowerCase();
    const composition = (product.composition || "").toLowerCase();
    const salt = (product.salt || "").toLowerCase();

    // Check Categories
    if (CHRONIC_CATEGORIES.some(c => cat.includes(c))) return true;

    // Check Name, Composition, Salt against known chronic salts
    const textToCheck = `${name} ${composition} ${salt}`;
    if (CHRONIC_SALTS.some(s => textToCheck.includes(s))) return true;

    return false;
}

export async function GET(req) {
    try {
        // Secure the endpoint (Vercel sets CRON_SECRET)
        const authHeader = req.headers.get('authorization');
        if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Target Date: Exactly 25 days ago
        const targetDateStart = new Date();
        targetDateStart.setDate(targetDateStart.getDate() - 25);
        targetDateStart.setHours(0, 0, 0, 0);

        const targetDateEnd = new Date();
        targetDateEnd.setDate(targetDateEnd.getDate() - 25);
        targetDateEnd.setHours(23, 59, 59, 999);

        const targetOrders = await prisma.order.findMany({
            where: {
                createdAt: {
                    gte: targetDateStart,
                    lte: targetDateEnd
                },
                status: "Delivered"
            },
            include: {
                user: true,
                items: {
                    include: { product: true }
                }
            }
        });

        let remindersSent = 0;

        for (const order of targetOrders) {
            // Find if this order contains any chronic medicine
            const chronicItems = order.items.filter(item => isChronic(item.product));
            
            if (chronicItems.length > 0) {
                const primaryMedicine = chronicItems[0].product.name;
                const phone = order.guestPhone || order.user?.phone;
                const name = order.guestName || order.user?.name || "Customer";
                
                if (phone) {
                    // Generate a 1-click reorder link (mocked structure)
                    // In a real app, this might lead to a cart-rebuild endpoint
                    const reorderLink = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://medicine-ecommerce-swastik.vercel.app'}/reorder/${order.id}`;
                    
                    try {
                        await WhatsAppTriggers.refillReminder(phone, name, primaryMedicine, reorderLink);
                        remindersSent++;
                    } catch (e) {
                        console.error(`Failed to send refill reminder for order ${order.id}:`, e);
                    }
                }
            }
        }

        return NextResponse.json({
            success: true,
            message: `Cron executed. Scanned ${targetOrders.length} delivered orders. Sent ${remindersSent} refill reminders.`
        });

    } catch (error) {
        console.error("Cron Auto-Refill Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
