import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request) {
    try {
        const body = await request.json();
        const { type, targetId, targetType, area } = body;

        if (!type || !targetId) {
            return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
        }

        // Store click/view in database
        // We'll use a generic Analytics table or specific interaction logs
        // For now, let's assume an Interaction model exists or create a simple log
        
        await prisma.interaction.create({
            data: {
                type,        // 'call', 'whatsapp', 'view'
                targetId,    // Doctor/Store ID
                targetType,  // 'doctor', 'retailer', etc.
                area: area || 'Unknown',
                timestamp: new Date()
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Tracking failed:", error);
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
}
