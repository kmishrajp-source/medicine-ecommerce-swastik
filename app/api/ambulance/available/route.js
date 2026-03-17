import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Utility function to calculate distance in km using Haversine formula
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null;
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; 
}

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const city = searchParams.get('city');
    const priority = searchParams.get('priority');
    const lat = searchParams.get('lat') ? parseFloat(searchParams.get('lat')) : null;
    const lng = searchParams.get('lng') ? parseFloat(searchParams.get('lng')) : null;

    let whereClause = { isAvailable: true };
    if (city) {
        whereClause.city = { contains: city, mode: 'insensitive' };
    }
    if (priority && priority !== 'All') {
        whereClause.vehicleType = priority;
    }

    try {
        let ambulances = await prisma.ambulance.findMany({ where: whereClause });

        // Calculate distance and sort by Nearest
        if (lat !== null && lng !== null) {
            ambulances = ambulances.map(amb => {
                let distance = null;
                if (amb.currentLat !== null && amb.currentLng !== null) {
                    distance = getDistanceFromLatLonInKm(lat, lng, amb.currentLat, amb.currentLng);
                }
                return { ...amb, distance };
            });

            ambulances.sort((a, b) => {
                if (a.distance === null) return 1;
                if (b.distance === null) return -1;
                return a.distance - b.distance;
            });
        }

        return NextResponse.json({ success: true, ambulances });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
