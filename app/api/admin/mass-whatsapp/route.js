import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { sendWhatsAppText } from "@/lib/whatsapp";
import { sendSMS } from "@/lib/sms";

export async function GET(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.user?.role)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Get counts for audiences
        const customerCount = await prisma.user.count({ where: { role: 'CUSTOMER' } });
        const doctorCount = await prisma.doctor.count();
        const retailerCount = await prisma.retailer.count();
        const campaignLeadsCount = await prisma.campaignLead.count();

        return NextResponse.json({
            success: true,
            counts: {
                CUSTOMERS: customerCount,
                DOCTORS: doctorCount,
                RETAILERS: retailerCount,
                CAMPAIGN_LEADS: campaignLeadsCount
            }
        });
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.user?.role)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Add method to request (SMS or WHATSAPP)
        const { audience, message, customNumbers, method = "WHATSAPP" } = await req.json();

        if (!message) {
            return NextResponse.json({ error: "Message is required" }, { status: 400 });
        }

        let targetNumbers = [];

        if (audience === "CUSTOMERS") {
            const users = await prisma.user.findMany({
                where: { role: 'CUSTOMER' },
                select: { deviceId: true }
            });
            const orders = await prisma.order.findMany({
                select: { guestPhone: true }
            });
            targetNumbers = [...new Set([
                ...users.map(u => u.deviceId).filter(Boolean),
                ...orders.map(o => o.guestPhone).filter(Boolean)
            ])];
        } else if (audience === "DOCTORS") {
            const doctors = await prisma.doctor.findMany({ select: { phone: true } });
            targetNumbers = doctors.map(d => d.phone).filter(Boolean);
        } else if (audience === "RETAILERS") {
            const retailers = await prisma.retailer.findMany({ select: { phone: true } });
            targetNumbers = retailers.map(r => r.phone).filter(Boolean);
        } else if (audience === "CAMPAIGN_LEADS") {
            const leads = await prisma.campaignLead.findMany({ select: { phone: true } });
            targetNumbers = leads.map(l => l.phone).filter(Boolean);
        } else if (audience === "CUSTOM") {
            targetNumbers = customNumbers.split(',').map(n => n.trim()).filter(Boolean);
        }

        // Deduplicate numbers
        targetNumbers = [...new Set(targetNumbers)];

        if (targetNumbers.length === 0) {
            return NextResponse.json({ error: "No target numbers found for this audience" }, { status: 400 });
        }

        // Create BroadcastCampaign record to track progress
        const campaign = await prisma.broadcastCampaign.create({
            data: {
                audience: audience,
                method: method,
                message: message,
                totalPending: targetNumbers.length
            }
        });

        // Background worker
        sendBulkMessages(targetNumbers, message, method, campaign.id);

        return NextResponse.json({ success: true, targetCount: targetNumbers.length });

    } catch (error) {
        console.error("Mass WA Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// Background worker function
async function sendBulkMessages(numbers, message, method, campaignId) {
    console.log(`[MASS BROADCAST] Starting ${method} broadcast to ${numbers.length} numbers.`);
    
    let sentCount = 0;
    let failedCount = 0;
    for (const phone of numbers) {
        try {
            let result;
            if (method === "SMS") {
                result = await sendSMS(phone, message);
            } else {
                result = await sendWhatsAppText(phone, message);
            }

            if (result && result.success) {
                sentCount++;
                await prisma.broadcastLog.create({
                    data: {
                        campaignId,
                        phone,
                        method,
                        status: "SENT",
                        providerMsgId: result.data?.id || null
                    }
                });
            } else {
                failedCount++;
                await prisma.broadcastLog.create({
                    data: {
                        campaignId,
                        phone,
                        method,
                        status: "FAILED",
                        errorMessage: result?.error || "Unknown error"
                    }
                });
            }
            
            // Small delay to prevent rate limiting (e.g., 500ms between messages)
            await new Promise(resolve => setTimeout(resolve, 500));
        } catch (err) {
            failedCount++;
            console.error(`Failed to send mass ${method} to ${phone}:`, err.message);
            await prisma.broadcastLog.create({
                data: {
                    campaignId,
                    phone,
                    method,
                    status: "FAILED",
                    errorMessage: err.message
                }
            });
        }
    }
    
    // Mark Campaign as Completed
    await prisma.broadcastCampaign.update({
        where: { id: campaignId },
        data: {
            status: "COMPLETED",
            totalSent: sentCount,
            totalFailed: failedCount,
            totalPending: 0,
            completedAt: new Date()
        }
    });

    console.log(`[MASS BROADCAST] Complete! Sent ${sentCount}/${numbers.length}.`);
}

