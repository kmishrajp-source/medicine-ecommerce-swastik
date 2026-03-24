import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const razorpay = new Razorpay({
    key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);
        const { amount, currency = "INR", receipt = "receipt_" + Date.now() } = await req.json();

        if (!amount) {
            return NextResponse.json({ error: "Amount is required" }, { status: 400 });
        }

        const options = {
            amount: Math.round(amount * 100), // convert to paise
            currency,
            receipt,
        };

        const order = await razorpay.orders.create(options);
        return NextResponse.json(order);
    } catch (error) {
        console.error("Razorpay Order Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
