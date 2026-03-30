import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(req) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'DOCTOR') {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { patientId, appointmentId, medicines, imageUrl } = await req.json();

    try {
        const doctor = await prisma.doctor.findUnique({
            where: { userId: session.user.id }
        });

        if (!doctor) {
            return NextResponse.json({ error: "Doctor profile not found" }, { status: 404 });
        }

        // Create Prescription
        const prescription = await prisma.prescription.create({
            data: {
                patientId,
                doctorId: doctor.id,
                medicines: Array.isArray(medicines) ? JSON.stringify(medicines) : medicines,
                imageUrl: imageUrl || "https://via.placeholder.com/400?text=Digital+Prescription",
                status: 'Pending' // Becomes 'Processed' when a retailer quotes it
            }
        });

        // Update Appointment status if provided
        if (appointmentId) {
            await prisma.appointment.update({
                where: { id: appointmentId },
                data: { status: 'Completed' }
            });
        }

        return NextResponse.json({ success: true, prescriptionId: prescription.id });
    } catch (error) {
        console.error("Doctor Rx Creation Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

