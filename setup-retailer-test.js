const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkRetailers() {
    const retailers = await prisma.retailer.findMany({
        select: { id: true, shopName: true, isOnline: true, lat: true, lng: true, phone: true }
    });
    
    console.log("Retailers in Database:", retailers);

    // Let's force update the first retailer to be online and have coordinates
    // and set the phone number to the admin's phone so they get the message
    if (retailers.length > 0) {
        const target = retailers[0];
        const updated = await prisma.retailer.update({
            where: { id: target.id },
            data: {
                isOnline: true,
                lat: 26.7606, // Gorakhpur coordinates
                lng: 83.3732,
                phone: "917992122974" // User's number
            }
        });
        console.log("Forced Retailer Update:", updated.shopName, "is now Online at lat 26.76, lng 83.37 with phone 917992122974");
    } else {
        console.log("NO RETAILERS FOUND. Creating a dummy retailer...");
        await prisma.retailer.create({
            data: {
                shopName: "Swastik Default Pharmacy",
                ownerName: "Admin",
                phone: "917992122974",
                address: "Gorakhpur Center",
                licenseNumber: "DL-123456",
                gstNumber: "22AAAAA0000A1Z5",
                isVerified: true,
                isOnline: true,
                lat: 26.7606,
                lng: 83.3732
            }
        });
        console.log("Dummy Retailer Created.");
    }
}

checkRetailers().finally(() => prisma.$disconnect());
