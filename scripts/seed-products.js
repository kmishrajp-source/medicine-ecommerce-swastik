const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("Seeding products...");

    // 1. Allopathic Medicines
    const allopathic = [
        { name: "Paracetamol 500mg", category: "General", price: 20, description: "Fever and pain relief", image: "https://upload.wikimedia.org/wikipedia/commons/2/28/Paracetamol_tablets.jpg", stock: 100 },
        { name: "Amoxicillin 250mg", category: "Antibiotics", price: 85, description: "Antibiotic for bacterial infections", requiresPrescription: true, image: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Amoxicillin_capsules.jpg/800px-Amoxicillin_capsules.jpg", stock: 50 },
        { name: "Cetirizine 10mg", category: "Allergy", price: 35, description: "Allergy relief", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Cetirizine_10mg_Tablets.jpg/800px-Cetirizine_10mg_Tablets.jpg", stock: 200 },
        { name: "Metformin 500mg", category: "Diabetes", price: 45, description: "For Type 2 Diabetes", requiresPrescription: true, image: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Metformin_500mg_Brands.jpg/800px-Metformin_500mg_Brands.jpg", stock: 80 },
        { name: "Atorvastatin 10mg", category: "Cardiology", price: 110, description: "Cholesterol lowering", requiresPrescription: true, image: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/Atorvastatin_20_mg_tablets.jpg/800px-Atorvastatin_20_mg_tablets.jpg", stock: 60 },
        { name: "Pantoprazole 40mg", category: "Gastrointestinal", price: 70, description: "Acid reflux relief", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Pantoprazole_tablets.jpg/800px-Pantoprazole_tablets.jpg", stock: 150 },
        { name: "Ibuprofen 400mg", category: "Pain Relief", price: 25, description: "Anti-inflammatory pain relief", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Ibuprofen_200mg_Tablets.jpg/800px-Ibuprofen_200mg_Tablets.jpg", stock: 0 }, // Out of stock example
        { name: "Vitamin D3 60k", category: "Supplements", price: 120, description: "Vitamin D supplement", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/Vitamin_D3.jpg/800px-Vitamin_D3.jpg", stock: 40 },
        { name: "Aspirin 75mg", category: "Cardiology", price: 15, description: "Blood thinner", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Aspirin-tablets.jpg/800px-Aspirin-tablets.jpg", stock: 300 },
        { name: "Azithromycin 500mg", category: "Antibiotics", price: 115, description: "Broad spectrum antibiotic", requiresPrescription: true, image: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/Azithromycin_tablets.jpg/800px-Azithromycin_tablets.jpg", stock: 25 }
    ];

    // 2. Ayurvedic Medicines
    const ayurvedic = [
        { name: "Chyawanprash", category: "Ayurvedic", price: 350, description: "Immunity booster herbal paste", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Chyawanprash.jpg/800px-Chyawanprash.jpg", stock: 50 },
        { name: "Ashwagandha Powder", category: "Ayurvedic", price: 220, description: "Stress relief and vitality", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7f/Ashwagandha_Roots_and_Powder.jpg/800px-Ashwagandha_Roots_and_Powder.jpg", stock: 30 },
        { name: "Triphala Churna", category: "Ayurvedic", price: 120, description: "Digestive health", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Triphala_Powder.jpg/800px-Triphala_Powder.jpg", stock: 100 },
        { name: "Brahmi Vati", category: "Ayurvedic", price: 180, description: "Brain tonic and memory", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Brahmi_leaves.jpg/800px-Brahmi_leaves.jpg", stock: 0 }, // Out of stock
        { name: "Neem Tablets", category: "Ayurvedic", price: 90, description: "Blood purifier and skin health", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Neem_Leaves.jpg/800px-Neem_Leaves.jpg", stock: 200 },
        { name: "Giloy Ghan Vati", category: "Ayurvedic", price: 110, description: "Immunity status", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Tinospora_cordifolia.jpg/800px-Tinospora_cordifolia.jpg", stock: 60 },
        { name: "Shilajit Resin", category: "Ayurvedic", price: 999, description: "Strength and stamina", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/Shilajit.jpg/800px-Shilajit.jpg", stock: 10 },
        { name: "Arjuna Bark Powder", category: "Ayurvedic", price: 150, description: "Heart health", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Terminalia_arjuna_trunk.jpg/800px-Terminalia_arjuna_trunk.jpg", stock: 40 },
        { name: "Tulsi Drops", category: "Ayurvedic", price: 130, description: "Respiratory health", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/Tulsi_Basil.jpg/800px-Tulsi_Basil.jpg", stock: 150 },
        { name: "Kumkumadi Oil", category: "Ayurvedic", price: 450, description: "Skin radiance oil", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Saffron_threads.jpg/800px-Saffron_threads.jpg", stock: 5 }
    ];

    try {
        await prisma.product.createMany({
            data: [...allopathic, ...ayurvedic],
            skipDuplicates: true
        });
        console.log("Seeding completed successfully.");
    } catch (e) {
        console.error("Error seeding:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
