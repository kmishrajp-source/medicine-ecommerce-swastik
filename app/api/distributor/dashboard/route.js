import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Find distributor account for logged-in user (or fetch default/directory entry if missing)
        let distributor = await prisma.distributor.findUnique({
            where: { userId: session.user.id }
        });

        if (!distributor) {
            // Find by email or fallback to first distributor in DB for demo
            distributor = await prisma.distributor.findFirst({
                where: { email: session.user.email }
            });
        }

        // Fetch products matching distributor's brands/coverage
        const brandsList = (distributor?.brands || "").split(',').map(b => b.trim().toLowerCase()).filter(Boolean);

        const products = await prisma.product.findMany({
            take: 50,
            include: { inventory: true }
        });

        // Filter products matching distributor brands if any
        const distributorProducts = brandsList.length > 0
            ? products.filter(p => brandsList.some(b => (p.brand || '').toLowerCase().includes(b) || (p.name || '').toLowerCase().includes(b)))
            : products.slice(0, 20);

        // Fetch shortage alerts (items with stock < 20)
        const shortageAlerts = products.filter(p => (p.inventory?.stock ?? p.stock) < 20).map(p => ({
            id: p.id,
            name: p.name,
            brand: p.brand,
            salt: p.salt,
            currentStock: p.inventory?.stock ?? p.stock,
            mrp: p.mrp || p.price
        }));

        // Fetch active retailers in distributor's city
        const retailers = await prisma.retailer.findMany({
            where: { city: distributor?.city || 'Gorakhpur' },
            take: 20,
            select: { id: true, shopName: true, phone: true, address: true, verified: true }
        });

        return NextResponse.json({
            success: true,
            distributor: distributor || {
                companyName: session.user.name || "Swastik Partner Distributor",
                city: "Gorakhpur",
                verified: true,
                brands: "Sun Pharma, Cipla, Mankind, Torrent",
                coverageArea: "Gorakhpur, Basti, Deoria"
            },
            catalog: distributorProducts.map(p => ({
                id: p.id,
                name: p.name,
                brand: p.brand,
                salt: p.salt,
                mrp: p.mrp || p.price,
                stock: p.inventory?.stock ?? p.stock
            })),
            shortageAlerts,
            retailerNetwork: retailers
        });

    } catch (error) {
        console.error("Distributor Dashboard GET Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function PATCH(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { brands, coverageArea, phone, address } = body;

        let distributor = await prisma.distributor.findUnique({
            where: { userId: session.user.id }
        });

        if (!distributor) {
            distributor = await prisma.distributor.create({
                data: {
                    userId: session.user.id,
                    companyName: session.user.name || "Distributor Agency",
                    phone: phone || "9999999999",
                    address: address || "Gorakhpur",
                    city: "Gorakhpur",
                    brands: brands || "",
                    coverageArea: coverageArea || ""
                }
            });
        } else {
            distributor = await prisma.distributor.update({
                where: { id: distributor.id },
                data: {
                    ...(brands !== undefined && { brands }),
                    ...(coverageArea !== undefined && { coverageArea }),
                    ...(phone && { phone }),
                    ...(address && { address })
                }
            });
        }

        return NextResponse.json({ success: true, distributor });

    } catch (error) {
        console.error("Distributor Dashboard PATCH Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
