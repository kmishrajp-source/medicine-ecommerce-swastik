const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seed() {
    console.log('Clearing old placeholder inventory...');
    await prisma.product.deleteMany({});

    const realMedicines = [
        // GENERAL / FEVER
        {
            name: "Dolo 650",
            description: "Paracetamol 650mg. Rapid relief from fever and mild to moderate pain. Essential for every home kit.",
            price: 30.50,
            image: "https://images.unsplash.com/photo-1584308666744-24d59b298f0d?auto=format&fit=crop&w=400&q=80",
            category: "General",
            requiresPrescription: false,
            stock: 150
        },
        {
            name: "Calpol 500",
            description: "Paracetamol 500mg. Highly effective analgesic and antipyretic for quick fever reduction.",
            price: 15.00,
            image: "https://images.unsplash.com/photo-1631549916768-4119b2e5f926?auto=format&fit=crop&w=400&q=80",
            category: "General",
            requiresPrescription: false,
            stock: 85
        },
        // PAIN RELIEF
        {
            name: "Combiflam",
            description: "Ibuprofen + Paracetamol tablet. Powerful dual-action formula for strong body aches and inflammation.",
            price: 45.20,
            image: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&w=400&q=80",
            category: "Pain Relief",
            requiresPrescription: false,
            stock: 200
        },
        {
            name: "Volini Gel (30g)",
            description: "Diclofenac Diethylamine. Fast-acting topical ointment for joint pain, sprains, and muscle stiffness.",
            price: 110.00,
            image: "https://images.unsplash.com/photo-1550572017-edb9215037d0?auto=format&fit=crop&w=400&q=80",
            category: "Pain Relief",
            requiresPrescription: false,
            stock: 0 // Out of stock to show feature
        },
        // ANTIBIOTICS
        {
            name: "Augmentin 625 Duo",
            description: "Amoxycillin + Clavulanic Acid. Broad-spectrum prescription antibiotic for bacterial infections.",
            price: 201.75,
            image: "https://images.unsplash.com/photo-1585435557343-3b092031a831?auto=format&fit=crop&w=400&q=80",
            category: "Antibiotics",
            requiresPrescription: true,
            stock: 35
        },
        {
            name: "Azithral 500",
            description: "Azithromycin 500mg. Highly prescribed for respiratory tract, throat, and ear infections.",
            price: 119.50,
            image: "https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?auto=format&fit=crop&w=400&q=80",
            category: "Antibiotics",
            requiresPrescription: true,
            stock: 12
        },
        // SUPPLEMENTS & VITAMINS
        {
            name: "Zincovit Tablet",
            description: "Multi-vitamin & Multi-mineral supplement with Grape Seed Extract for daily immunity and stamina.",
            price: 105.00,
            image: "https://images.unsplash.com/photo-1550572017-edb9215037d0?auto=format&fit=crop&w=400&q=80",
            category: "Supplements",
            requiresPrescription: false,
            stock: 500
        },
        {
            name: "Shelcal 500",
            description: "Calcium + Vitamin D3. Essential daily dietary supplement for strong bones and joint health.",
            price: 119.30,
            image: "https://images.unsplash.com/photo-1584308666744-24d59b298f0d?auto=format&fit=crop&w=400&q=80",
            category: "Supplements",
            requiresPrescription: false,
            stock: 250
        },
        // DIABETES
        {
            name: "Glycomet-GP 2",
            description: "Glimepiride + Metformin. Advanced blood sugar management prescription medicine.",
            price: 180.00,
            image: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&w=400&q=80",
            category: "Diabetes",
            requiresPrescription: true,
            stock: 90
        },
        // CARDIOLOGY
        {
            name: "Telma 40",
            description: "Telmisartan 40mg. Trusted prescription medication for controlling high blood pressure and hypertension.",
            price: 215.00,
            image: "https://images.unsplash.com/photo-1631549916768-4119b2e5f926?auto=format&fit=crop&w=400&q=80",
            category: "Cardiology",
            requiresPrescription: true,
            stock: 0 // Out of stock to show feature
        },
        // AYURVEDIC
        {
            name: "Himalaya Liv.52",
            description: "Hepatoprotective herbal formula. Naturally protects the liver against hepatotoxins.",
            price: 155.00,
            image: "https://images.unsplash.com/photo-1550572017-edb9215037d0?auto=format&fit=crop&w=400&q=80",
            category: "Ayurvedic",
            requiresPrescription: false,
            stock: 120
        },
        {
            name: "Dabur Honitus",
            description: "Ayurvedic cough syrup. Fast relief from dry cough without drowsiness. Contains Tulsi, Mulethi & Banapsha.",
            price: 95.00,
            image: "https://images.unsplash.com/photo-1585435557343-3b092031a831?auto=format&fit=crop&w=400&q=80",
            category: "Ayurvedic",
            requiresPrescription: false,
            stock: 300
        }
    ];

    try {
        await prisma.product.createMany({ data: realMedicines });
        console.log(`✅ Successfully seeded ${realMedicines.length} REAL Indian medicines to Supabase!`);
    } catch (e) {
        console.error('❌ Failed to seed:', e);
    } finally {
        await prisma.$disconnect();
    }
}

seed();
