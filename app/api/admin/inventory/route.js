import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

// GET: Fetch all products
export async function GET(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const products = await prisma.product.findMany({
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({ success: true, products });
    } catch (error) {
        console.error("Inventory Fetch Error:", error);
        return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
    }
}

// POST: Create a new product
export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { name, description, price, category, image, requiresPrescription, stock } = body;

        if (!name || !price || !category) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const product = await prisma.product.create({
            data: {
                name,
                description: description || "",
                price: parseFloat(price),
                category,
                image: image || "https://placehold.co/200", // Default placeholder
                requiresPrescription: requiresPrescription || false,
                stock: parseInt(stock) || 0
            }
        });

        return NextResponse.json({ success: true, product });

    } catch (error) {
        console.error("Inventory Create Error:", error);
        return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
    }
}

// PUT: Update a product
export async function PUT(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { id, name, description, price, category, image, requiresPrescription, stock } = body;

        if (!id) {
            return NextResponse.json({ error: "Product ID required" }, { status: 400 });
        }

        const product = await prisma.product.update({
            where: { id },
            data: {
                name,
                description,
                price: parseFloat(price),
                category,
                image,
                requiresPrescription,
                stock: parseInt(stock)
            }
        });

        return NextResponse.json({ success: true, product });

    } catch (error) {
        console.error("Inventory Update Error:", error);
        return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
    }
}

// DELETE: Delete a product
export async function DELETE(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "Product ID required" }, { status: 400 });
        }

        await prisma.product.delete({
            where: { id }
        });

        return NextResponse.json({ success: true, message: "Product deleted successfully" });

    } catch (error) {
        console.error("Inventory Delete Error:", error);
        return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
    }
}
