import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request) {
    try {
        const body = await request.json();
        const { doctorId, retailerId, reason, details } = body;

        if (!reason) {
            return NextResponse.json({ success: false, error: "Reason is required" }, { status: 400 });
        }

        const report = await prisma.report.create({
            data: {
                doctorId,
                retailerId,
                reason,
                details,
                status: "OPEN"
            }
        });

        return NextResponse.json({ success: true, report });
    } catch (error) {
        console.error("Failed to submit report:", error);
        return NextResponse.json({ success: false, error: "Failed to submit report" }, { status: 500 });
    }
}
