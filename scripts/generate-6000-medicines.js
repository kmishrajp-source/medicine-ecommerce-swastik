const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const salts = [
    "Paracetamol", "Amoxicillin", "Cetirizine", "Pantoprazole", "Diclofenac", 
    "Ibuprofen", "Aceclofenac", "Azithromycin", "Cefixime", "Metformin",
    "Glimepiride", "Telmisartan", "Atorvastatin", "Amlodipine", "Ketoconazole",
    "Clobetasol", "Luliconazole", "Omeprazole", "Ranitidine", "Domperidone",
    "Ofloxacin", "Ornidazole", "Levofloxacin", "Montelukast", "Levocetirizine",
    "Ambroxol", "Guaifenesin", "Terbutaline", "Fexofenadine", "Bilastine",
    "Deflazacort", "Methylprednisolone", "Pregabalin", "Gabapentin", "Methylcobalamin",
    "Vildagliptin", "Teneligliptin", "Dapagliflozin", "Rosuvastatin", "Ramipril",
    "Losartan", "Hydrochlorothiazide", "Spironolactone", "Furosemide", "Torsemide",
    "Rabeprazole", "Esomeprazole", "Lansoprazole", "Sucralfate", "Magaldrate",
    "Ofloxacin + Ornidazole", "Ciprofloxacin", "Norfloxacin", "Tinidazole", "Fluconazole",
    "Itraconazole", "Terbinafine", "Sertaconazole", "Clotrimazole", "Mupirocin",
    "Fusidic Acid", "Silver Sulfadiazine", "Adaphalene", "Benzoyl Peroxide", "Salicylic Acid",
    "Hydroquinone", "Mometasone", "Fluticasone", "Budesonide", "Formoterol",
    "Salbutamol", "Levosalbutamol", "Ipratropium", "Tiotropium", "Acebrophylline",
    "Nimesulide", "Serratiopeptidase", "Etodolac", "Etoricoxib", "Thiocolchicoside",
    "Chlorzoxazone", "Baclofen", "Tizanidine", "Naproxen", "Mefenamic Acid",
    "Dicyclomine", "Hyoscine", "Drotaverine", "Mebeverine", "Chlordiazepoxide",
    "Alprazolam", "Etizolam", "Clonazepam", "Sertraline", "Escitalopram",
    "Amitriptyline", "Nortriptyline", "Fluoxetine", "Paroxetine", "Venlafaxine"
];

const brands = [
    "Dolo", "Calpol", "Crocin", "Mox", "Augmentin", "Cetzine", "Okacet", "Pan", 
    "Pantocid", "Voveran", "Dynapar", "Brufen", "Combiflam", "Zerodol", "Hifenac",
    "Azithral", "Azee", "Zifi", "Taxim", "Glycomet", "Amaryl", "Telma", "Tazloc",
    "Atorva", "Lipikind", "Amlokind", "Stamlo", "Ketostar", "Nizral", "Tenovate",
    "Lobate", "Lulifin", "Lulican", "Omee", "Rantac", "Domstal", "Oflox", "Zenflox",
    "Loxof", "Montair", "Allegra", "Ascoril", "Grilinctus", "Benadryl", "Fexova",
    "Defcort", "Medrol", "Pregaba", "Gabantin", "Mecob", "Galvus", "Tenglyn",
    "Forxiga", "Rosuvas", "Cardace", "Repace", "Aquazide", "Aldactone", "Lasix",
    "Tide", "Rabiet", "Nexpro", "Lanzol", "Sucrafil", "Mucaine", "O2", "Ciplox",
    "Norflox", "Fungicros", "Candiforce", "Tyza", "Onabet", "Surfaz", "T-Bact",
    "Fucidin", "Silverex", "Adaferin", "Persol", "Saslic", "Melalong", "Elocon",
    "Flomist", "Pulmicort", "Foracort", "Asthalin", "Levolin", "Duolin", "Tiova",
    "AB-Phylline", "Nise", "Amlany", "Etova", "Nucoxia", "Myospaz", "Mobizox",
    "Liofen", "Sirdalud", "Naprosyn", "Meftal", "Cyclopam", "Buscopan", "Drotin"
];

const categories = [
    "General", "Pain Relief", "Antibiotics", "Supplements", "Diabetes", 
    "Cardiology", "Dermatology", "Gastrointestinal", "Respiratory", "Neuro"
];

const dosages = ["500mg", "650mg", "100mg", "200mg", "40mg", "20mg", "10mg", "5mg", "1gm", "2.5mg", "XL", "SR", "DSR", "CV"];

const manufacturers = [
    "Cipla Ltd", "Sun Pharmaceutical", "Lupin Ltd", "Dr Reddy's Labs", "Alkem Laboratories",
    "Torrent Pharmaceuticals", "Zydus Lifesciences", "Mankind Pharma", "Abbott India", "GSK India",
    "Pfizer India", "Sanofi India", "Glenmark Pharma", "Biocon", "Aurobindo Pharma", "Ipca Labs",
    "JB Chemicals", "Micro Labs", "Aristo Pharmaceuticals", "Intas Pharmaceuticals"
];

async function generate() {
    console.log("Generating 6000 unique medicines...");
    const medicines = [];
    const usedNames = new Set();

    while (medicines.length < 6050) {
        const salt = salts[Math.floor(Math.random() * salts.length)];
        const brand = brands[Math.floor(Math.random() * brands.length)];
        const dose = dosages[Math.floor(Math.random() * dosages.length)];
        const manufacturer = manufacturers[Math.floor(Math.random() * manufacturers.length)];
        const category = categories[Math.floor(Math.random() * categories.length)];
        
        const finalName = `${brand} ${dose}`;
        
        if (usedNames.has(finalName)) continue;
        usedNames.add(finalName);

        medicines.push({
            name: finalName,
            salt: salt,
            manufacturer: manufacturer,
            category: category,
            price: Math.floor(Math.random() * 800) + 20,
            mrp: 0, // Will calculate below
            description: `${finalName} contains ${salt}. Manufactured by ${manufacturer}. Used for ${category} related treatments.`,
            image: `https://images.unsplash.com/photo-1584308666744-24d59b298f0d?auto=format&fit=crop&w=200&q=80`,
            requiresPrescription: ["Antibiotics", "Diabetes", "Cardiology", "Neuro"].includes(category),
            stock: Math.floor(Math.random() * 500) + 10,
            discount: Math.floor(Math.random() * 20),
            uses: `Treatment of conditions related to ${category}. Consult a doctor for specific dosage.`,
            sideEffects: "May cause minor stomach upset, dizziness, or drowsiness in some cases.",
            isOTC: !["Antibiotics", "Diabetes", "Cardiology", "Neuro"].includes(category),
            isScheduleH1: ["Antibiotics"].includes(category) && Math.random() > 0.5
        });

        // Set MRP higher than price
        const med = medicines[medicines.length - 1];
        med.mrp = Math.floor(med.price * (1 + (med.discount / 100) + 0.1));
    }

    console.log(`Generated ${medicines.length} medicines. Attempting to seed...`);
    
    // Batch inserts for Prisma
    const batchSize = 100;
    for (let i = 0; i < medicines.length; i += batchSize) {
        const batch = medicines.slice(i, i + batchSize);
        try {
            await prisma.product.createMany({
                data: batch,
                skipDuplicates: true
            });
            console.log(`Inserted ${i + batch.length} medicines...`);
        } catch (err) {
            console.error(`Error in batch starting at ${i}:`, err.message);
        }
    }

    console.log("Seeding process finished.");
    await prisma.$disconnect();
}

generate();
