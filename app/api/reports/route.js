import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req) {
    try {
        const body = await req.json();
        const { targetId, targetType, reason, details } = body;

        if (!targetId || !reason) {
            return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
        }

        const report = await prisma.report.create({
            data: {
                doctorId: targetType === 'doctor' ? targetId : null,
                retailerId: targetType === 'retailer' ? targetId : null,
                reason,
                details,
                status: "OPEN"
            }
        });

        return NextResponse.json({ success: true, report });
    } catch (error) {
        console.error("Report API Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
