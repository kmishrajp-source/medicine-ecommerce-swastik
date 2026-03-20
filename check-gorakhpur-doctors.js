const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkGorakhpurDoctors() {
    console.log("--- Checking Doctors in Gorakhpur ---");
    const doctors = await prisma.doctor.findMany({
        where: {
            OR: [
                { address: { contains: 'Gorakhpur', mode: 'insensitive' } },
                { city: { contains: 'Gorakhpur', mode: 'insensitive' } },
                { hospital: { contains: 'Gorakhpur', mode: 'insensitive' } }
            ]
        }
    });

    console.log(`Found ${doctors.length} doctors.`);
    doctors.forEach(d => {
        console.log(`- ${d.name} | Hospital: ${d.hospital} | isDirectory: ${d.isDirectory} | verified: ${d.verified} | isClaimed: ${d.isClaimed}`);
    });

    await prisma.$disconnect();
}

checkGorakhpurDoctors();
