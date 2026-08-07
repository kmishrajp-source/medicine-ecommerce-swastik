import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { city, category } = body;

        if (!city || !category) {
            return NextResponse.json({ error: "City and category are required" }, { status: 400 });
        }

        // 1. Geocode the City using Nominatim (Free OSM Geocoder)
        const geoUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city)}&format=json&limit=1`;
        const geoRes = await fetch(geoUrl, { headers: { 'User-Agent': 'SwastikMedicare-Scraper' } });
        const geoData = await geoRes.json();

        if (!geoData || geoData.length === 0) {
            return NextResponse.json({ error: "City not found" }, { status: 404 });
        }

        const lat = geoData[0].lat;
        const lon = geoData[0].lon;

        // 2. Build Overpass Query
        let amenity = "pharmacy";
        if (category === "clinic") amenity = "clinic";
        if (category === "hospital") amenity = "hospital";

        // Search within 25km radius
        const overpassQuery = `
            [out:json];
            node["amenity"="${amenity}"](around:25000,${lat},${lon});
            out;
        `;

        const overpassUrl = `https://overpass-api.de/api/interpreter`;
        const params = new URLSearchParams();
        params.append("data", overpassQuery);

        const scrapeRes = await fetch(overpassUrl, {
            method: "POST",
            body: params
        });

        const scrapeData = await scrapeRes.json();
        const nodes = scrapeData.elements || [];

        // 3. Process and Filter Leads (Only keep those with phones)
        let addedCount = 0;
        let skippedCount = 0;

        for (const node of nodes) {
            if (!node.tags) continue;
            
            const name = node.tags.name || node.tags["name:en"] || "Unnamed Facility";
            let phone = node.tags.phone || node.tags["contact:phone"] || node.tags["contact:mobile"];

            if (!phone) {
                skippedCount++;
                continue; // Skip if no phone
            }

            // Clean phone (keep only digits)
            phone = phone.replace(/\D/g, "");

            // Skip if phone is obviously invalid
            if (phone.length < 10) {
                skippedCount++;
                continue;
            }

            // Check if exists in Lead table
            const existingLead = await prisma.lead.findFirst({
                where: { guestPhone: { contains: phone.slice(-10) } }
            });

            if (!existingLead) {
                await prisma.lead.create({
                    data: {
                        serviceType: category === "pharmacy" ? "retailer" : category,
                        guestName: name,
                        guestPhone: phone,
                        area: city,
                        source: "osm_scraper",
                        status: "new"
                    }
                });
                addedCount++;
            } else {
                skippedCount++;
            }
        }

        return NextResponse.json({
            success: true,
            message: `Scraped ${nodes.length} raw places. Added ${addedCount} new viable leads with phone numbers. (Skipped ${skippedCount})`,
            added: addedCount,
            skipped: skippedCount
        });

    } catch (error) {
        console.error("Scraper API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
