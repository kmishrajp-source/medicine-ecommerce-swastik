const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
    // Test the exact query that the API uses
    const hospitals = await prisma.hospital.findMany({
        where: { city: 'Gorakhpur' },
        include: { doctors: true },
        orderBy: { name: 'asc' }
    });
    console.log('Query successful. Hospital count:', hospitals.length);
    hospitals.forEach(h => console.log(` - ${h.name} | Doctors: ${h.doctors.length}`));
}
main().catch(e => {
    console.error('ERROR IN API QUERY:', e.message);
    console.error(e.code);
}).finally(() => prisma.$disconnect());
