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

        // 2. Twilio WhatsApp Integration
        const accountSid = process.env.TWILIO_ACCOUNT_SID;
        const authToken = process.env.TWILIO_AUTH_TOKEN;
        const twilioNumber = process.env.TWILIO_WHATSAPP_NUMBER;

        if (accountSid && authToken && twilioNumber) {
            // Find real retailers to message
            // Currently, we don't have a specific Retailer model with valid phone numbers in schema.prisma,
            // so we will simulate fetching from DB and send a test message to a specified admin number if provided,
            // or just log that we would iterate over them.
            const targetPhone = process.env.TWILIO_TEST_DESTINATION_NUMBER; // E.g., whatsapp:+919876543210
            
            if (targetPhone) {
                const messageBody = `Urgent inquiry from Swastik Medicare:\nDo you have stock of *${medicineName}*?\nReply with: YES [Qty] [Price]\n(Ref: ${broadcast.id})`;
                const encodedCreds = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
                
                const formData = new URLSearchParams();
                formData.append('To', targetPhone.startsWith('whatsapp:') ? targetPhone : `whatsapp:${targetPhone}`);
                formData.append('From', twilioNumber.startsWith('whatsapp:') ? twilioNumber : `whatsapp:${twilioNumber}`);
                formData.append('Body', messageBody);

                try {
                    const twilioRes = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Basic ${encodedCreds}`,
                            'Content-Type': 'application/x-www-form-urlencoded'
                        },
                        body: formData
                    });

                    if (twilioRes.ok) {
                        console.log(`[TWILIO] Sent real WhatsApp message for ${medicineName} to ${targetPhone}`);
                        await prisma.stockBroadcast.update({
                            where: { id: broadcast.id },
                            data: { sentCount: 1 }
                        });
                    } else {
                        const errText = await twilioRes.text();
                        console.error(`[TWILIO ERROR] Failed to send: ${errText}`);
                    }
                } catch (apiError) {
                    console.error("[TWILIO FETCH ERROR]", apiError);
                }
            }
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
