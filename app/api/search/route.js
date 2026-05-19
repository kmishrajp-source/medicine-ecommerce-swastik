import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const query = searchParams.get("q");

        if (!query || query.length < 2) {
            return NextResponse.json({ success: true, results: [] });
        }

        // AI Symptom Mapping
        const symptomMap = {
            "fever": ["paracetamol", "doloplus", "calpol", "antipyretic"],
            "pain": ["analgesic", "ibuprofen", "combiflam", "painkiller"],
            "cough": ["syrup", "antitussive", "expectorant", "benadryl", "alex"],
            "cold": ["antihistamine", "decongestant", "cetirizine", "wikoryl"],
            "headache": ["aspirin", "saridon", "disprin"],
            "acidity": ["pantoprazole", "digene", "eno", "antacid"],
            "diabetes": ["metformin", "insulin", "glimepiride"],
            "thyroid": ["levothyroxine", "thyronorm"],
            "heart": ["aspirin", "statin", "atorvastatin", "amlodipine", "rosuvastatin", "clopidogrel", "bisoprolol", "cardiology"],
            "multivitamin": ["vitamin", "vitamins", "supplement", "becosules", "calcerol", "cipcal", "a-z gold", "zincovit"]
        };

        const symptomQuery = query.toLowerCase().trim();
        let matchedKey = null;
        if (symptomQuery.includes("heart") || symptomQuery.includes("cardio")) {
            matchedKey = "heart";
        } else if (symptomQuery.includes("multivitamin") || symptomQuery.includes("vitamin") || symptomQuery.includes("supplement")) {
            matchedKey = "multivitamin";
        } else if (symptomQuery.includes("fever") || symptomQuery.includes("temp")) {
            matchedKey = "fever";
        } else if (symptomQuery.includes("pain") || symptomQuery.includes("ache")) {
            matchedKey = "pain";
        } else if (symptomQuery.includes("cough")) {
            matchedKey = "cough";
        } else if (symptomQuery.includes("cold") || symptomQuery.includes("flu")) {
            matchedKey = "cold";
        } else if (symptomQuery.includes("headache")) {
            matchedKey = "headache";
        } else if (symptomQuery.includes("acidity") || symptomQuery.includes("gas")) {
            matchedKey = "acidity";
        } else if (symptomQuery.includes("diabetes") || symptomQuery.includes("sugar")) {
            matchedKey = "diabetes";
        } else if (symptomQuery.includes("thyroid")) {
            matchedKey = "thyroid";
        }

        let aiResults = [];
        let aiReason = "";

        if (matchedKey) {
            aiReason = `Recommended for ${matchedKey === 'heart' ? 'heart care' : matchedKey === 'multivitamin' ? 'vitamins & daily health' : matchedKey}`;
            // Find medicines that match the symptom-mapped keywords
            aiResults = await prisma.product.findMany({
                where: {
                    OR: symptomMap[matchedKey].map(term => ({
                        OR: [
                            { name: { contains: term, mode: "insensitive" } },
                            { salt: { contains: term, mode: "insensitive" } },
                            { category: { contains: term, mode: "insensitive" } },
                            { uses: { contains: term, mode: "insensitive" } }
                        ]
                    }))
                },
                take: 6,
                select: {
                    id: true, name: true, price: true, mrp: true, discount: true,
                    brand: true, salt: true, image: true, requiresPrescription: true
                }
            });
        }

        // Search conditions
        const searchConditions = [
            { name: { contains: query, mode: "insensitive" } },
            { brand: { contains: query, mode: "insensitive" } },
            { salt: { contains: query, mode: "insensitive" } },
            { category: { contains: query, mode: "insensitive" } },
        ];

        if (matchedKey === "heart") {
            searchConditions.push({ category: { contains: "Cardiology", mode: "insensitive" } });
        } else if (matchedKey === "multivitamin") {
            searchConditions.push({ category: { contains: "Vitamins", mode: "insensitive" } });
            searchConditions.push({ category: { contains: "Supplements", mode: "insensitive" } });
        }

        // Search for medicines that match the name OR salt composition
        // This makes it easy to find cheaper generic substitutes
        const searchResults = await prisma.product.findMany({
            where: {
                OR: searchConditions
            },
            take: 8, // Limit autocomplete to top 8
            select: {
                id: true,
                name: true,
                price: true,
                mrp: true,
                discount: true,
                brand: true,
                manufacturer: true,
                salt: true,
                composition: true,
                uses: true,
                sideEffects: true,
                packSize: true,
                image: true,
                requiresPrescription: true,
                isRecommended: true
            },
            orderBy: {
                // If it's a Swastik recommended substitute, prioritize it
                isRecommended: 'desc'
            }
        });

        // Map Prisma fields to the format expected by the frontend
        let formattedResults = searchResults.map(item => ({
            ...item,
            imageUrl: item.image,
            isPrescriptionRequired: item.requiresPrescription
        }));

        // Merge AI results if any
        if (aiResults.length > 0) {
            const aiFormatted = aiResults.map(item => ({
                ...item,
                imageUrl: item.image,
                isPrescriptionRequired: item.requiresPrescription,
                isAiSuggested: true,
                aiReason: aiReason
            }));
            
            // Add AI results at the top, avoiding duplicates
            const existingIds = new Set(formattedResults.map(r => r.id));
            const uniqueAiResults = aiFormatted.filter(r => !existingIds.has(r.id));
            formattedResults = [...uniqueAiResults, ...formattedResults];
        }

        return NextResponse.json({ success: true, results: formattedResults });

    } catch (error) {
        console.error("Search API Error:", error);
        return NextResponse.json({ success: false, error: "Failed to fetch search results" }, { status: 500 });
    }
}
