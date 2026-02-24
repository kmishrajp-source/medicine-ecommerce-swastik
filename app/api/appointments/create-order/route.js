import Razorpay from "razorpay";
import { NextResponse } from "next/server";
import shortid from "shortid";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req) {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
        console.error("Razorpay keys are missing");
        return NextResponse.json({ error: "Payment configuration missing" }, { status: 500 });
    }

    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { doctorId } = await req.json();

    if (!doctorId) {
        return NextResponse.json({ error: "Doctor ID is required" }, { status: 400 });
    }

    try {
        const doctor = await prisma.doctor.findUnique({
            where: { id: doctorId }
        });

        if (!doctor) {
            return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
        }

        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });

        // Amount in paise (1 INR = 100 paise)
        const amountInPaise = Math.round((doctor.consultationFee || 500) * 100);

        const options = {
            amount: amountInPaise,
            currency: "INR",
            receipt: shortid.generate(),
        };

        // If the doctor has a linked Razorpay account, route 100% of the funds to them
        if (doctor.razorpayAccountId) {
            options.transfers = [
                {
                    account: doctor.razorpayAccountId,
                    amount: amountInPaise,
                    currency: "INR",
                    notes: {
                        name: "Consultation Fee Transfer",
                        roll_no: "IEC2011025"
                    },
                    linked_account_notes: ["roll_no"],
                    on_hold: false
                }
            ];
        }

        const response = await razorpay.orders.create(options);

        return NextResponse.json({
            success: true,
            id: response.id,
            currency: response.currency,
            amount: response.amount,
            consultationFee: doctor.consultationFee || 500
        });
    } catch (error) {
        console.error("Error creating Razorpay Order for Doctor:", error);
        return NextResponse.json({ error: "Failed to create appointment order" }, { status: 500 });
    }
}
