const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
    console.log("Seeding High-Conversion SEO Content...");

    // 1. Seed SEO Blog Posts (Module 1)
    const blogPosts = [
        {
            slug: "top-5-pediatricians-gorakhpur",
            title: "Top 5 Pediatricians in Gorakhpur for Child Care",
            content: "Finding the right doctor for your child is crucial. In Gorakhpur, several pediatricians offer world-class care. \n\n1. Dr. ABC (Golghar)\n2. Dr. XYZ (Betiahata)\n3. Dr. PQR (Medical College Road)\n\nThese doctors are verified by Swastik Medicare and ensure your child's health is in safe hands.",
            metaTitle: "Best Pediatricians in Gorakhpur | Child Specialists 2024",
            metaDescription: "Discover the top 5 pediatricians in Gorakhpur. Verified contact details, clinic locations, and instant WhatsApp booking options.",
            category: "Child Care",
            featuredImage: "https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?auto=format&fit=crop&w=800&q=80"
        },
        {
            slug: "best-cardiologists-gorakhpur-heart-health",
            title: "Best Cardiologists in Gorakhpur: A Complete Guide",
            content: "Heart health cannot be ignored. Gorakhpur has some of the finest cardiologists equipped with modern diagnostic tools. \n\nIf you are experiencing chest pain or breathlessness, contact these specialists immediately.",
            metaTitle: "Top Cardiologists in Gorakhpur | Heart Specialists Verified",
            metaDescription: "Looking for a heart specialist in Gorakhpur? See our list of verified cardiologists with direct contact details and instant consultation.",
            category: "Cardiology",
            featuredImage: "https://images.unsplash.com/photo-1628348068343-c6a848d2b6dd?auto=format&fit=crop&w=800&q=80"
        }
    ];

    for (const post of blogPosts) {
        await prisma.blogPost.upsert({
            where: { slug: post.slug },
            update: post,
            create: post
        });
    }

    // 2. Seed Symptom Maps (Module 5)
    const symptomMaps = [
        { symptom: "fever", suggestedSpecialization: "General Physician" },
        { symptom: "chest pain", suggestedSpecialization: "Cardiologist" },
        { symptom: "skin rash", suggestedSpecialization: "Dermatologist" },
        { symptom: "back pain", suggestedSpecialization: "Orthopedic" },
        { symptom: "toothache", suggestedSpecialization: "Dentist" },
        { symptom: "pregnancy", suggestedSpecialization: "Gynecologist" },
        { symptom: "child health", suggestedSpecialization: "Pediatrician" },
        { symptom: "vision", suggestedSpecialization: "Ophthalmologist" }
    ];

    for (const map of symptomMaps) {
        await prisma.symptomMap.upsert({
            where: { symptom: map.symptom },
            update: map,
            create: map
        });
    }

    console.log("Seeding completed successfully.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
