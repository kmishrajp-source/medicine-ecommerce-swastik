import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendSMS } from "@/lib/sms";

// This cron can be hit daily (e.g., via Vercel Cron or standard schedule)
export async function GET(req) {
    try {
        // Authenticate cron if needed (omitted for simplicity in this mockup context)
        
        // Find retailers in directory who are not yet verified (not on platform)
        const targetRetailers = await prisma.retailer.findMany({
            where: {
                isDirectory: true,
                verified: false,
                phone: { not: "" }
            },
            include: {
                outreachCampaign: true
            },
            take: 50 // Limit per batch to avoid rate limiting
        });

        let processed = 0;
        let sent = 0;
        const now = new Date();
        const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

        for (const retailer of targetRetailers) {
            processed++;
            
            // Clean phone (just a basic check, sms.js handles normalization too)
            if (!retailer.phone || retailer.phone.length < 10) continue;

            const campaign = retailer.outreachCampaign;
            
            // If they already responded, stop outreach
            if (campaign?.responded) continue;

            let stepToSend = 0;
            let dbUpdates = {};

            if (!campaign) {
                // Day 1
                stepToSend = 1;
                dbUpdates = { day1Sent: true, day1SentAt: now };
            } else if (!campaign.day2Sent && campaign.day1SentAt) {
                // Check if 24 hours passed since Day 1
                if (now.getTime() - new Date(campaign.day1SentAt).getTime() > TWENTY_FOUR_HOURS) {
                    stepToSend = 2;
                    dbUpdates = { day2Sent: true, day2SentAt: now };
                }
            } else if (!campaign.day3Sent && campaign.day2SentAt) {
                // Check if 24 hours passed since Day 2
                if (now.getTime() - new Date(campaign.day2SentAt).getTime() > TWENTY_FOUR_HOURS) {
                    stepToSend = 3;
                    dbUpdates = { day3Sent: true, day3SentAt: now };
                }
            }

            if (stepToSend > 0) {
                let message = "";
                const partnerUrl = "https://swastikmedicare.in/retailer/login"; // Partner sign up URL
                const videoUrl = "https://youtu.be/dQw4w9WgXcQ"; // Placeholder video link

                switch (stepToSend) {
                    case 1:
                        message = `Hi ${retailer.shopName || 'Retailer'}, from Swastik Medicare! Join our digital healthcare network in Gorakhpur and get online orders. Watch this guide: ${videoUrl} Sign up here: ${partnerUrl}`;
                        break;
                    case 2:
                        message = `Hello again! Don't miss out on increasing your pharmacy's revenue with Swastik Medicare. It's free to list. Register here: ${partnerUrl}`;
                        break;
                    case 3:
                        message = `Final reminder: Join Swastik Medicare to start receiving medicine orders directly from your local customers. Reply "YES" to get a callback from our team, or sign up: ${partnerUrl}`;
                        break;
                }

                // Send SMS via existing lib
                const smsResult = await sendSMS(retailer.phone, message);

                if (smsResult.success) {
                    // Update DB tracking
                    await prisma.retailerOutreachCampaign.upsert({
                        where: { retailerId: retailer.id },
                        create: {
                            retailerId: retailer.id,
                            phone: retailer.phone,
                            ...dbUpdates
                        },
                        update: dbUpdates
                    });
                    sent++;
                }
            }
        }

        return NextResponse.json({
            success: true,
            message: `Cron completed. Processed: ${processed}, Sent: ${sent}`
        });

    } catch (error) {
        console.error("Retailer Outreach Cron Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
