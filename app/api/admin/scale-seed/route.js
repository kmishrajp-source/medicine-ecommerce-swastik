import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req) {
    const { searchParams } = new URL(req.url);
    if (searchParams.get('key') !== 'seed-2026-secure') {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const salts = [
            "Paracetamol", "Metformin", "Atorvastatin", "Amlodipine", "Cetirizine", 
            "Ibuprofen", "Pantoprazole", "Amoxicillin", "Azithromycin", "Telmisartan",
            "Rosuvastatin", "Glimepiride", "Voglibose", "Sitagliptin", "Losartan",
            "Ramipril", "Valsartan", "Bisoprolol", "Carvedilol", "Metoprolol"
        ];
        
        const manufacturers = [
            "Cipla Ltd", "Sun Pharmaceutical Industries", "Dr. Reddy's Laboratories", 
            "Lupin Ltd", "Abbott India", "Zydus Lifesciences", "Alkem Laboratories",
            "Torrent Pharmaceuticals", "Mankind Pharma", "Glenmark Pharmaceuticals"
        ];

        const formulation = ["Tablet", "Capsule", "Syrup", "Injection"];
        const categories = ["General", "Diabetes", "Cardiology", "Antibiotics", "Pain Relief", "Gastrointestinal"];

        const products = [];
        let count = 0;

        // Generate combinations to reach ~3000
        for (let s = 0; s < salts.length; s++) {
            for (let m = 0; m < manufacturers.length; m++) {
                for (let f = 0; f < formulation.length; f++) {
                    for (let strength of ["10mg", "20mg", "100mg", "500mg"]) {
                        count++;
                        if (count > 3200) break;

                        const salt = salts[s];
                        const manufacturer = manufacturers[m];
                        const name = `${salt} ${strength} ${formulation[f]}`;
                        const mrp = Math.floor(Math.random() * 400) + 20;
                        const price = Math.round(mrp * 0.85 * 100) / 100; // 15% discount
                        
                        products.push({
                            name,
                            description: `${name} used for various health conditions. Consult a doctor.`,
                            category: categories[s % categories.length],
                            image: "https://placehold.co/200",
                            price,
                            mrp,
                            salt,
                            composition: salt,
                            manufacturer,
                            brand: manufacturer.split(' ')[0],
                            stock: Math.floor(Math.random() * 500) + 50,
                            requiresPrescription: ["Cardiology", "Antibiotics", "Diabetes"].includes(categories[s % categories.length])
                        });
                    }
                }
            }
        }

        // Batch insert to avoid timeout (Prisma createMany is good but let's break into chunks of 500)
        const chunkSize = 500;
        let totalInserted = 0;
        for (let i = 0; i < products.length; i += chunkSize) {
            const chunk = products.slice(i, i + chunkSize);
            await prisma.product.createMany({
                data: chunk,
                skipDuplicates: true
            });
            totalInserted += chunk.length;
        }

        return NextResponse.json({ 
            success: true, 
            message: `Successfully seeded ${totalInserted} medicines with full Indian market details.`,
            totalInserted 
        });

    } catch (error) {
        console.error("Scale Seeding Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
