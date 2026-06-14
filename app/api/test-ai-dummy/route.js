import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    // 1. Find a General Physician in the directory
    const doc = await prisma.doctor.findFirst({
      where: { specialization: { contains: 'General Physician', mode: 'insensitive' } }
    });

    if (!doc) {
      return NextResponse.json({ error: 'No General Physician found in the database.' });
    }

    // 2. Temporarily make them bookable
    const originalIsDirectory = doc.isDirectory;
    await prisma.doctor.update({
      where: { id: doc.id },
      data: { isDirectory: false, verified: true }
    });

    // 3. Test the AI API internally (simulating the POST request body)
    const specialty = "General Physician";
    const doctor = await prisma.doctor.findFirst({
        where: { 
            specialization: { contains: specialty, mode: 'insensitive' },
            isDirectory: false
        },
        include: { user: true }
    });

    let aiResponse = "";
    if (doctor) {
        const docName = doctor.user?.name || doctor.name || "Doctor";
        aiResponse = `👨‍⚕️ **Doctor Recommendation**\n\nBased on your symptoms, I recommend consulting a **${specialty}**.\n\nI have found **Dr. ${docName}** available for consultation on our platform.\n*   **Specialization:** ${doctor.specialization}\n*   **Consultation Fee:** ₹${doctor.consultationFee}\n\n🔗 **Book Appointment Now:** https://swastikmed.online/en/doctors/${doctor.id}`;
    } else {
        aiResponse = "Doctor not found after update!";
    }

    // 4. Revert the doctor
    await prisma.doctor.update({
      where: { id: doc.id },
      data: { isDirectory: originalIsDirectory }
    });

    return NextResponse.json({
        success: true,
        testedDoctor: doc.name || 'Unnamed',
        aiOutput: aiResponse
    });

  } catch (err) {
    console.error('Test Failed:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
