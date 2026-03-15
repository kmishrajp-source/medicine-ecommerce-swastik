import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const query = searchParams.get("q");

        if (!query || query.length < 2) {
            return NextResponse.json({ success: true, results: [] });
        }

        // Search for medicines that match the name OR salt composition
        // This makes it easy to find cheaper generic substitutes
        const searchResults = await prisma.product.findMany({
            where: {
                OR: [
                    { name: { contains: query, mode: "insensitive" } },
                    { brand: { contains: query, mode: "insensitive" } },
                    { salt: { contains: query, mode: "insensitive" } },
                    { category: { contains: query, mode: "insensitive" } },
                ]
            },
            take: 8, // Limit autocomplete to top 8
            select: {
                id: true,
                name: true,
                price: true,
                discount: true,
                brand: true,
                salt: true,
                imageUrl: true,
                isPrescriptionRequired: true,
                isRecommended: true
            },
            orderBy: {
                // If it's a Swastik recommended substitute, prioritize it
                isRecommended: 'desc'
            }
        });

        return NextResponse.json({ success: true, results: searchResults });

    } catch (error) {
        console.error("Search API Error:", error);
        return NextResponse.json({ success: false, error: "Failed to fetch search results" }, { status: 500 });
    }
}
