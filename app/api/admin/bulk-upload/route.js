import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import Papa from "papaparse";

export const dynamic = 'force-dynamic';

export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const contentType = req.headers.get("content-type") || "";

        // Case 1: Medicine CSV Upload (Multipart Form Data)
        if (contentType.includes("multipart/form-data")) {
            const formData = await req.formData();
            const file = formData.get("file");

            if (!file) {
                return NextResponse.json({ error: "No file provided." }, { status: 400 });
            }

            const csvText = await file.text();
            const { data, errors } = Papa.parse(csvText, {
                header: true,
                skipEmptyLines: true,
                dynamicTyping: true,
            });

            if (errors.length && data.length === 0) {
                return NextResponse.json({ error: "Invalid CSV format.", details: errors }, { status: 400 });
            }

            let createdCount = 0;
            let updatedCount = 0;

            for (const row of data) {
                const name = row.medicine_name || row.name;
                if (!name) continue;

                const mrp = parseFloat(row.mrp) || 0;
                const purchasePrice = parseFloat(row.purchase_price) || parseFloat(row.buyingPrice) || 0;
                const marginPercent = parseFloat(row.margin) || 15;
                const stock = parseInt(row.stock) || 0;
                
                const calculatedPrice = purchasePrice + (purchasePrice * (marginPercent / 100));
                const sellingPrice = (mrp > 0 && mrp < calculatedPrice) ? mrp : Math.round(calculatedPrice * 100) / 100;

                let product = await prisma.product.findFirst({
                    where: { name: { equals: name, mode: 'insensitive' } },
                });

                if (product) {
                    product = await prisma.product.update({
                        where: { id: product.id },
                        data: {
                            mrp,
                            composition: row.composition || product.composition,
                            manufacturer: row.manufacturer || product.manufacturer,
                            packSize: row.pack_size || product.packSize,
                            price: sellingPrice,
                            stock: stock
                        }
                    });
                    updatedCount++;
                } else {
                    product = await prisma.product.create({
                        data: {
                            name,
                            category: row.category || "General",
                            description: row.description || `${name} medicine`,
                            image: row.image_url || "https://placehold.co/200",
                            mrp,
                            composition: row.composition || null,
                            manufacturer: row.manufacturer || null,
                            packSize: row.pack_size || null,
                            price: sellingPrice,
                            stock: stock
                        }
                    });
                    createdCount++;
                }

                await prisma.pharmacyInventory.upsert({
                    where: { productId: product.id },
                    update: { purchasePrice, sellingPrice, marginPercent, stock },
                    create: { productId: product.id, purchasePrice, sellingPrice, marginPercent, stock }
                });
            }

            return NextResponse.json({
                success: true,
                message: `Processed Medicines. Created: ${createdCount}, Updated: ${updatedCount}`,
                count: createdCount + updatedCount
            });
        } 
        
        // Case 2: Directory Upload (JSON)
        else {
            const { type, data } = await req.json(); // type: 'doctor' | 'retailer'
            
            if (!data || !Array.isArray(data)) {
                return NextResponse.json({ error: "Invalid data format" }, { status: 400 });
            }

            const results = await prisma.$transaction(async (tx) => {
                if (type === 'doctor') {
                    return await Promise.all(data.map(item => tx.doctor.create({
                        data: {
                            name: item.name,
                            specialization: item.specialization || "General Physician",
                            hospital: item.hospital,
                            experience: item.experience ? parseInt(item.experience) : 0,
                            phone: item.phone,
                            status: 'unverified',
                            source: item.source || 'google_maps',
                            lat: item.lat ? parseFloat(item.lat) : null,
                            lng: item.lng ? parseFloat(item.lng) : null,
                            verified: false
                        }
                    })));
                } else if (type === 'retailer') {
                    return await Promise.all(data.map(item => tx.retailer.create({
                        data: {
                            shopName: item.shopName,
                            address: item.address,
                            phone: item.phone,
                            licenseNumber: item.licenseNumber || "PENDING",
                            status: 'unverified',
                            source: item.source || 'google_maps',
                            lat: item.lat ? parseFloat(item.lat) : null,
                            lng: item.lng ? parseFloat(item.lng) : null,
                            verified: false
                        }
                    })));
                }
            });

            return NextResponse.json({ success: true, count: results.length });
        }

    } catch (error) {
        console.error("Bulk Upload Error:", error);
        return NextResponse.json({ error: error.message || "Failed to process bulk upload." }, { status: 500 });
    }
}
