import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = 'force-dynamic';

const medicinesToSeed = [
    {
        name: "Zincovit Tablet",
        description: "Zincovit Tablet is a premium multivitamin and multimineral supplement for daily health and immunity.",
        price: 105.0,
        mrp: 120.0,
        discount: 12,
        image: "https://images.unsplash.com/photo-1584308666744-24d59b298f0d?auto=format&fit=crop&w=400&q=80",
        category: "Supplements",
        requiresPrescription: false,
        isOTC: true,
        stock: 350,
        brand: "Zincovit",
        salt: "Multivitamins + Minerals",
        uses: "Vitamins and daily nutritional supplement.",
        sideEffects: "Generally safe. Take with food to avoid mild stomach upset."
    },
    {
        name: "Becosules Capsules",
        description: "Becosules Capsules are highly effective for B-Complex deficiencies, immunity, and overall energy levels.",
        price: 45.0,
        mrp: 50.0,
        discount: 10,
        image: "https://images.unsplash.com/photo-1631549916768-4119b2e5f926?auto=format&fit=crop&w=400&q=80",
        category: "Vitamins",
        requiresPrescription: false,
        isOTC: true,
        stock: 400,
        brand: "Becosules",
        salt: "Vitamin B-Complex + Vitamin C",
        uses: "Treats vitamin deficiency and boosts metabolic health.",
        sideEffects: "Safe formulation. Take after meals."
    },
    {
        name: "Revital H Capsules",
        description: "Revital H is a daily health supplement with a unique blend of Ginseng, multivitamins, and minerals to boost stamina.",
        price: 310.0,
        mrp: 350.0,
        discount: 11,
        image: "https://images.unsplash.com/photo-1584308666744-24d59b298f0d?auto=format&fit=crop&w=400&q=80",
        category: "Supplements",
        requiresPrescription: false,
        isOTC: true,
        stock: 250,
        brand: "Revital",
        salt: "Ginseng + Multivitamins",
        uses: "Improves concentration, fights fatigue, and increases physical stamina.",
        sideEffects: "Well tolerated. Avoid taking on an empty stomach."
    },
    {
        name: "Atorva 10mg",
        description: "Atorva 10mg is a premium cholesterol-lowering medication designed for high-risk heart care and stroke prevention.",
        price: 185.0,
        mrp: 220.0,
        discount: 15,
        image: "https://images.unsplash.com/photo-1585435557343-3b092031a831?auto=format&fit=crop&w=400&q=80",
        category: "Cardiology",
        requiresPrescription: true,
        isOTC: false,
        stock: 180,
        brand: "Atorva",
        salt: "Atorvastatin",
        uses: "Lowering bad cholesterol and triglycerides, protecting against heart failure.",
        sideEffects: "Muscle pain, headache, or mild stomach discomfort."
    },
    {
        name: "Telma 40mg",
        description: "Telma 40mg is a premium anti-hypertensive medication for high blood pressure and heart protection.",
        price: 98.0,
        mrp: 115.0,
        discount: 14,
        image: "https://images.unsplash.com/photo-1550572017-edb9215037d0?auto=format&fit=crop&w=400&q=80",
        category: "Cardiology",
        requiresPrescription: true,
        isOTC: false,
        stock: 220,
        brand: "Telma",
        salt: "Telmisartan",
        uses: "Management of hypertension and prevention of cardiovascular events.",
        sideEffects: "Dizziness, lightheadedness, or back pain."
    },
    {
        name: "Ecosprin 75mg",
        description: "Ecosprin 75mg contains low-dose Aspirin, acting as a blood thinner to prevent heart attacks and blood clots.",
        price: 12.0,
        mrp: 15.0,
        discount: 20,
        image: "https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?auto=format&fit=crop&w=400&q=80",
        category: "Cardiology",
        requiresPrescription: true,
        isOTC: false,
        stock: 500,
        brand: "Ecosprin",
        salt: "Aspirin",
        uses: "Prevention of myocardial infarction (heart attack) and clot-related disorders.",
        sideEffects: "Increased bleeding tendency, heartburn, or stomach irritation."
    }
];

export async function GET() {
    try {
        const results = [];
        for (const med of medicinesToSeed) {
            const product = await prisma.product.upsert({
                where: { name: med.name },
                update: med,
                create: med
            });
            results.push(product);
        }
        return NextResponse.json({ success: true, count: results.length, products: results });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message });
    }
}
