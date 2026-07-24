import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req) {
    try {
        // Find subscriptions that are Active and their nextDate is within the next 5 days
        const fiveDaysFromNow = new Date();
        fiveDaysFromNow.setDate(fiveDaysFromNow.getDate() + 5);

        const subscriptions = await prisma.subscription.findMany({
            where: {
                status: "Active",
                nextDate: {
                    lte: fiveDaysFromNow
                }
            },
            include: { user: true }
        });

        let processedCount = 0;

        for (const sub of subscriptions) {
            // Generate a magic link for reordering (simulated here)
            const magicLink = `https://swastikmed.online/en/checkout?reorder=${sub.id}`;
            
            // SIMULATE WHATSAPP MESSAGE
            console.log(`\n[CRON: WHATSAPP] To: ${sub.user.name || sub.userId}`);
            console.log(`Message: Your ${sub.frequency} refill for ${sub.medicineName} is due in 5 days!`);
            console.log(`Tap this link to instantly reorder with your 15% discount: ${magicLink}\n`);

            // Update nextDate so we don't spam them tomorrow
            const nextDate = new Date(sub.nextDate);
            if (sub.frequency === "Monthly") {
                nextDate.setMonth(nextDate.getMonth() + 1);
            } else if (sub.frequency === "Weekly") {
                nextDate.setDate(nextDate.getDate() + 7);
            }

            await prisma.subscription.update({
                where: { id: sub.id },
                data: { nextDate }
            });

            processedCount++;
        }

        return NextResponse.json({ success: true, processedCount });
    } catch (error) {
        console.error("Cron Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
