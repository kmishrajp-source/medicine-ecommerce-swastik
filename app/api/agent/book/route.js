import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { WhatsAppTriggers } from "@/lib/whatsapp";

export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user || !['ADMIN', 'AGENT', 'SUPER_ADMIN'].includes(session.user.role)) {
            return NextResponse.json({ error: "Unauthorized. Agent or Admin access required." }, { status: 401 });
        }

        const { doctorId, date, reason, patientPhone, patientName } = await req.json();

        if (!doctorId || !date || !patientPhone || !patientName) {
            return NextResponse.json({ error: "Doctor, Date, Patient Phone, and Patient Name are required." }, { status: 400 });
        }

        // Validate doctor
        const doctor = await prisma.doctor.findUnique({
            where: { id: doctorId },
            include: { user: { select: { name: true } } }
        });

        if (!doctor) {
            return NextResponse.json({ error: "Doctor not found." }, { status: 404 });
        }

        // 1. Find or Create Patient User
        // We'll use a placeholder email if they don't have one, since phone isn't guaranteed unique if it's missing in some DB constraints
        const placeholderEmail = `${patientPhone.replace(/\D/g, '')}@swastik.local`;
        
        let patient = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: placeholderEmail },
                    // If you added phone to the User schema you could search by phone, but email is required and unique.
                ]
            }
        });

        if (!patient) {
            // Create a stub patient account
            const bcrypt = await import("bcryptjs");
            const hashedPassword = await bcrypt.hash(patientPhone, 10);
            
            patient = await prisma.user.create({
                data: {
                    name: patientName,
                    email: placeholderEmail,
                    password: hashedPassword,
                    role: "CUSTOMER",
                    isApproved: true
                }
            });
        }

        // 2. Create Appointment
        const appointment = await prisma.appointment.create({
            data: {
                patientId: patient.id,
                doctorId: doctor.id,
                date: new Date(date),
                reason: reason || "Booked by Agent",
                status: "Agent_Booked"
            }
        });

        // 3. Notify Admin & Patient (Optional)
        try {
            const doctorName = doctor.name || doctor.user?.name || "Doctor";
            if (WhatsAppTriggers.appointmentConfirmed) {
               await WhatsAppTriggers.appointmentConfirmed(patientPhone, appointment.id, doctorName, new Date(date).toLocaleDateString());
            }
            if (WhatsAppTriggers.adminOrderAlert) {
               await WhatsAppTriggers.adminOrderAlert("+917992122974", appointment.id, doctor.consultationFee || 500, `Agent Booking: ${doctorName}`);
            }
        } catch (err) {
            console.error("WhatsApp Notification failed:", err);
        }

        return NextResponse.json({ success: true, appointment, patient });
    } catch (error) {
        console.error("Agent Booking Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
