import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== 'MANUFACTURER') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const manufacturer = await prisma.manufacturer.findUnique({
            where: { userId: session.user.id }
        });

        if (!manufacturer) {
            return NextResponse.json({ error: "Manufacturer profile not found" }, { status: 404 });
        }

        const { products } = await req.json(); // Array of { name, description, price, category, stock, image }

        if (!Array.isArray(products)) {
            return NextResponse.json({ error: "Invalid data format. Expected an array of products." }, { status: 400 });
        }

        // Bulk Create Products associated with this manufacturer
        const createdCount = await prisma.product.createMany({
            data: products.map(p => ({
                name: p.name,
                description: p.description || "",
                price: parseFloat(p.price),
                category: p.category || "General",
                stock: parseInt(p.stock) || 0,
                image: p.image || "/placeholder-medicine.png",
                manufacturerId: manufacturer.id,
                manufacturer: p.manufacturer || manufacturer.companyName,
                mrp: parseFloat(p.mrp || p.price),
                requiresPrescription: p.requiresPrescription === true
            }))
        });

        // Log System Health
        await prisma.systemHealthLog.create({
            data: {
                component: "MANUFACTURER_PORTAL",
                issueType: "BULK_UPLOAD",
                severity: "INFO",
                message: `Bulk upload completed for ${manufacturer.companyName}: ${createdCount.count} products added.`,
                details: { manufacturerId: manufacturer.id, count: createdCount.count }
            }
        });

        return NextResponse.json({
            success: true,
            message: `Successfully uploaded ${createdCount.count} products!`,
            count: createdCount.count
        });

    } catch (error) {
        console.error("Bulk Upload Error:", error);
        
        // Log Failure for AI Monitoring
        try {
            await prisma.systemFailureLog.create({
                data: {
                    actionType: "stock_upload",
                    userRole: "manufacturer",
                    errorType: "server",
                    errorMessage: error.message,
                    details: { error: error.stack }
                }
            });
        } catch (logError) {
            console.error("Failed to log system failure:", logError);
        }

        return NextResponse.json({ error: "Upload failed: " + error.message }, { status: 500 });
    }
}

