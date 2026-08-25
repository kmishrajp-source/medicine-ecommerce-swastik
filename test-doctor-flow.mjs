import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function runDoctorDemo() {
    console.log("=== STARTING DOCTOR BOOKING & DIGITAL PRESCRIPTION DEMO ===");
    try {
        // 1. Create Patient User & Doctor Profile
        const patient = await prisma.user.upsert({
            where: { email: 'demo-patient@swastik.com' },
            update: {},
            create: { email: 'demo-patient@swastik.com', name: 'Ramesh Kumar', password: 'hash', role: 'CUSTOMER' }
        });

        const doctorUser = await prisma.user.upsert({
            where: { email: 'demo-doctor@swastik.com' },
            update: {},
            create: { email: 'demo-doctor@swastik.com', name: 'Dr. Anita Sharma (MD)', password: 'hash', role: 'DOCTOR' }
        });

        const doctor = await prisma.doctor.findFirst({ where: { specialization: 'General Physician' } }) || await prisma.doctor.create({
            data: {
                user: { connect: { id: doctorUser.id } },
                specialization: 'General Physician',
                consultationFee: 400,
                registrationNumber: 'MCI-889421',
                availableDays: 'Mon,Tue,Wed,Thu,Fri,Sat',
                availableTimes: '10:00 AM - 05:00 PM'
            }
        });

        console.log(`✅ Patient Profile: ${patient.name} (${patient.email})`);
        console.log(`✅ Doctor Profile: ${doctorUser.name} [Reg: ${doctor.registrationNumber}] - Fee: ₹${doctor.consultationFee}`);

        // 2. Patient Books Appointment
        console.log("\n1️⃣ Patient is booking a Video Consultation with Dr. Anita Sharma...");
        const appointmentDate = new Date();
        appointmentDate.setHours(11, 0, 0, 0); // 11:00 AM

        const appointment = await prisma.appointment.create({
            data: {
                patientId: patient.id,
                doctorId: doctor.id,
                date: appointmentDate,
                status: 'Confirmed',
                reason: 'Patient suffering from mild fever, sore throat, and cough.'
            }
        });

        console.log(`📅 Appointment Booked! ID: ${appointment.id}`);
        console.log(`Status: ${appointment.status} | Mode: ${appointment.type}`);
        console.log(`📲 (WhatsApp alert sent to Doctor & Patient with consultation link)`);

        // 3. Doctor Conducts Consultation & Generates Digital Rx
        console.log("\n2️⃣ Doctor completes consultation & issues Digital Prescription...");
        const prescribedMedicines = [
            { medicineName: "Azithromycin 500mg", dosage: "1 tablet daily after food", duration: "3 Days" },
            { medicineName: "Dolo 650mg", dosage: "1 tablet 3 times a day as needed for fever", duration: "5 Days" },
            { medicineName: "Cough Syrup (Alex)", dosage: "2 tsp twice daily", duration: "5 Days" }
        ];

        const digitalRx = await prisma.prescription.create({
            data: {
                patientId: patient.id,
                doctorId: doctor.id,
                medicines: JSON.stringify(prescribedMedicines),
                imageUrl: "https://www.swastikmed.online/assets/digital-rx-sample.png",
                status: "Pending" // Ready for fulfillment
            }
        });

        // Mark appointment completed
        await prisma.appointment.update({
            where: { id: appointment.id },
            data: { status: 'Completed' }
        });

        console.log(`📑 Digital Prescription Generated! Rx ID: ${digitalRx.id}`);
        console.log(`Prescribed Items:`);
        prescribedMedicines.forEach((med, idx) => {
            console.log(`   ${idx + 1}. ${med.medicineName} -> ${med.dosage} (${med.duration})`);
        });
        console.log(`Appointment Status updated to: 'Completed'`);

        // 4. Connect to Swastik Doorstep Delivery Network
        console.log("\n3️⃣ Linking Digital Rx to Pharmacy Doorstep Delivery Network...");
        console.log(`📲 Patient receives SMS/WhatsApp: "Dr. Anita Sharma has issued your digital Rx. Tap here to order medicines with 10-min delivery."`);

        // 5. Cleanup Demo Data
        console.log("\n🧹 Cleaning up demo simulation records...");
        await prisma.prescription.delete({ where: { id: digitalRx.id } });
        await prisma.appointment.delete({ where: { id: appointment.id } });
        console.log("✅ Cleanup complete.");

    } catch (e) {
        console.error("Doctor Demo Error:", e);
    } finally {
        await prisma.$disconnect();
    }
}

runDoctorDemo();
