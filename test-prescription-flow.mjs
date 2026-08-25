import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function runTest() {
    console.log("=== STARTING PRESCRIPTION FLOW TEST ===");
    try {
        // 1. Create a Mock Customer and Retailer
        const customer = await prisma.user.upsert({
            where: { email: 'rx-customer@swastik.com' },
            update: {},
            create: { email: 'rx-customer@swastik.com', name: 'Rx Customer', password: 'hash', role: 'CUSTOMER' }
        });

        const retailer = await prisma.retailer.upsert({
            where: { email: 'rx-retailer@swastik.com' },
            update: {},
            create: { email: 'rx-retailer@swastik.com', password: 'hash', shopName: 'Swastik Rx Pharmacy', phone: '9876543210' }
        });

        console.log(`✅ Mock Customer created: ${customer.id}`);
        console.log(`✅ Mock Retailer created: ${retailer.id}`);

        // 2. Customer Uploads Prescription
        console.log("\n1️⃣ Customer is uploading a prescription...");
        const prescription = await prisma.prescription.create({
            data: {
                imageUrl: 'https://example.com/mock-rx.jpg',
                patientId: customer.id,
                status: 'Pending',
            }
        });
        console.log(`📝 Prescription Uploaded! ID: ${prescription.id} | Status: ${prescription.status}`);

        // 3. Retailer Reviews and provides a Quote
        console.log("\n2️⃣ Retailer reviews prescription and provides a quote...");
        const quoteItems = [
            { name: "Amoxicillin 500mg", qty: 2, price: 100 },
            { name: "Paracetamol 650mg", qty: 1, price: 50 }
        ];
        const quotedAmount = 250;

        const quote = await prisma.prescriptionQuote.create({
            data: {
                prescriptionId: prescription.id,
                retailerId: retailer.id,
                quotedAmount: quotedAmount,
                items: quoteItems,
                status: 'PENDING'
            }
        });
        
        await prisma.prescription.update({
            where: { id: prescription.id },
            data: { status: 'Quoted' }
        });
        console.log(`💬 Retailer Quoted: ₹${quotedAmount} for ${quoteItems.length} items. Prescription Status is now 'Quoted'.`);

        // 4. Customer Accepts Quote
        console.log("\n3️⃣ Customer reviews and accepts the quote...");
        await prisma.prescriptionQuote.update({
            where: { id: quote.id },
            data: { status: 'ACCEPTED' }
        });
        
        await prisma.prescription.update({
            where: { id: prescription.id },
            data: { status: 'Processed' }
        });

        console.log(`✅ Quote Accepted! Status is now 'Processed'.`);

        // 5. Order is Generated
        console.log("\n4️⃣ Generating Final Order from Quote...");
        const deliveryCode = "9999";
        const order = await prisma.order.create({
            data: {
                userId: customer.id,
                total: quotedAmount,
                status: "Received",
                paymentMethod: "COD",
                deliveryCode: deliveryCode,
                assignedRetailerId: retailer.id, // Auto-assign to the retailer who quoted
                items: {
                    create: quoteItems.map(item => ({
                        productId: "rx-item", // Mock product ID for rx
                        quantity: item.qty,
                        price: item.price,
                        productName: item.name
                    }))
                }
            }
        });

        // Link prescription to the new order
        await prisma.prescription.update({
            where: { id: prescription.id },
            data: { orderId: order.id }
        });

        console.log(`📦 Order Generated Successfully! Order ID: ${order.id} | Amount: ₹${order.total}`);
        console.log(`🔐 Delivery OTP for Rider: ${deliveryCode}`);
        console.log(`📲 (System blasts WhatsApp to Rider and Retailer for fulfillment)`);

        // 6. Cleanup
        console.log("\n🧹 Cleaning up test data...");
        await prisma.orderItem.deleteMany({ where: { orderId: order.id } });
        await prisma.order.delete({ where: { id: order.id } });
        await prisma.prescriptionQuote.deleteMany({ where: { prescriptionId: prescription.id } });
        await prisma.prescription.delete({ where: { id: prescription.id } });
        console.log("✅ Cleanup complete.");

    } catch (e) {
        console.error("Test Error:", e);
    } finally {
        await prisma.$disconnect();
    }
}

runTest();
