require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });
process.env.DATABASE_URL = process.env.PRISMA_DATABASE_URL || process.env.DATABASE_URL;
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("--- STARTING DUMMY ORDER FLOW TEST ---");

    // 1. Cleanup old test data
    await prisma.deliveryAgent.deleteMany({ where: { licenseNumber: 'DUMMY-RIDER' }});
    await prisma.retailer.deleteMany({ where: { licenseNumber: 'DUMMY-RETAILER' }});
    await prisma.user.deleteMany({ where: { email: { in: ['dummy-retailer@test.com', 'dummy-rider@test.com', 'dummy-customer@test.com'] }}});

    // 2. Create Dummy Retailer
    const retailerUser = await prisma.user.create({
        data: {
            name: "Dummy Retailer",
            email: "dummy-retailer@test.com",
            password: "hashed_pwd",
            role: "RETAILER",
            phone: "+919999999991"
        }
    });

    const retailer = await prisma.retailer.create({
        data: {
            userId: retailerUser.id,
            shopName: "Dummy Pharmacy",
            licenseNumber: "DUMMY-RETAILER",
            phone: "+919999999991",
            lat: 12.9716,
            lng: 77.5946,
            isVerified: true,
            isOnline: true
        }
    });
    console.log("✅ Created Online Retailer:", retailer.shopName);

    // 3. Create Dummy Rider
    const riderUser = await prisma.user.create({
        data: {
            name: "Dummy Rider",
            email: "dummy-rider@test.com",
            password: "hashed_pwd",
            role: "DELIVERY_PARTNER",
            phone: "+919999999992"
        }
    });

    const rider = await prisma.deliveryAgent.create({
        data: {
            userId: riderUser.id,
            vehicleNumber: "KA-01-DUMMY",
            licenseNumber: "DUMMY-RIDER",
            phone: "+919999999992",
            lat: 12.9720,
            lng: 77.5950,
            isVerified: true,
            isOnline: true,
            status: "AVAILABLE"
        }
    });
    console.log("✅ Created Online Rider:", rider.vehicleNumber);

    // 4. Create Dummy Customer and Product
    const customer = await prisma.user.create({
        data: {
            name: "Dummy Customer",
            email: "dummy-customer@test.com",
            password: "hashed_pwd",
            role: "CUSTOMER",
            phone: "+919999999993"
        }
    });

    let product = await prisma.product.findFirst();
    if (!product) {
        product = await prisma.product.create({
            data: { name: "Dummy Medicine", price: 100, image: "/test.png", category: "Test" }
        });
    }

    // 5. Place COD Order (Direct DB insert + Routing call to simulate API)
    console.log("\n--- PLACING COD ORDER ---");
    const { assignOrderToNearestRetailer } = require('./utils/routing');
    
    let order = await prisma.order.create({
        data: {
            userId: customer.id,
            guestName: customer.name,
            total: 100,
            status: "Received",
            paymentMethod: "COD",
            deliveryCode: "1234",
            lat: 12.9715,
            lng: 77.5945,
            items: {
                create: [{ productId: product.id, quantity: 1, price: 100 }]
            }
        }
    });
    console.log("✅ Order Created. ID:", order.id, "Status:", order.status);

    // 6. Trigger Routing
    await assignOrderToNearestRetailer(order.id);
    order = await prisma.order.findUnique({ where: { id: order.id } });
    console.log("✅ Routing Executed. Status:", order.status, "| Assigned Retailer ID:", order.assignedRetailerId);

    // 7. Simulate Retailer Accepting Fulfillment but DECLINING Delivery
    console.log("\n--- RETAILER ACCEPTS ORDER (DECLINES DELIVERY) ---");
    // We will call the accept API logic manually
    const { assignOrderToNearestAgent } = require('./utils/deliveryRouting');
    
    // Fallback logic from our newly fixed accept route
    const firstRetailerId = order.nearestRetailerIds && order.nearestRetailerIds.length > 0 ? order.nearestRetailerIds[0] : retailer.id;
    order = await prisma.order.update({
        where: { id: order.id },
        data: {
            status: "Preparing", 
            assignedRetailerId: firstRetailerId, 
            isRetailerDelivering: false,
            declinedRetailers: { push: retailer.id }
        }
    });
    
    await assignOrderToNearestAgent(order.id);
    order = await prisma.order.findUnique({ where: { id: order.id } });
    console.log("✅ Retailer Accepted (Platform Delivery). Status:", order.status, "| Assigned Rider ID:", order.deliveryAgentId);

    // Check if Rider received it
    if (order.deliveryAgentId === rider.id) {
        console.log("🎉 SUCCESS! Rider successfully matched to order.");
    } else {
        console.log("❌ FAILED! Rider not matched.");
    }
    
    // Admin check
    console.log("\n--- ADMIN VIEW ---");
    console.log(`Order ${order.id} is in status ${order.status} with Rider ${order.deliveryAgentId}`);
    
    console.log("\n--- TEST COMPLETE ---");
    process.exit(0);
}

main().catch(console.error);
