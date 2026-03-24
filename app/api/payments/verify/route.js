import { NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Authentication required" }, { status: 401 });
        }

        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, type, targetId, amount } = await req.json();

        // 1. Verify Signature
        const secret = process.env.RAZORPAY_KEY_SECRET || 'rzp_secret_placeholder';
        const generated_signature = crypto
            .createHmac("sha256", secret)
            .update(razorpay_order_id + "|" + razorpay_payment_id)
            .digest("hex");

        if (generated_signature !== razorpay_signature) {
            return NextResponse.json({ success: false, error: "Invalid signature" }, { status: 400 });
        }

        // 2. Process Based on Type
        let result = { success: true };

        if (type === "contact_unlock") {
            const { processContactUnlock } = require("@/lib/finance");
            await processContactUnlock(session.user.id, targetId, targetId.startsWith('doc') ? 'doctor' : (targetId.startsWith('hosp') ? 'hospital' : 'retailer'));
        } 
        
        else if (type === "lead_booking") {
            const { distributeLeadCommission } = require("@/lib/finance");
            const { leadId } = await req.json(); // Re-parsing helper or assume in initial destructure
            await distributeLeadCommission(leadId, amount);
        }

        return NextResponse.json({ success: true, paymentId: razorpay_payment_id });
    } catch (error) {
        console.error("Payment Verification Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
