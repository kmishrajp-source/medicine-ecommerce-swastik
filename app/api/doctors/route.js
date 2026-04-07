import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { sanitizeProfile } from "@/lib/security";
import fs from "fs";
import path from "path";
import { getSpecialtiesFromQuery } from "@/lib/medical-intent";

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const specialization = searchParams.get('specialization');
        const city = searchParams.get('city');
        const query = searchParams.get('q'); // For general search

        const where = {};
        
        // Dynamic Filtering
        if (specialization && specialization !== 'all') {
            where.specialization = { contains: specialization, mode: 'insensitive' };
        }
        
        if (city && city !== 'all') {
            where.city = { contains: city, mode: 'insensitive' };
        }

        if (query) {
            const mappedSpecialties = getSpecialtiesFromQuery(query);
            
            where.OR = [
                { name: { contains: query, mode: 'insensitive' } },
                { specialization: { contains: query, mode: 'insensitive' } },
                { hospital: { contains: query, mode: 'insensitive' } },
                ...mappedSpecialties.map(s => ({
                    specialization: { contains: s, mode: 'insensitive' }
                }))
            ];
        }

        const doctors = await prisma.doctor.findMany({
            where,
            include: {
                hospitalLink: {
                    select: { name: true, address: true }
                }
            },
            orderBy: { rating: 'desc' }
        });
        
        return NextResponse.json({ 
            success: true, 
            doctors: doctors.map(doc => ({
                ...doc,
                // Ensure legacy compatibility if needed
                hospital: doc.hospitalLink?.name || doc.hospital
            }))
        });
    } catch (error) {
        console.error("Fetch Doctors API Error:", error);
        return NextResponse.json({ success: false, error: 'Failed to fetch doctors: ' + error.message }, { status: 500 });
    }
}

