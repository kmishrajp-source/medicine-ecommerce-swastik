const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("🌱 Injecting mock order data to simulate Market Demand...");

    // 1. Get 5 products to simulate high demand
    const products = await prisma.product.findMany({
        take: 5,
        include: { inventory: true }
    });

    if (products.length < 5) {
        console.log("⚠️ Not enough products to seed demand. Please add products first.");
        return;
    }

    // Set stock artificially low for the first 2 products to trigger CRITICAL/HIGH risk
    await prisma.product.update({
        where: { id: products[0].id },
        data: { stock: 15 } // Very low stock
    });
    
    await prisma.product.update({
        where: { id: products[1].id },
        data: { stock: 35 } // Low stock
    });

    // Make sure they have a salt assigned so the alternative logic works
    await prisma.product.updateMany({
        where: { id: { in: [products[0].id, products[1].id, products[2].id, products[3].id] } },
        data: { salt: "Paracetamol 500mg" } // Mock salt
    });
    await prisma.product.updateMany({
        where: { id: { in: [products[4].id] } },
        data: { salt: "Amoxicillin 250mg" } // Mock salt
    });

    // Ensure products[2] and products[3] have high stock to act as alternatives
    await prisma.product.update({
        where: { id: products[2].id },
        data: { stock: 500 }
    });
    await prisma.product.update({
        where: { id: products[3].id },
        data: { stock: 800 }
    });

    // 2. Create historical orders for the past 30 days to generate Sales Velocity
    let orderCount = 0;
    
    // Create dummy user for orders
    let dummyUser = await prisma.user.findFirst({ where: { email: "mock_demand@example.com" }});
    if (!dummyUser) {
        dummyUser = await prisma.user.create({
            data: {
                name: "Mock Demand Generator",
                email: "mock_demand@example.com",
                password: "hashed_password",
                role: "CUSTOMER"
            }
        });
    }

    for (let i = 0; i < 30; i++) {
        // Create 1 order per day
        const orderDate = new Date();
        orderDate.setDate(orderDate.getDate() - i);

        // For Product 0 (High demand, low stock -> CRITICAL)
        await prisma.order.create({
            data: {
                userId: dummyUser.id,
                total: 500,
                status: "Delivered",
                createdAt: orderDate,
                items: {
                    create: [
                        {
                            productId: products[0].id,
                            quantity: Math.floor(Math.random() * 5) + 3, // 3 to 7 per day
                            price: products[0].price
                        },
                        {
                            productId: products[1].id,
                            quantity: Math.floor(Math.random() * 3) + 1, // 1 to 3 per day
                            price: products[1].price
                        }
                    ]
                }
            }
        });
        orderCount++;
    }

    console.log(`✅ Seeded ${orderCount} historical orders for the last 30 days!`);
    console.log(`✅ Artificially reduced stock for ${products[0].name} and ${products[1].name} to trigger Shortage Alerts.`);
    console.log(`✅ Set up ${products[2].name} and ${products[3].name} as high-stock alternatives.`);
    console.log("\n🚀 Go to /admin/shortage-predictor to see the AI Predictor in action!");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
