const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDoctors() {
    try {
        const doctors = await prisma.doctor.findMany({
            include: { user: { select: { name: true, email: true } } }
        });
        console.log("Total Doctors in Database:", doctors.length);
        console.log("Doctors Summary:", JSON.stringify(doctors.map(d => ({
            id: d.id,
            name: d.name || d.user?.name,
            verified: d.verified,
            isDirectory: d.isDirectory,
            isClaimed: d.isClaimed
        })), null, 2));
    } catch (e) {
        console.error("Error fetching doctor data:", e);
    } finally {
        await prisma.$disconnect();
    }
}

checkDoctors();
