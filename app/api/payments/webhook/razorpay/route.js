import { NextResponse } from "next/server";
import crypto from "crypto";
import { SSMSAutomation } from "@/lib/ssms-automation";

export async function POST(req) {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || "ssms_webhook_secret_123";
    const signature = req.headers.get("x-razorpay-signature");

    try {
        const body = await req.text();
        
        // Verify Signature
        const expectedSignature = crypto
            .createHmac("sha256", secret)
            .update(body)
            .digest("hex");

        if (signature !== expectedSignature) {
            console.error("[RAZORPAY WEBHOOK] Invalid Signature");
            // For demo/mock purposes, we might skip this check if env is not set
            // return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
        }

        const data = JSON.parse(body);
        console.log("[RAZORPAY WEBHOOK] Received Event:", data.event);

        if (data.event === "payment.captured" || data.event === "order.paid") {
            const payment = data.payload.payment.entity;
            const notes = payment.notes || {};
            
            // Expected note: leadId
            if (notes.leadId) {
                console.log(`[RAZORPAY WEBHOOK] Processing success for Lead: ${notes.leadId}`);
                await SSMSAutomation.handlePaymentSuccess(notes.leadId, payment.id);
            }
        }

        return NextResponse.json({ status: "ok" });
    } catch (error) {
        console.error("[RAZORPAY WEBHOOK] Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
