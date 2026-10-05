import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req) {
    try {
        console.log("[CRON] Executing Swastik AI Growth Engine (Full Suite)...");
        const tasksToCreate = [];

        // ==========================================
        // PHASE 5 & 6: AI CONTENT & SOCIAL ENGINE
        // ==========================================
        // Mocking keyword demand signals (In reality, pulled from GSC)
        const trendingTopics = ["Preventive Healthcare for Diabetes", "Affordable Generic Medicines in UP"];
        
        for (const topic of trendingTopics) {
            tasksToCreate.push({
                priority: "NORMAL",
                title: `Draft Content: ${topic}`,
                description: `High search volume detected. AI Recommendation: Generate a medical blog article, Facebook post, and short video script. (Requires Human Medical Review)`,
                status: "PENDING",
                generatedBy: "AI_CONTENT_ENGINE",
                metaData: { topic, type: "CONTENT_CREATION" }
            });
        }

        // ==========================================
        // PHASE 7: AI WHATSAPP FUNNEL
        // ==========================================
        // 1. Unanswered Enquiries
        const unansweredWa = await prisma.whatsAppEnquiry.count({
            where: { isUnanswered: true }
        });
        if (unansweredWa > 0) {
            tasksToCreate.push({
                priority: "URGENT",
                title: `Reply Needed: ${unansweredWa} Unanswered WhatsApp Enquiries`,
                description: `${unansweredWa} users have messaged via WhatsApp and are waiting for an agent reply. AI Recommendation: Reply immediately to prevent drop-off.`,
                status: "PENDING",
                generatedBy: "AI_WHATSAPP_ENGINE",
                metaData: { count: unansweredWa, type: "WA_UNANSWERED" }
            });
        }

        // 2. Delayed Responses (> 10 mins without reply)
        const delayedWa = await prisma.whatsAppEnquiry.count({
            where: {
                isUnanswered: true,
                lastUserMsg: { lt: new Date(Date.now() - 10 * 60 * 1000) }
            }
        });
        if (delayedWa > 0) {
            tasksToCreate.push({
                priority: "HIGH",
                title: `SLA Breach: ${delayedWa} Delayed WhatsApp Responses`,
                description: `Response time has exceeded 10 minutes for ${delayedWa} leads. AI Note: Fast response times correlate directly with higher conversion rates.`,
                status: "PENDING",
                generatedBy: "AI_WHATSAPP_ENGINE",
                metaData: { count: delayedWa, type: "WA_DELAYED" }
            });
        }

        // 3. Enquiry without Order (Abandoned Funnel)
        const abandonedWa = await prisma.whatsAppEnquiry.count({
            where: {
                hasEnquired: true,
                hasOrder: false,
                lastUserMsg: { lt: new Date(Date.now() - 24 * 60 * 60 * 1000) }
            }
        });
        if (abandonedWa > 0) {
            tasksToCreate.push({
                priority: "HIGH",
                title: `Recover ${abandonedWa} Abandoned WhatsApp Enquiries`,
                description: `${abandonedWa} users enquired yesterday but didn't order. AI Recommendation: Send a follow-up asking if they need help uploading their prescription.`,
                status: "PENDING",
                generatedBy: "AI_WHATSAPP_ENGINE",
                metaData: { count: abandonedWa, type: "WA_ABANDONED" }
            });
        }

        // ==========================================
        // PHASE 8: AI CUSTOMER RETENTION (Repeat Purchase)
        // ==========================================
        // Detect customers who haven't ordered in 30 days (Due for repeat)
        const dueForRepeat = await prisma.user.count({
            where: {
                role: 'CUSTOMER',
                orders: {
                    every: {
                        createdAt: { lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
                    }
                }
            }
        });

        if (dueForRepeat > 0) {
            tasksToCreate.push({
                priority: "MEDIUM",
                title: `Repeat Purchase Due: ${dueForRepeat} Previous Customers`,
                description: `${dueForRepeat} previous customers are due for a repeat purchase (30+ days since last order). AI Recommendation: Initiate automated 'Time to Refill' WhatsApp sequence with 10% OFF code.`,
                status: "PENDING",
                generatedBy: "AI_RETENTION_ENGINE",
                metaData: { count: dueForRepeat, type: "REPEAT_PURCHASE" }
            });
        }

        // ==========================================
        // PHASE 9, 10, 11: AI B2B ACQUISITION FUNNELS
        // ==========================================
        // Check for approved but inactive pharmacies
        const inactivePharmacies = await prisma.retailer.count({
            where: { isVerified: true, status: 'inactive' }
        });
        
        if (inactivePharmacies > 0) {
            tasksToCreate.push({
                priority: "URGENT",
                title: `Activate ${inactivePharmacies} Approved Pharmacies`,
                description: `${inactivePharmacies} pharmacies are verified but not active/receiving orders. AI Recommendation: Staff must call them immediately to assist with onboarding.`,
                status: "PENDING",
                generatedBy: "AI_B2B_ENGINE",
                metaData: { count: inactivePharmacies, type: "B2B_ACTIVATION" }
            });
        }

        const unverifiedDoctors = await prisma.doctor.count({
            where: { isVerified: false }
        });

        if (unverifiedDoctors > 0) {
            tasksToCreate.push({
                priority: "HIGH",
                title: `Verify ${unverifiedDoctors} Doctor Applications`,
                description: `${unverifiedDoctors} doctors are awaiting credentials verification. AI Note: Human medical staff MUST verify credentials manually.`,
                status: "PENDING",
                generatedBy: "AI_B2B_ENGINE",
                metaData: { count: unverifiedDoctors, type: "DOCTOR_VERIFICATION" }
            });
        }


        // ==========================================
        // TASK BATCH CREATION
        // ==========================================
        let createdCount = 0;
        for (const task of tasksToCreate) {
            const existingTask = await prisma.aITask.findFirst({
                where: { title: task.title, status: "PENDING" }
            });

            if (!existingTask) {
                await prisma.aITask.create({ data: task });
                createdCount++;
            }
        }

        console.log(`[CRON] AI Growth Engine Complete. Generated ${createdCount} new intelligent tasks.`);

        return NextResponse.json({
            success: true,
            message: `Engine executed successfully. ${createdCount} tasks generated.`
        });

    } catch (error) {
        console.error("AI Growth Engine Error:", error);
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
}
