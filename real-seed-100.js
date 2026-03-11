const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const medBases = {
    'General': [
        { name: "Paracetamol", brands: ["Dolo", "Calpol", "Crocin", "Tylenol", "Pacha"], dose: ["500mg", "650mg"], uses: "Reduces fever by acting on the brain's temperature-regulating center. Blocks pain pathways to relieve mild body aches and headaches.", sideEffects: "Generally safe. Rare side effects include liver damage (only on severe overdose) or allergic skin rashes." },
        { name: "Cetirizine", brands: ["Cetzine", "Okacet", "Zyrtec", "Alerid", "Cetgel"], dose: ["10mg"], uses: "Blocks histamine receptors during allergic reactions, providing rapid relief from sneezing, runny nose, and severe itching.", sideEffects: "Can cause mild drowsiness, dry mouth, or fatigue in some patients." },
        { name: "Pantoprazole", brands: ["Pan", "Pantosec", "Pantocid", "Pentab", "Penza"], dose: ["40mg", "DSR"], uses: "A proton pump inhibitor (PPI) that drastically reduces the amount of acid produced in the stomach, treating severe acidity and heartburn.", sideEffects: "Occasional mild headache, stomach pain, or flatulence. Safe for long-term use under guidance." }
    ],
    'Pain Relief': [
        { name: "Diclofenac", brands: ["Voveran", "Reactin", "Volini", "Dicloran", "Dynapar"], dose: ["50mg", "AQ", "Gel"], uses: "A Non-Steroidal Anti-Inflammatory Drug (NSAID). Relieves intense pain and swelling by blocking chemical messengers causing inflammation.", sideEffects: "May cause stomach upset, mild nausea, or heartburn if taken on an empty stomach." },
        { name: "Ibuprofen", brands: ["Brufen", "Combiflam", "Ibugesic", "Flexon", "Advil"], dose: ["400mg", "Plus"], uses: "Reduces inflammatory hormones to treat muscle pain, dental pain, back pain, and moderate fever.", sideEffects: "Can cause indigestion, sleepiness, or mild dizziness." },
        { name: "Aceclofenac", brands: ["Zerodol", "Hifenac", "Acenac", "Aldigesic", "Dolokind"], dose: ["SP", "P", "100mg"], uses: "Directly targets inflamed joints and tissue. Highly effective for arthritis, spondylitis, and severe muscle spasms.", sideEffects: "Mild stomach pain, loss of appetite, or diarrhea." }
    ],
    'Antibiotics': [
        { name: "Amoxicillin", brands: ["Augmentin", "Moxikind", "Novamox", "Almox", "Mox"], dose: ["625", "CV", "250mg"], uses: "A penicillin-type antibiotic that works by stopping the growth of bacteria causing throat, ear, and respiratory tract infections.", sideEffects: "Can cause diarrhea, nausea, or a mild skin rash." },
        { name: "Azithromycin", brands: ["Azithral", "Azee", "Zithrox", "Azax", "Aziwok"], dose: ["500mg", "250mg"], uses: "A macrolide antibiotic that halts bacterial growth by interfering with their protein synthesis. Used for typhoid and severe chest infections.", sideEffects: "Abdominal cramps, vomiting, or stomach upset." },
        { name: "Cefixime", brands: ["Zifi", "Taxim-O", "Cefolac", "Omnix", "Mahacef"], dose: ["200mg", "100mg"], uses: "A cephalosporin antibiotic that kills bacteria by preventing them from forming the bacterial protective covering.", sideEffects: "Diarrhea, nausea, or indigestion. Safe when prescribed." }
    ],
    'Supplements': [
        { name: "Multivitamin", brands: ["Zincovit", "Supradyn", "A to Z", "Becosules", "Revital"], dose: ["Capsules", "Syrup"], uses: "Restores crucial vitamins and minerals in the body. Boosts daily immunity, fights fatigue, and promotes healthy skin and hair.", sideEffects: "Very rare. May cause mild stomach upset or unusual taste in mouth on an empty stomach." },
        { name: "Calcium + D3", brands: ["Shelcal", "Gemcal", "Calcimax", "Cipcal", "Osteocare"], dose: ["500", "HD"], uses: "Directly supplements bone mineral density. Vitamin D3 helps the body absorb the calcium efficiently from the gut.", sideEffects: "Constipation, gas, or mild nausea if taken without food." },
        { name: "Iron", brands: ["Dexorange", "Orofer", "Rubired", "Fefol", "R.B.Tone"], dose: ["Z", "XT", "Syrup"], uses: "Maintains optimal red blood cell production. Reverses anemia and chronic exhaustion by carrying vital oxygen to brain cells.", sideEffects: "Dark stools, mild constipation, or metallic taste." }
    ],
    'Ayurvedic': [
        { name: "Liver Care", brands: ["Liv.52", "Himalaya", "Amlycure", "Livotrit", "Patanjali"], dose: ["DS", "Syrup", "Tablets"], uses: "A 100% natural herbal formula that flushes toxins from the liver and promotes healthy enzymatic digestion.", sideEffects: "No known side effects. Pure herbal formulation safe for daily consumption." },
        { name: "Cough Syrup", brands: ["Honitus", "Koflet", "Cofsils", "Pankajakasthuri", "Zandu"], dose: ["100ml", "Tulsi"], uses: "Contains natural Tulsi and Mulethi to soothe the throat and dissolve thick mucus. Non-drowsy herbal relief.", sideEffects: "None. Completely safe and natural." },
        { name: "Digestive", brands: ["Pudin Hara", "Gasofast", "Hingvastak", "Triphala", "Isabgol"], dose: ["Pearls", "Powder"], uses: "Utilizes cooling mint and ancient herbs to instantly neutralize stomach gas, bloating, and minor indigestion.", sideEffects: "Rare mild minty burps." }
    ],
    'Diabetes': [
        { name: "Metformin", brands: ["Glycomet", "Glucophage", "Obimet", "Okamet", "Zomet"], dose: ["500mg", "SR", "850mg"], uses: "Lowers blood glucose production in the liver and improves your body's sensitivity to insulin. The absolute gold standard for Type-2 Diabetes.", sideEffects: "Nausea, vomiting, diarrhea, or metallic taste during the first few days of use." },
        { name: "Glimepiride", brands: ["Amaryl", "Glimy", "Zoryl", "Azulix", "Glimestar"], dose: ["1mg", "2mg", "M1"], uses: "A sulfonylurea medication that directly stimulates the pancreas to release more natural insulin into the bloodstream.", sideEffects: "Hypoglycemia (low blood sugar), slight weight gain, or dizziness." },
        { name: "Teneligliptin", brands: ["Tenglyn", "Zita Plus", "Tenepride", "Afoglip", "Dynaglipt"], dose: ["20mg", "M"], uses: "A DPP-4 inhibitor that strictly controls blood sugar spikes immediately after eating heavy meals.", sideEffects: "Mild headache or upper respiratory tract infection (rare)." }
    ],
    'Cardiology': [
        { name: "Telmisartan", brands: ["Telma", "Telmikind", "Tazloc", "Telsartan", "Cresax"], dose: ["40", "H", "AM"], uses: "An Angiotensin Receptor Blocker (ARB). Relaxes and widens blood vessels, significantly lowering dangerously high blood pressure.", sideEffects: "Dizziness upon standing quickly, back pain, or sinus infections." },
        { name: "Atorvastatin", brands: ["Atorva", "Lipikind", "Tonact", "Storvas", "Aztor"], dose: ["10mg", "20mg", "40mg"], uses: "A statin medication that heavily reduces 'bad' cholesterol (LDL) and triglycerides in the blood, preventing heart attacks and strokes.", sideEffects: "Mild muscle aching, fatigue, or temporary stomach upset." },
        { name: "Amlodipine", brands: ["Amlokind", "Stamlo", "Amlovas", "Amlodac", "Amlopres"], dose: ["5mg", "2.5mg"], uses: "A calcium channel blocker. Lowers blood pressure by relaxing the muscular walls of blood vessels.", sideEffects: "Swelling in the ankles or feet, mild palpitations, or flushing." }
    ],
    'Dermatology': [
        { name: "Ketoconazole", brands: ["Hhconazole", "Ketostar", "Nizral", "Keraglo", "KZ"], dose: ["Lotion", "Soap", "Cream"], uses: "A highly aggressive antifungal. Destroys the cell membrane of fungi causing severe dandruff, ringworm, and athlete's foot.", sideEffects: "Temporary skin redness, mild stinging, or dryness at the application site." },
        { name: "Clobetasol", brands: ["Tenovate", "Lobate", "Clop", "Cortiderm", "Topinate"], dose: ["Cream", "Ointment"], uses: "A very potent topical steroid. Instantly suppresses immune responses causing severe skin inflammation, psoriasis, and intense itching.", sideEffects: "Thinning of the skin or stretch marks if overused for extended months." },
        { name: "Luliconazole", brands: ["Lulifin", "Lulican", "Luzer", "Luliz", "Luligee"], dose: ["1%", "Cream"], uses: "A new generation antifungal that directly kills dermatophytes and yeasts. Highly effective against stubborn skin infections.", sideEffects: "Slight itching or burning sensation for a few minutes after initial application." }
    ]
};

