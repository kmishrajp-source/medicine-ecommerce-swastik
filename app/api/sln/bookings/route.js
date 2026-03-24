import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req) {
    try {
        const { serviceType, providerId, guestName, guestPhone, guestEmail, details, userId, publisherId } = await req.json();

        if (!serviceType || !guestPhone) {
            return NextResponse.json({ error: "Service type and phone are required" }, { status: 400 });
        }

        const lead = await prisma.lead.create({
            data: {
                serviceType,
                providerId: providerId || null,
                userId: userId || null,
                publisherId: publisherId || null,
                guestName,
                guestPhone,
                guestEmail,
                details,
                status: 'new'
            }
        });

        // Trigger notifications here (WhatsApp/Email)
        // sendSLNNotification(lead);

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
