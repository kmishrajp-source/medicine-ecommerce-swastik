import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req) {
    try {
        const body = await req.json();
        
        const { name, phone, area, vehicle, availability } = body;

        if (!name || !phone) {
            return NextResponse.json({ success: false, message: "Name and Phone are required" }, { status: 400 });
        }

        // Ideally, we'd check if a User exists with this phone.
        // For Swastik MVP Platform Delivery Model, we'll create the Agent record. 
        // We link to a new user account if one doesn't exist.
        
        // 1. Check if user exists based on phone (if phone was unique, but it's not unique in our schema by default unless specified). 
        // We'll create a DeliveryAgent directly, optionally linking a User.
        
        // Try creating standard Delivery Agent record
        const newAgent = await prisma.deliveryAgent.create({
            data: {
                name,
                phone,
                vehicleNo: vehicle, // Re-using vehicle string as type for MVP
                status: "OFFLINE", // Starts offline until approved
                // Add any other mapped stats if needed
            }
        });

        // The platform admin will review this agent in the CRM's Logistics tab.

        return NextResponse.json({ 
            success: true, 
            message: "Delivery agent onboarded successfully", 
            agentId: newAgent.id 
        });

    } catch (error) {
        console.error("Delivery Agent Onboarding Error:", error);
        return NextResponse.json({ success: false, message: "Server error", error: error.message }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}
