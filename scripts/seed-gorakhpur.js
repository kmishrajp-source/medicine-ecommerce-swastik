const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("--- 🏥 Seeding Gorakhpur Healthcare Directory ---");

    // 1. Seed Hospitals
    const hospitals = [
        {
            name: "BRD Medical College",
            address: "Gorakhpur - Sonauli Rd, Gorakhpur",
            city: "Gorakhpur",
            phone: "+91-9876543210",
            specialties: "Multi-specialty, Cardiology, Pediatrics",
            verified: true
        },
        {
            name: "Star Hospital",
            address: "Bank Road, Gorakhpur",
            city: "Gorakhpur",
            phone: "+91-9876500001",
            specialties: "Maternity, Orthopedics, General Surgery",
            verified: true
        },
        {
            name: "Medident Hospital",
            address: "Golghar, Gorakhpur",
            city: "Gorakhpur",
            phone: "+91-9876511112",
            specialties: "Dentistry, Maxillofacial Surgery",
            verified: true
        }
    ];

    for (const h of hospitals) {
        const hId = h.name.toLowerCase().replace(/\s+/g, '-');
        await prisma.hospital.upsert({
            where: { id: hId },
            update: {},
            create: { id: hId, ...h }
        });
        console.log(`✅ Hospital Created: ${h.name}`);

        // 2. Seed Doctors for each hospital
        const doctors = [
            {
                name: `Dr. Amit (at ${h.name})`,
                specialization: h.specialties.split(',')[0],
                hospital: h.name,
                hospitalId: hId,
                phone: "+91-9988776655",
                city: "Gorakhpur",
                verified: true,
                status: "verified"
            }
        ];

        for (const d of doctors) {
            await prisma.doctor.create({ data: d });
            console.log(`   👨‍⚕️ Doctor Created: ${d.name}`);
        }
    }

    // 3. Seed Retailers
    const retailers = [
        {
            shopName: "Gorakhnath Chemist",
            address: "Near Gorakhnath Temple, Gorakhpur",
            city: "Gorakhpur",
            phone: "+91-8877665544",
            licenseNumber: "UP/GKP/2024/001",
            verified: true,
            status: "verified"
        },
        {
            shopName: "Golghar Medicine Square",
            address: "Main Market, Golghar, Gorakhpur",
            city: "Gorakhpur",
            phone: "+91-8877665511",
            licenseNumber: "UP/GKP/2024/002",
            verified: true,
            status: "verified"
        }
    ];

    for (const r of retailers) {
        await prisma.retailer.create({ data: r });
        console.log(`💊 Retailer Created: ${r.shopName}`);
    }

    console.log("--- ✅ Seed Completed ---");
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
