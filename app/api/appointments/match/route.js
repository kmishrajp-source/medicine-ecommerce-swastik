import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req) {
    try {
        const { specialization, appointmentDate, userId, symptoms } = await req.json();

        if (!specialization || !appointmentDate || !userId) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const dateObj = new Date(appointmentDate);

        // 1. Find all verified doctors matching the specialization who are online
        const doctors = await prisma.doctor.findMany({
            where: {
                specialization: { equals: specialization, mode: 'insensitive' },
                verified: true,
                isOnline: true // Must be online to accept instant/near-term bookings
            },
            include: { user: true }
        });

        if (doctors.length === 0) {
            return NextResponse.json({ 
                error: `No doctors are currently available for ${specialization}. Please try again later.`,
                available: false 
            }, { status: 404 });
        }

        // 2. Intelligent Routing Algorithm 
        // We will score each doctor based on:
        // - Rating (Higher = Better)
        // - Experience (Higher = Better)
        // - Ongoing Bookings (Fewer = Better)
        
        let bestDoctor = null;
        let highestScore = -1;

        for (const doc of doctors) {
            // Check their active appointments today to measure busy-ness
            const startOfDay = new Date(dateObj);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(dateObj);
            endOfDay.setHours(23, 59, 59, 999);

            const activeAppointments = await prisma.appointment.count({
                where: {
                    doctorId: doc.id,
                    date: { gte: startOfDay, lte: endOfDay },
                    status: { in: ['Scheduled', 'In-Progress'] }
                }
            });

            // Calculate Score
            // Base score is rating out of 5 (Default to 4 if new)
            const ratingScore = doc.rating ? doc.rating * 10 : 40; 
            const experienceScore = doc.experienceYears ? Math.min(doc.experienceYears, 20) : 0;
            // Penalty for being too busy today (subtract 5 points per booking)
            const workloadPenalty = activeAppointments * 5;

            const finalScore = ratingScore + experienceScore - workloadPenalty;

            if (finalScore > highestScore) {
                highestScore = finalScore;
                bestDoctor = doc;
            }
        }

        if (!bestDoctor) {
             return NextResponse.json({ error: "Could not find a suitable doctor at this time." }, { status: 503 });
        }

        // 3. Create the Pending Appointment
        // Fixed Consult Fee is Rs 500 for this logic, but normally fetched from Doc profile
        const consultationFee = bestDoctor.consultationFee || 500; 

        const appointment = await prisma.appointment.create({
            data: {
                patientId: userId,
                doctorId: bestDoctor.id,
                date: dateObj,
                status: 'Scheduled',
                amount: consultationFee,
                paymentStatus: 'Pending', // Will be paid via generic checkout
                symptoms: symptoms || "General Consultation"
            }
        });

        return NextResponse.json({ 
            success: true, 
            appointment,
            doctorSelected: {
                name: bestDoctor.user?.name || bestDoctor.name,
                experience: bestDoctor.experienceYears,
                rating: bestDoctor.rating,
                fee: consultationFee
            }
        });

    } catch (error) {
        console.error("Doctor Routing Match Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
