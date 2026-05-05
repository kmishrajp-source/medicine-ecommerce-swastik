const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');

async function main() {
    try {
        const passwordHash = await bcrypt.hash('password123', 10);
        
        // 1. Customer
        const customer = await prisma.user.upsert({
            where: { email: 'dummy_customer@swastik.com' },
            update: {},
            create: {
                name: 'Dummy Customer',
                email: 'dummy_customer@swastik.com',
                phone: '9999999991',
                password: passwordHash,
                role: 'CUSTOMER',
                walletBalance: 500,
                phoneVerified: true
            }
        });
        console.log('Created Customer:', customer.name, '(Phone: 9999999991)');

        // 2. Retailer
        const retailerUser = await prisma.user.upsert({
            where: { email: 'dummy_retailer@swastik.com' },
            update: {},
            create: {
                name: 'Dummy Retailer',
                email: 'dummy_retailer@swastik.com',
                phone: '9999999992',
                password: passwordHash,
                role: 'RETAILER',
                walletBalance: 0,
                phoneVerified: true
            }
        });
        
        const retailerProfile = await prisma.retailer.upsert({
            where: { userId: retailerUser.id },
            update: {},
            create: {
                userId: retailerUser.id,
                shopName: 'Dummy Pharmacy',
                address: 'Test Street, Gorakhpur',
                licenseNumber: 'DL-DUMMY-1234',
                phone: '9999999992',
                verified: true,
                isOnline: true,
                status: 'verified'
            }
        });
        console.log('Created Retailer:', retailerProfile.shopName, '(Phone: 9999999992)');

        // 3. Delivery Man
        const deliveryUser = await prisma.user.upsert({
            where: { email: 'dummy_delivery@swastik.com' },
            update: {},
            create: {
                name: 'Dummy Delivery Man',
                email: 'dummy_delivery@swastik.com',
                phone: '9999999993',
                password: passwordHash,
                role: 'DELIVERY',
                walletBalance: 0,
                phoneVerified: true
            }
        });

        const deliveryProfile = await prisma.deliveryAgent.upsert({
            where: { userId: deliveryUser.id },
            update: {},
            create: {
                userId: deliveryUser.id,
                licenseNumber: 'DL-BIKE-5678',
                vehicleNumber: 'UP53-DUMMY-00',
                phone: '9999999993',
                verified: true,
                isOnline: true
            }
        });
        console.log('Created Delivery Man:', deliveryUser.name, '(Phone: 9999999993)');

        console.log('\n✅ All dummy accounts successfully registered.');
        await prisma.$disconnect();
    } catch (e) {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    }
}
main();
