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

        // 2. Twilio WhatsApp Integration — uses same env vars as /api/send-whatsapp
        const twilioSid = process.env.TWILIO_SID;
        const twilioAuth = process.env.TWILIO_AUTH_TOKEN;
        const twilioNumber = process.env.TWILIO_WHATSAPP_NUMBER || '+14155238886';

        if (twilioSid && twilioAuth) {
            const twilio = require('twilio');
            const twilioClient = twilio(twilioSid, twilioAuth);

            // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            // PULL FROM ALL 3 SOURCES — Retailer Directory,
            // Stockist Directory, and Registered Users
            // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            const [retailersDir, stockistsDir, registeredUsers] = await Promise.all([
                // 1. Retailer directory (includes unregistered/field agent entries)
                prisma.retailer.findMany({
                    where: {
                        phone: { not: "" },
                        ...(targetArea ? { city: { contains: targetArea, mode: 'insensitive' } } : {})
                    },
                    select: { id: true, shopName: true, phone: true }
                }),

                // 2. Stockist directory
                prisma.stockist.findMany({
                    where: { phone: { not: "" } },
                    select: { id: true, agencyName: true, phone: true }
                }),

                // 3. Registered app users with RETAILER/STOCKIST role
                prisma.user.findMany({
                    where: {
                        role: { in: ['RETAILER', 'STOCKIST'] },
                        phone: { not: null },
                        ...(targetArea ? { city: { contains: targetArea, mode: 'insensitive' } } : {})
                    },
                    select: { id: true, name: true, phone: true }
                })
            ]);

            // Build a deduplicated list by phone (last 10 digits)
            const phonesSeen = new Set();
            const allRecipients = [];

            const addIfNew = (phone, name, sourceType) => {
                if (!phone) return;
                const clean = phone.replace(/\D/g, '').slice(-10);
                if (clean.length < 10) return;
                if (phonesSeen.has(clean)) return;
                phonesSeen.add(clean);
                allRecipients.push({ phone: clean, name, sourceType });
            };

            retailersDir.forEach(r => addIfNew(r.phone, r.shopName, 'Retailer'));
            stockistsDir.forEach(s => addIfNew(s.phone, s.agencyName, 'Stockist'));
            registeredUsers.forEach(u => addIfNew(u.phone, u.name, 'User'));

            let sentCount = 0;
            for (const recipient of allRecipients) {
                try {
                    const messageBody = `🚨 Urgent inquiry from Swastik Medicare:\nDo you have stock of *${medicineName}*?\nReply: YES [Qty] [Price]\nExample: YES 50 1200\n(Ref: ${broadcast.id})`;

                    await twilioClient.messages.create({
                        body: messageBody,
                        from: `whatsapp:${twilioNumber}`,
                        to: `whatsapp:+91${recipient.phone}`
                    });
                    sentCount++;
                } catch (msgErr) {
                    console.error(`[TWILIO] Failed to send to ${recipient.phone}:`, msgErr.message);
                }
            }

            // Update broadcast with actual sent count
            await prisma.stockBroadcast.update({
                where: { id: broadcast.id },
                data: { sentCount }
            });

            console.log(`[BROADCAST] Sent to ${sentCount} recipients — ${retailersDir.length} retailers + ${stockistsDir.length} stockists + ${registeredUsers.length} app users (deduped).`);

        } else {
            console.log(`[BROADCAST INITIATED] Missing Twilio Env variables. Simulating broadcast...`);

            // 3. Fallback Simulator (if no Twilio credentials)
            setTimeout(async () => {
                try {
                    const mockRetailers = ["Swastik Medicos", "City Pharmacy", "HealthPlus Stores"];
                    for (let i = 0; i < mockRetailers.length; i++) {
                        await new Promise(r => setTimeout(r, 2000 + (Math.random() * 3000))); // Random delay between 2-5s
                        
                        await prisma.liveStockQuote.create({
                            data: {
                                broadcastId: broadcast.id,
                                retailerName: mockRetailers[i],
                                quantity: Math.floor(Math.random() * 50) + 10,
                                price: Math.floor(Math.random() * 500) + 50,
                            }
                        });

                        await prisma.stockBroadcast.update({
                            where: { id: broadcast.id },
                            data: { repliesCount: { increment: 1 } }
                        });
                    }
                } catch (err) {
                    console.error("Mock reply simulation error:", err);
                }
            }, 1000); // Start simulating after 1 second
        }

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
