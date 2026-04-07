import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
    try {
        const mappings = await prisma.symptomMap.findMany();
        return NextResponse.json({ success: true, mappings });
    } catch (error) {
        console.error("Failed to fetch symptom mappings:", error);
        // Fallback for empty/unmigrated DBs to maintain high reliability
        const fallback = [
            { symptom: "fever", suggestedSpecialization: "General Physician" },
            { symptom: "chest pain", suggestedSpecialization: "Cardiologist" },
            { symptom: "skin rash", suggestedSpecialization: "Dermatologist" },
            { symptom: "child", suggestedSpecialization: "Pediatrician" }
        ];
        return NextResponse.json({ success: true, mappings: fallback });
    }
}
