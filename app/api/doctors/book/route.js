import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import Razorpay from "razorpay";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export async function POST(req) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { doctorId, date, reason } = await req.json();

        if (!doctorId || !date) {
            return NextResponse.json({ error: "Doctor ID and Appointment Date are required." }, { status: 400 });
        }

        const doctor = await prisma.doctor.findUnique({
            where: { id: doctorId },
            include: { user: { select: { name: true, email: true } } }
        });

        if (!doctor) {
            return NextResponse.json({ error: "Doctor not found." }, { status: 404 });
        }

        // 1. Database Creation (Status: Pending Payment)
        const appointment = await prisma.appointment.create({
            data: {
                patientId: session.user.id,
                doctorId: doctor.id,
                date: new Date(date),
                reason,
                status: "Pending_Payment"
            }
        });

        // 2. Razorpay Order Creation with Route (100% Transfer)
        const amountInPaise = Math.round(doctor.consultationFee * 100);

        const orderPayload = {
            amount: amountInPaise,
            currency: "INR",
            receipt: `appointment_${appointment.id}`,
            // We use standard Razorpay if the doctor doesn't have an ID yet 
            // for development/testing safety
        };

        // If the Doctor has completed KYC and linked their Virtual Account,
        // we use Razorpay Route to instantly split 100% of the funds to them.
        if (doctor.razorpayAccountId) {
            orderPayload.transfers = [
                {
                    account: doctor.razorpayAccountId,
                    amount: amountInPaise,
                    currency: "INR",
                    notes: {
                        name: `Consultation Fee for ${doctor.user.name}`,
                        appointmentId: appointment.id
                    },
                    linked_account_notes: ["appointmentId"],
                    on_hold: false
                }
            ];
        }

        const razorpayOrder = await razorpay.orders.create(orderPayload);

        return NextResponse.json({
            success: true,
            appointment,
            razorpayOrder
        });

    } catch (error) {
        console.error("Appointment Booking Error:", error);
        return NextResponse.json({ error: "Failed to book appointment." }, { status: 500 });
    }
}
