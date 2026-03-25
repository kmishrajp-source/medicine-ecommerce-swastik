import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { sanitizeProfile } from "@/lib/security";

export async function GET() {
    try {
        const filePath = path.join(process.cwd(), 'data', 'gorakhpur-healthcare.json');
        const fileData = fs.readFileSync(filePath, 'utf-8');
        const data = JSON.parse(fileData);
        
        const doctors = data.filter(item => item.type === 'doctor');
        
        // Also include clinics as doctor-type for the main listing if they have a doctorName
        const clinicsWithDoctors = data.filter(item => item.type === 'clinic' && item.doctorName);
        
        return NextResponse.json({ success: true, doctors: [...doctors, ...clinicsWithDoctors] });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed to fetch doctors' }, { status: 500 });
    }
}
