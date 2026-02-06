import Razorpay from "razorpay";
import { NextResponse } from "next/server";
import shortid from "shortid";

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export async function POST(req) {
    const { amount } = await req.json();

    const options = {
        amount: Math.round(amount * 100), // Amount in paise
        currency: "INR",
        receipt: shortid.generate(),
    };

    try {
        const response = await razorpay.orders.create(options);
        return NextResponse.json({
            id: response.id,
            currency: response.currency,
            amount: response.amount,
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
    }
}
