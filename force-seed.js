const { PrismaClient } = require('@prisma/client');

// Use the DIRECT_URL from .env to bypass pooler issues if possible
// We'll manually override it for this script
const prisma = new PrismaClient({
    datasources: {
        db: {
            url: "postgresql://postgres.kklkpnzwxaxekxraqswh:Shivangi%40%23%242004@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres"
        }
    }
});

async function main() {
    console.log("Attempting to connect to Direct DB...");
    try {
        const productCount = await prisma.product.count();
        console.log("Current product count:", productCount);

        if (productCount === 0) {
            console.log("Seeding products...");
            const seedProducts = [
                { name: "Dolo 650", description: "Paracetamol 650mg. Rapid relief from fever and pain.", price: 30.50, image: "https://images.unsplash.com/photo-1584308666744-24d59b298f0d?auto=format&fit=crop&w=400&q=80", category: "General", requiresPrescription: false, stock: 150, uses: "Fever, Body Ache", sideEffects: "Nausea" },
                { name: "Calpol 500", description: "Paracetamol 500mg. Highly effective for fever reduction.", price: 15.00, image: "https://images.unsplash.com/photo-1631549916768-4119b2e5f926?auto=format&fit=crop&w=400&q=80", category: "General", requiresPrescription: false, stock: 85, uses: "Fever, Low-grade Pain" },
                { name: "Combiflam", description: "Ibuprofen + Paracetamol. Powerful dual-action for body aches.", price: 45.20, image: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&w=400&q=80", category: "Pain Relief", requiresPrescription: false, stock: 200, uses: "Body Pain, Headache", sideEffects: "Acidity" },
                { name: "Augmentin 625 Duo", description: "Broad-spectrum antibiotic for bacterial infections.", price: 201.75, image: "https://images.unsplash.com/photo-1585435557343-3b092031a831?auto=format&fit=crop&w=400&q=80", category: "Antibiotics", requiresPrescription: true, stock: 35, uses: "Infections" },
                { name: "Zincovit Tablet", description: "Multi-vitamin supplement for daily immunity.", price: 105.00, image: "https://images.unsplash.com/photo-1550572017-edb9215037d0?auto=format&fit=crop&w=400&q=80", category: "Supplements", requiresPrescription: false, stock: 500, uses: "Immunity Booster" },
                { name: "Himalaya Liv.52", description: "Herbal formula for liver protection.", price: 155.00, image: "https://images.unsplash.com/photo-1550572017-edb9215037d0?auto=format&fit=crop&w=400&q=80", category: "Ayurvedic", requiresPrescription: false, stock: 120, uses: "Liver Health" }
            ];
            await prisma.product.createMany({ data: seedProducts });
            console.log("✅ Seeding complete.");
        } else {
            console.log("Products already exist. No seeding needed.");
        }
    } catch (e) {
        console.error("❌ Operation failed:", e.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
