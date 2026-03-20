const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedGorakhpurDoctors() {
    console.log("--- Seeding Doctors in Gorakhpur ---");
    
    const gorakhpurDoctors = [
        {
            name: "Dr. Sandeep Kumar",
            specialization: "Cardiologist",
            hospital: "Gorakhpur Heart Center",
            city: "Gorakhpur",
            address: "Golghar, Gorakhpur, UP",
            phone: "919876543210",
            isDirectory: true,
            verified: false,
            isClaimed: false,
            imageUrl: "https://via.placeholder.com/150",
            about: "Experienced cardiologist with over 15 years of practice."
        },
        {
            name: "Dr. Anjali Singh",
            specialization: "Pediatrician",
            hospital: "City Child Clinic",
            city: "Gorakhpur",
            address: "Civil Lines, Gorakhpur, UP",
            phone: "919876543211",
            isDirectory: true,
            verified: false,
            isClaimed: false,
            imageUrl: "https://via.placeholder.com/150",
            about: "Specialist in child health and neonatology."
        },
        {
            name: "Dr. Rajesh Gupta",
            specialization: "General Physician",
            hospital: "Gupta Wellness Clinic",
            city: "Gorakhpur",
            address: "Medical College Road, Gorakhpur, UP",
            phone: "919876543212",
            isDirectory: true,
            verified: false,
            isClaimed: false,
            imageUrl: "https://via.placeholder.com/150",
            about: "Providing comprehensive primary care for families."
        }
    ];

    for (const doc of gorakhpurDoctors) {
        await prisma.doctor.upsert({
            where: { phone: doc.phone },
            update: doc,
            create: doc
        });
        console.log(`- Upserted: ${doc.name}`);
    }

    console.log("Seeding complete.");
    await prisma.$disconnect();
}

seedGorakhpurDoctors();
