import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.user?.role)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { medicineName, targetArea } = body;

        if (!medicineName) {
            return NextResponse.json({ error: "Missing medicine name" }, { status: 400 });
        }

        // 1. Create a Broadcast record
        const broadcast = await prisma.stockBroadcast.create({
            data: {
                medicineName,
                targetArea: targetArea || "All Areas",
                // Mocking that we sent it to 50 retailers
                sentCount: 50, 
                repliesCount: 0,
                status: "ACTIVE"
            }
        });

        // 2. In a real system, you would iterate over retailers and send WhatsApp messages here.
        // Example:
        // const retailers = await prisma.retailer.findMany({ where: { city: targetArea } });
        // for (let r of retailers) {
        //     await sendWhatsAppTemplate(r.phone, medicineName, broadcast.id);
        // }

        console.log(`[BROADCAST INITIATED] Sent WhatsApp inquiry for ${medicineName} to 50 retailers.`);

        // 3. To simulate real-time replies for testing purposes, we'll schedule a few mock replies.
        // In production, this block is removed and replies come strictly through the Webhook.
        setTimeout(async () => {
            try {
                const mockRetailers = ["Swastik Medicos", "City Pharmacy", "HealthPlus Stores"];
                for (let i = 0; i < mockRetailers.length; i++) {
                    await new Promise(r => setTimeout(r, 2000 + (Math.random() * 3000))); // Random delay between 2-5s
                    
                    // Simulate webhook receiving a message
                    await prisma.liveStockQuote.create({
                        data: {
                            broadcastId: broadcast.id,
                            retailerName: mockRetailers[i],
                            quantity: Math.floor(Math.random() * 50) + 10,
                            price: Math.floor(Math.random() * 500) + 50,
                        }
                    });

                    // Update broadcast reply count
                    await prisma.stockBroadcast.update({
                        where: { id: broadcast.id },
                        data: { repliesCount: { increment: 1 } }
                    });
                }
            } catch (err) {
                console.error("Mock reply simulation error:", err);
            }
        }, 1000); // Start simulating after 1 second

        return NextResponse.json({ success: true, broadcast });

    } catch (error) {
        console.error("Broadcast API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function GET(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.user?.role)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const broadcastId = searchParams.get('id');

        if (!broadcastId) {
            return NextResponse.json({ error: "Missing broadcast ID" }, { status: 400 });
        }

        const broadcast = await prisma.stockBroadcast.findUnique({
            where: { id: broadcastId },
            include: {
                responses: {
                    orderBy: { respondedAt: 'desc' }
                }
            }
        });

        return NextResponse.json({ success: true, broadcast });
    } catch (error) {
        console.error("Broadcast Fetch Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
