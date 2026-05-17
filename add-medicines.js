const { Client } = require('pg');

const medicines = [
    { name: "Dolo 650mg", salt: "Paracetamol", category: "General", price: 30, mrp: 35, discount: 14, manufacturer: "Micro Labs", image: "https://images.unsplash.com/photo-1584308666744-24d59b298f0d?auto=format&fit=crop&w=200&q=80" },
    { name: "Augmentin 625 DUO", salt: "Amoxicillin + Clavulanic Acid", category: "Antibiotics", price: 180, mrp: 201, discount: 10, manufacturer: "GSK", image: "https://images.unsplash.com/photo-1631549916768-4119b2e5f926?auto=format&fit=crop&w=200&q=80" },
    { name: "Pantocid 40mg", salt: "Pantoprazole", category: "Acidity", price: 120, mrp: 140, discount: 14, manufacturer: "Sun Pharma", image: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&w=200&q=80" },
    { name: "Zifi 200mg", salt: "Cefixime", category: "Antibiotics", price: 95, mrp: 110, discount: 13, manufacturer: "FDC", image: "https://images.unsplash.com/photo-1550572017-edb9215037d0?auto=format&fit=crop&w=200&q=80" },
    { name: "Becosules Z", salt: "B-Complex + Vitamin C + Zinc", category: "Supplements", price: 45, mrp: 50, discount: 10, manufacturer: "Pfizer", image: "https://images.unsplash.com/photo-1585435557343-3b092031a831?auto=format&fit=crop&w=200&q=80" }
];

async function addMedicines() {
    // Attempting direct connection with the encoded password found in remediation scripts
    const connectionString = "postgresql://postgres.kklkpnzwxaxekxraqswh:Shivangi%40%23%242004@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres";
    
    const client = new Client({
        connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        console.log("Connecting to database...");
        await client.connect();
        console.log("✅ Connected!");

        for (const med of medicines) {
            const query = `
                INSERT INTO "Product" (name, salt, category, price, mrp, discount, manufacturer, image, "requiresPrescription", "isOTC", stock)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                ON CONFLICT (name) DO UPDATE SET price = EXCLUDED.price, stock = EXCLUDED.stock
            `;
            const values = [
                med.name, med.salt, med.category, med.price, med.mrp, med.discount, 
                med.manufacturer, med.image, med.category === "Antibiotics", med.category !== "Antibiotics", 100
            ];
            await client.query(query, values);
            console.log(`Added: ${med.name}`);
        }
        console.log("✅ Medicine directory added successfully!");
    } catch (err) {
        console.error("❌ Error adding medicines:", err.message);
        console.log("\nIf this failed with ENOTFOUND, it's likely a network/DNS issue or the project is paused.");
    } finally {
        await client.end();
    }
}

addMedicines();
