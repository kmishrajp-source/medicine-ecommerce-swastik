import { PrismaClient } from '@prisma/client';
import { executeIntelligentRouting } from './utils/intelligent-routing.js';

const prisma = new PrismaClient();

async function runTest() {
    console.log("=== STARTING END-TO-END FLOW TEST ===");
    try {
        // 1. Create a mock product
        let product = await prisma.product.findFirst({ where: { name: 'Test Medicine AI' }});
        if (!product) {
            product = await prisma.product.create({
                data: {
                    name: 'Test Medicine AI',
                    price: 150,
                    category: 'Test',
                    description: 'Test product for E2E flow',
                    image: '/placeholder.png',
                    requiresPrescription: false
                }
            });
            console.log("Created Mock Product:", product.id);
        }

        // 2. Create a mock order
        const deliveryCode = "1234";
        const order = await prisma.order.create({
            data: {
                total: 150,
                status: "Received",
                paymentMethod: "COD",
                deliveryCode: deliveryCode,
                lat: 26.75, // Gorakhpur coordinates
                lng: 83.37,
                guestName: "E2E Test User",
                guestPhone: "9999999999",
                address: "Test Address, Gorakhpur",
                items: {
                    create: [{
                        productId: product.id,
                        quantity: 1,
                        price: 150,
                        productName: "Test Medicine AI"
                    }]
                }
            }
        });
        console.log(`\n✅ Order Created! ID: ${order.id} | Delivery OTP: ${deliveryCode}`);

        // 3. Trigger Intelligent Routing
        console.log("\n🚀 Triggering HyperLocal AI Routing...");
        // Mock the environment to prevent real WhatsApp messages
        process.env.MSG91_AUTH_KEY = ""; 
        
        const routedOrder = await executeIntelligentRouting(order.id);
        
        if (routedOrder) {
            console.log(`\n🎯 Routing Decision: ${routedOrder.pickupType}`);
            console.log(`Pickup Location ID: ${routedOrder.pickupId}`);
            console.log(`Assigned Delivery Agent ID: ${routedOrder.deliveryAgentId}`);
            console.log(`New Order Status: ${routedOrder.status}`);
        } else {
            console.log("Routing returned null. Please check coordinates and availability.");
        }

        // 4. Verify Delivery
        console.log("\n🚚 Simulating Rider Delivery Verification...");
        
        // Simulating the logic inside /api/rider/verify-delivery
        const verifyOrder = await prisma.order.findUnique({ where: { id: order.id } });
        if (verifyOrder.deliveryCode === "1234") {
            const deliveredOrder = await prisma.order.update({
                where: { id: order.id },
                data: {
                    status: 'Delivered',
                    isDelivered: true,
                    deliveredAt: new Date(),
                }
            });
            console.log(`✅ Delivery Verified successfully! Order Status: ${deliveredOrder.status}`);
            console.log(`💰 Payment of ₹${deliveredOrder.total} collected via ${deliveredOrder.paymentMethod}.`);
        } else {
            console.log("❌ Delivery Verification Failed: Invalid OTP");
        }

        // 5. Cleanup
        console.log("\n🧹 Cleaning up test data...");
        await prisma.orderItem.deleteMany({ where: { orderId: order.id } });
        await prisma.order.delete({ where: { id: order.id } });
        console.log("✅ Cleanup complete.");

    } catch (e) {
        console.error("Test Error:", e);
    } finally {
        await prisma.$disconnect();
    }
}

runTest();
