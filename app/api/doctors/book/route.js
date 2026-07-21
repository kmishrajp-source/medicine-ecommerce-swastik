import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import Razorpay from "razorpay";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { cookies } from "next/headers";
import { WhatsAppTriggers } from "@/lib/whatsapp";

export async function POST(req) {
    const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { doctorId, date, reason } = await req.json();

        // 0. Check for Publisher Referral in Cookie
        const cookieStore = await cookies();
        const publisherRef = cookieStore.get('publisher_ref')?.value;
        let finalPublisherId = null;
        if (publisherRef) {
            const publisher = await prisma.publisher.findUnique({
                where: { referralCode: publisherRef }
            });
            if (publisher) finalPublisherId = publisher.id;
        }

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

        if (doctor.isDirectory) {
            // 1. Manual Appointment for Directory Doctors
            const appointment = await prisma.appointment.create({
                data: {
                    patientId: session.user.id,
                    doctorId: doctor.id,
                    publisherId: finalPublisherId,
                    date: new Date(date),
                    reason,
                    status: "Manual_Coordination"
                }
            });

            try {
                // We use a safe fallback since doctor.user might not exist for directory doctors
                const doctorName = doctor.name || (doctor.user?.name) || "Doctor";
                const patientPhone = session.user.phone || session.user.email;
                const patientName = session.user.name || "Customer";
                
                if (WhatsAppTriggers.appointmentConfirmed) {
                   await WhatsAppTriggers.appointmentConfirmed(patientPhone, appointment.id, doctorName, new Date(date).toLocaleDateString());
                }
                if (WhatsAppTriggers.adminOrderAlert) {
                   await WhatsAppTriggers.adminOrderAlert("+917992122974", appointment.id, doctor.consultationFee, `Manual Doctor Booking: ${doctorName}`);
                }
            } catch (err) {
                console.error("WhatsApp Notification failed:", err);
            }

            return NextResponse.json({
                success: true,
                appointment,
                isManual: true,
                message: "We have received your request. Our agent will call you shortly to confirm."
            });
        }

        // 2. Standard Razorpay Appointment for Registered Doctors (Status: Pending Payment)
        const appointment = await prisma.appointment.create({
            data: {
                patientId: session.user.id,
                doctorId: doctor.id,
                publisherId: finalPublisherId,
                date: new Date(date),
                reason,
                status: "Pending_Payment"
            }
        });

        // 2.1 Trigger WhatsApp Notifications
        try {
            const doctorName = doctor.name || (doctor.user?.name) || "Doctor";
            const patientPhone = session.user.phone || session.user.email;
            const patientName = session.user.name || "Customer";
            // We use the correct trigger if available or log it
            if (WhatsAppTriggers.adminOrderAlert) {
                await WhatsAppTriggers.adminOrderAlert("+917992122974", appointment.id, doctor.consultationFee, `Doctor Booking: ${doctorName}`);
            }
        } catch (err) {
            console.error("WhatsApp Notification failed:", err);
        }

        // 3. Razorpay Order Creation with Route (100% Transfer)
        const amountInPaise = Math.round((doctor.consultationFee || 500) * 100);

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
                        name: `Consultation Fee for ${doctor.user?.name || doctor.name}`,
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