const images = [
    "https://images.unsplash.com/photo-1584308666744-24d59b298f0d?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1631549916768-4119b2e5f926?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1550572017-edb9215037d0?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1585435557343-3b092031a831?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?auto=format&fit=crop&w=400&q=80"
];

async function seed() {
    console.log('Clearing old inventory and severing foreign key locks...');
    await prisma.orderItem.deleteMany({});
    await prisma.stockLog.deleteMany({});
    await prisma.product.deleteMany({});

    let generatedMedicines = [];
    let count = 0;
    const categories = Object.keys(medBases);

    while (generatedMedicines.length < 100) {
        const category = categories[count % categories.length];
        const baseDefs = medBases[category];
        const base = baseDefs[Math.floor(Math.random() * baseDefs.length)];
        const brand = base.brands[Math.floor(Math.random() * base.brands.length)];
        const dose = base.dose[Math.floor(Math.random() * base.dose.length)];
        const finalName = `${brand} ${dose}`;

        if (generatedMedicines.find(m => m.name === finalName)) continue;

        generatedMedicines.push({
            name: finalName,
            description: `${base.name} - Highly prescribed and clinically approved medication. Premium quality healthcare formula.`,
            price: Math.floor(Math.random() * 450) + 20,
            image: images[Math.floor(Math.random() * images.length)],
            category: category,
            requiresPrescription: ["Antibiotics", "Diabetes", "Cardiology"].includes(category),
            uses: base.uses, // NEW FIELD
            sideEffects: base.sideEffects, // NEW FIELD
            stock: Math.random() > 0.15 ? Math.floor(Math.random() * 300) + 15 : 0
        });
        count++;
    }

    try {
        await prisma.product.createMany({ data: generatedMedicines });
        console.log(`✅ Successfully seeded 100 medicines WITH Detailed Uses & Side Effects!`);
    } catch (e) {
        console.error('❌ Failed to seed:', e);
    } finally {
        await prisma.$disconnect();
    }
}
seed();
