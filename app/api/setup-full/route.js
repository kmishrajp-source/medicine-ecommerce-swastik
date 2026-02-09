import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = 'force-dynamic'; // Ensure this runs on every request

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
        return NextResponse.json({ error: "Email required. Usage: /api/setup-full?email=your@email.com" }, { status: 400 });
    }

    const report = {
        user: null,
        productsCreated: 0,
        ordersCreated: 0,
        errors: []
    };

    try {
        // 1. Promote User to ADMIN
        try {
            const user = await prisma.user.update({
                where: { email: email },
                data: { role: 'ADMIN' }
            });
            report.user = `${user.email} is now ADMIN`;
        } catch (e) {
            report.errors.push(`User Update Role Failed (User might not exist): ${e.message}`);
            // If user doesn't exist, create them
            try {
                const newUser = await prisma.user.create({
                    data: {
                        email,
                        name: "Admin User",
                        password: "temp_password_123", // They should reset this
                        role: "ADMIN"
                    }
                });
                report.user = `Created new ADMIN user: ${newUser.email}`;
            } catch (createErr) {
                report.errors.push(`User Create Failed: ${createErr.message}`);
            }
        }

        // 2. Check Products
        const productCount = await prisma.product.count();
        if (productCount === 0) {
            // Seed 20 Dummy Products
            const categories = ["Pain Relief", "Antibiotics", "Supplements", "General"];
            for (let i = 1; i <= 20; i++) {
                const category = categories[i % categories.length];
                await prisma.product.create({
                    data: {
                        name: `${category} Medicine ${i}`,
                        description: `Effective for ${category.toLowerCase()}.`,
                        price: Math.floor(Math.random() * 500) + 50,
                        buyingPrice: Math.floor(Math.random() * 400) + 30, // Profit margin
                        image: "https://placehold.co/200",
                        category,
                        stock: 100,
                        expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
                        batchNumber: `BATCH-${Math.floor(Math.random() * 10000)}`
                    }
                });
            }
            report.productsCreated = 20;
        }

        // 3. Check Orders
        const orderCount = await prisma.order.count();
        if (orderCount === 0) {
            // Find a product to link
            const product = await prisma.product.findFirst();
            const user = await prisma.user.findUnique({ where: { email } });

            if (product) {
                await prisma.order.create({
                    data: {
                        userId: user?.id,
                        guestName: user ? null : "Guest Seed User",
                        guestEmail: user ? null : "guest@example.com",
                        guestPhone: "9999999999",
                        address: "123 Test St, Seed City",
                        total: 500,
                        status: "Processing",
                        paymentMethod: "COD",
                        deliveryCode: "1234",
                        items: {
                            create: {
                                product: { connect: { id: product.id } },
                                quantity: 2,
                                price: 250
                            }
                        }
                    }
                });
                report.ordersCreated = 1;
            } else {
                report.errors.push("Skipped Order creation: No products found even after seeding attempt.");
            }
        }

        return NextResponse.json({
            success: true,
            message: "Setup Logic Completed.",
            report
        });

    } catch (error) {
        console.error("Setup Full Error:", error);
        return NextResponse.json({ error: "Setup Failed", details: error.message }, { status: 500 });
    }
}
