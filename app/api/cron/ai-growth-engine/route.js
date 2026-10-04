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
        // Detect Leads that came from WhatsApp but never placed an order
        const abandonedWaLeads = await prisma.lead.count({
            where: {
                source: 'whatsapp',
                status: { notIn: ['converted', 'rejected'] },
                createdAt: { lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Older than 24 hours
            }
        });

        if (abandonedWaLeads > 0) {
            tasksToCreate.push({
                priority: "HIGH",
                title: `Follow Up: ${abandonedWaLeads} Abandoned WhatsApp Leads`,
                description: `${abandonedWaLeads} users started a WhatsApp chat 24+ hours ago but haven't placed an order. AI Recommendation: Send a polite check-in or discount offer.`,
                status: "PENDING",
                generatedBy: "AI_WHATSAPP_ENGINE",
                metaData: { count: abandonedWaLeads, type: "WA_FOLLOWUP" }
            });
        }

        // ==========================================
        // PHASE 8: AI CUSTOMER RETENTION
        // ==========================================
        // Detect customers who haven't ordered in 30 days
        const dormantCustomers = await prisma.user.count({
            where: {
                role: 'CUSTOMER',
                orders: {
                    every: {
                        createdAt: { lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
                    }
                }
            }
        });

        if (dormantCustomers > 0) {
            tasksToCreate.push({
                priority: "MEDIUM",
                title: `Retention Risk: ${dormantCustomers} Dormant Customers`,
                description: `${dormantCustomers} customers haven't ordered in 30 days. AI Recommendation: Initiate automated 'We Miss You' SMS/WhatsApp sequence with 10% OFF code.`,
                status: "PENDING",
                generatedBy: "AI_RETENTION_ENGINE",
                metaData: { count: dormantCustomers, type: "RETENTION_CAMPAIGN" }
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
