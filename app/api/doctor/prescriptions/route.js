import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(req) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'DOCTOR') {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const doctor = await prisma.doctor.findUnique({
            where: { userId: session.user.id }
        });

        if (!doctor) {
            return NextResponse.json({ error: "Doctor profile not found" }, { status: 404 });
        }

        // Fetch prescriptions assigned to this doctor or globally pending if unassigned
        const prescriptions = await prisma.prescription.findMany({
            where: {
                OR: [
                    { doctorId: doctor.id },
                    { status: "Pending", doctorId: null }
                ]
            },
            include: {
                patient: { select: { name: true, phoneVerified: true, email: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({ success: true, prescriptions });
    } catch (error) {
        console.error("Fetch Prescriptions Error:", error);
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
}

// Doctor Approves/Edits the Prescription
export async function POST(req) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'DOCTOR') {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { prescriptionId, medicinesList, status } = await req.json();

        const doctor = await prisma.doctor.findUnique({
             where: { userId: session.user.id }
        });

        if (!doctor) return NextResponse.json({ error: "Doctor profile missing" }, { status: 404 });

        // Update the prescription
        const updatedPrescription = await prisma.prescription.update({
             where: { id: prescriptionId },
             data: {
                 doctorId: doctor.id, // Assign to this doctor
                 medicines: JSON.stringify(medicinesList), // e.g. [{name: "Paracetamol", dose: "500mg"}]
                 status: status || "Processed"
             }
        });

        return NextResponse.json({ success: true, prescription: updatedPrescription });
    } catch(err) {
        console.error("Prescription Update Error:", err);
        return NextResponse.json({ success: false, error: "Failed to update" }, { status: 500 });
    }
}

