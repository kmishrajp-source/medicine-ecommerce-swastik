import { NextResponse } from "next/server";
import razorpay from "@/lib/razorpay";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Authentication required" }, { status: 401 });
        }

        const { amount, currency = "INR", receipt, notes } = await req.json();

        if (!amount || amount < 1) {
            return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
        }

        const options = {
            amount: Math.round(amount * 100), // Razorpay expects amount in paise
            currency,
            receipt: receipt || `receipt_${Date.now()}`,
            notes: {
                userId: session.user.id,
                ...notes
            }
        };

        const order = await razorpay.orders.create(options);

        return NextResponse.json({ success: true, order });
    } catch (error) {
        console.error("Razorpay Order Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
