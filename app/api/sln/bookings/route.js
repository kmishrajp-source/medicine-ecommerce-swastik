import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import { WhatsAppTriggers } from "@/lib/whatsapp";

export async function POST(req) {
    try {
        // 1. Check for Publisher Referral in Cookie if not provided in body
        let finalPublisherId = publisherId;
        if (!finalPublisherId) {
            const cookieStore = await cookies();
            const publisherRef = cookieStore.get('publisher_ref')?.value;
            if (publisherRef) {
                const publisher = await prisma.publisher.findUnique({
                    where: { referralCode: publisherRef }
                });
                if (publisher) finalPublisherId = publisher.id;
            }
        }

        const lead = await prisma.lead.create({
            data: {
                serviceType,
                providerId: providerId || null,
                userId: userId || null,
                publisherId: finalPublisherId || null,
                guestName,
                guestPhone,
                guestEmail,
                details,
                status: 'new'
            }
        });

        // 2. Trigger WhatsApp Notifications
        try {
            // Customer Confirmation
            await WhatsAppTriggers.leadCreatedCustomer(guestPhone, guestName || "Customer", serviceType);
            
            // Provider Notification (If providerId exists, we'd find their phone, for now alert admin or use a default)
            // Example: const doc = await prisma.doctor.findUnique({ where: { id: providerId } });
            // if (doc?.phone) await WhatsAppTriggers.leadCreatedProvider(doc.phone, guestName, guestPhone, serviceType);
        } catch (err) {
            console.error("WhatsApp Notification failed:", err);
        }

        return NextResponse.json({ 
            success: true, 
            lead: lead, 
            message: "Your booking request has been sent to Swastik Medicare. Our team will contact you shortly." 
        });

    } catch (error) {
        console.error("SLN Booking Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
