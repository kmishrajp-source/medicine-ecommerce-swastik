// Force environment variable for the script
process.env.PRISMA_DATABASE_URL = "postgresql://postgres:password@localhost:5432/mydb";

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('--- Starting Test Data Setup ---');

    try {
        // 1. Create/Update Fake Retailer
        const retailerEmail = 'fake.retailer@swastik.test';
        const retailerUser = await prisma.user.upsert({
            where: { email: retailerEmail },
            update: { role: 'RETAILER' },
            create: {
                email: retailerEmail,
                name: 'Test Retailer',
                password: 'test_password_123',
                role: 'RETAILER'
            }
        });

        const retailer = await prisma.retailer.upsert({
            where: { userId: retailerUser.id },
            update: {
                verified: true,
                shopName: 'Test Fake Pharmacy',
                address: '98-B, Mayur Vihar Phase II, Delhi',
                lat: 28.6139,
                lng: 77.2090
            },
            create: {
                userId: retailerUser.id,
                shopName: 'Test Fake Pharmacy',
                address: '98-B, Mayur Vihar Phase II, Delhi',
                phone: '7992122974',
                licenseNumber: 'TEST-LIC-12345',
                verified: true,
                lat: 28.6139,
                lng: 77.2090
            }
        });
        console.log('✅ Fake Retailer Setup:', retailerEmail);

        // 2. Create/Update Fake Delivery Agent
        const agentEmail = 'fake.agent@swastik.test';
        const agentUser = await prisma.user.upsert({
            where: { email: agentEmail },
            update: { role: 'DELIVERY' },
            create: {
                email: agentEmail,
                name: 'Test Agent',
                password: 'test_password_123',
                role: 'DELIVERY'
            }
        });

        const agent = await prisma.deliveryAgent.upsert({
            where: { userId: agentUser.id },
            update: {
                verified: true,
                isOnline: true,
                lat: 28.6139,
                lng: 77.2090
            },
            create: {
                userId: agentUser.id,
                phone: '7992122974',
                licenseNumber: 'TEST-DL-12345',
                vehicleNumber: 'DL-01-TEST',
                verified: true,
                isOnline: true,
                lat: 28.6139,
                lng: 77.2090
            }
        });
        console.log('✅ Fake Delivery Agent Setup:', agentEmail);

        // 3. Find/Create a Product for the order
        let product = await prisma.product.findFirst();
        if (!product) {
            product = await prisma.product.create({
                data: {
                    name: 'Test Medicine',
                    description: 'Test Description',
                    price: 100,
                    image: 'https://placehold.co/200',
                    category: 'Test',
                    requiresPrescription: true
                }
            });
        }

        // 4. Create a Fake Order
        const order = await prisma.order.create({
            data: {
                guestName: 'Test Patient',
                guestEmail: 'patient@test.com',
                guestPhone: '7992122974',
                address: 'Mayur Vihar Ph 2, Delhi',
                total: 100,
                status: 'Ready_for_Packing',
                paymentMethod: 'COD',
                assignedRetailerId: retailer.id,
                deliveryAgentId: agent.id,
                items: {
                    create: {
                        productId: product.id,
                        quantity: 1,
                        price: 100
                    }
                },
                prescription: {
                    create: {
                        imageUrl: 'https://placehold.co/600x400?text=Fake+Prescription',
                        patientId: retailerUser.id,
                        status: 'Processed'
                    }
                }
            }
        });
        console.log('✅ Fake Order Created:', order.id);
    } catch (err) {
        console.error('❌ Error during setup:', err);
    }

    console.log('--- Setup Complete ---');
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
