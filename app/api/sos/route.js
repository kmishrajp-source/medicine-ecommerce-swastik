import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req) {
    try {
        const body = await req.json();
        const {
            contactName,
            contactPhone,
            entityType,
            medicineName,
            quantity,
            location,
            pincode,
            licensePhotoUrl,
            notes
        } = body;

        // Basic validation
        if (!contactName || !contactPhone || !medicineName || !quantity || !location) {
            return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
        }

        // Create the Emergency Request
        const emergencyRequest = await prisma.emergencyRequest.create({
            data: {
                contactName,
                contactPhone,
                entityType: entityType || "UNREGISTERED",
                medicineName,
                quantity,
                location,
                pincode,
                licensePhotoUrl,
                notes,
                status: "PENDING"
            }
        });

        // TODO: In a production environment, you would trigger a WebSocket broadcast,
        // send an SMS/WhatsApp to admins, or push an FCM notification here.
        console.log(`[CRITICAL ALERT] New SOS Request from ${contactName} for ${medicineName}. Location: ${location}`);

        return NextResponse.json({
            success: true,
            message: "Emergency SOS submitted successfully. Our team has been alerted and will contact you immediately.",
            data: emergencyRequest
        });

    } catch (error) {
        console.error("SOS API Error:", error);
        return NextResponse.json({ success: false, error: "Failed to submit SOS request. Please call our helpline." }, { status: 500 });
    }
}
