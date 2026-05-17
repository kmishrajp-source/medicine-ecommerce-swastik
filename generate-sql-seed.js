
const salts = [
    "Paracetamol","Amoxicillin","Cetirizine","Pantoprazole","Diclofenac",
    "Ibuprofen","Aceclofenac","Azithromycin","Cefixime","Metformin",
    "Glimepiride","Teneligliptin","Vildagliptin","Dapagliflozin","Sitagliptin",
    "Telmisartan","Atorvastatin","Rosuvastatin","Amlodipine","Ramipril",
    "Losartan","Olmesartan","Bisoprolol","Carvedilol","Spironolactone",
    "Furosemide","Hydrochlorothiazide","Clopidogrel","Aspirin","Nitroglycerine",
    "Omeprazole","Esomeprazole","Rabeprazole","Lansoprazole","Domperidone",
    "Ondansetron","Metoclopramide","Dicyclomine","Mebeverine","Sucralfate",
    "Ketoconazole","Itraconazole","Fluconazole","Terbinafine","Luliconazole",
    "Clobetasol","Mometasone","Betamethasone","Hydrocortisone","Mupirocin",
    "Adapalene","Benzoyl Peroxide","Salicylic Acid","Hydroquinone","Tretinoin",
    "Ofloxacin","Ciprofloxacin","Levofloxacin","Norfloxacin","Ornidazole",
    "Metronidazole","Tinidazole","Doxycycline","Tetracycline","Clindamycin",
    "Amikacin","Gentamicin","Vancomycin","Meropenem","Piperacillin",
    "Salbutamol","Levosalbutamol","Budesonide","Formoterol","Salmeterol",
    "Montelukast","Levocetirizine","Fexofenadine","Bilastine","Rupatadine",
    "Ambroxol","Guaifenesin","Bromhexine","Terbutaline","Theophylline",
    "Pregabalin","Gabapentin","Amitriptyline","Sertraline","Escitalopram",
    "Fluoxetine","Duloxetine","Venlafaxine","Clonazepam","Alprazolam",
    "Methylcobalamin","Pyridoxine","Folic Acid","Iron","Calcium",
    "Vitamin D3","Vitamin C","Zinc","Magnesium","Omega-3",
    "Nimesulide","Etoricoxib","Mefenamic Acid","Naproxen","Thiocolchicoside",
    "Tizanidine","Baclofen","Chlorzoxazone","Etodolac","Acemetacin",
    "Linagliptin","Empagliflozin","Canagliflozin","Glipizide","Insulin Glargine",
    "Levothyroxine","Carbimazole","Prednisolone","Deflazacort","Dexamethasone",
    "Tacrolimus","Azathioprine","Hydroxychloroquine","Colchicine","Allopurinol"
];

const brands = [
    "Dolo","Calpol","Crocin","Pan","Pantocid","Cetzine","Okacet","Zyrtec",
    "Voveran","Dynapar","Combiflam","Brufen","Zerodol","Hifenac","Acenac",
    "Augmentin","Mox","Novamox","Azithral","Azee","Zithrox","Zifi","Taxim",
    "Glycomet","Glucophage","Amaryl","Glimy","Zoryl","Telma","Tazloc",
    "Atorva","Lipikind","Tonact","Rosuvas","Rozucor","Amlokind","Stamlo",
    "Cardace","Cardiopril","Repace","Losacar","Benicar","Cardimet","Aspicot",
    "Omee","Rabiet","Nexpro","Lanzol","Pantosec","Domstal","Emeset","Perinorm",
    "Cyclopam","Mebevast","Sucrafil","Mucaine","Defcort","Medrol","Betnesol",
    "Ciplox","Zenflox","Loxof","Oflox","Cifran","Flagyl","Fasigyn","Metrogyl",
    "Ketostar","Nizral","Itralan","Candiforce","Tyza","Lulifin","Lulican",
    "Tenovate","Lobate","Mela-Clear","Elocon","Candid","Clop","T-Bact",
    "Persol","Saslic","Adaferin","Retino-A","Melalong","Kojivit","Kligman",
    "Montair","Levocet","Allegra","Fexova","Bilaxten","Rupanase","Atarax",
    "Ascoril","Mucosolvan","Ambrolite","Bricasolv","Grilinctus","Benadryl",
    "Asthalin","Levolin","Pulmicort","Foracort","Serobid","Duolin","Tiova",
    "Gabacip","Pregaba","Gabantin","Lyrica","Maxgalin","Nuroday","Mecobal",
    "Citazone","Escitop","Seralia","Duzela","Ventab","Stalopam","Rekool",
    "Lonazep","Alprax","Trinicalm","Anxit","Nexito","Flunil","Fludac",
    "Shelcal","Gemcal","Cipcal","Calcerol","Macraberin","Becosules","Supradyn",
    "Zincovit","A-Z Gold","Revital","Orofer","Dexorange","Fefol","Rubired",
    "Nise","Nucoxia","Meftal","Flanax","Myospaz","Tizpa","Liofen","Mobizox",
    "Ivermectine","Albendazole","Mebendazole","Quinine","Chloroquine"
];

const dosages = [
    "500mg","650mg","100mg","200mg","250mg","400mg","40mg","20mg","10mg",
    "5mg","2.5mg","1mg","80mg","160mg","600mg","1000mg","1gm",
    "XL","SR","DSR","CV","Plus","D3","XT","Z","DS","HD","M","AM","H",
    "Syrup","Drops","Gel","Cream","Ointment","Lotion","Inhaler","Spray","Injection"
];

const categories = [
    "General","Pain Relief","Antibiotics","Supplements","Diabetes",
    "Cardiology","Dermatology","Gastrointestinal","Respiratory","Neuro",
    "Antiallergic","Vitamins","Hormonal","Antifungal","Antiparasitic"
];

const manufacturers = [
    "Cipla Ltd","Sun Pharmaceutical","Lupin Ltd","Dr Reddy's Labs","Alkem Laboratories",
    "Torrent Pharmaceuticals","Zydus Lifesciences","Mankind Pharma","Abbott India","GSK India",
    "Pfizer India","Sanofi India","Glenmark Pharma","Biocon","Aurobindo Pharma","Ipca Labs",
    "JB Chemicals","Micro Labs","Aristo Pharmaceuticals","Intas Pharmaceuticals",
    "Cadila Healthcare","Eris Lifesciences","Emcure Pharmaceuticals","FDC Limited",
    "Himalaya Drug Company","Dabur India","Patanjali Ayurved","Bayer India","Novartis India"
];

const images = [
    "https://images.unsplash.com/photo-1584308666744-24d59b298f0d?auto=format&fit=crop&w=200&q=80",
    "https://images.unsplash.com/photo-1631549916768-4119b2e5f926?auto=format&fit=crop&w=200&q=80",
    "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&w=200&q=80",
    "https://images.unsplash.com/photo-1550572017-edb9215037d0?auto=format&fit=crop&w=200&q=80",
    "https://images.unsplash.com/photo-1585435557343-3b092031a831?auto=format&fit=crop&w=200&q=80",
    "https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?auto=format&fit=crop&w=200&q=80"
];

function generateSQL() {
    let sql = `-- SWASTIK MEDICARE MASTER SEED DATA\n-- Generated on ${new Date().toISOString()}\n\n`;
    
    sql += `-- 1. HOSPITALS\n`;
    const hospitals = [
        ['hosp_brd', 'BRD Medical College & Hospital', 'Gorakhpur-Sonauli Road, Gorakhpur', 'Gorakhpur', '0551-2206060', 'Multi-Specialty, Cardiology, Pediatrics', true, true, 4.2],
        ['hosp_chandan', 'Chandan Hospital', 'Bank Road, Gorakhpur', 'Gorakhpur', '0551-2334001', 'Surgery, Gynecology, Orthopedics', true, true, 4.5],
        ['hosp_star', 'Star Hospital Gorakhpur', 'Mohaddipur, Gorakhpur', 'Gorakhpur', '9305555500', 'Maternity, Neonatology', true, true, 4.4]
    ];
    
    for (const h of hospitals) {
        sql += `INSERT INTO "Hospital" (id, name, address, city, phone, specialties, verified, "isDirectory", rating, "updatedAt") \n`;
        sql += `VALUES ('${h[0]}', '${h[1]}', '${h[2]}', '${h[3]}', '${h[4]}', '${h[5]}', ${h[6]}, ${h[7]}, ${h[8]}, NOW()) ON CONFLICT (id) DO NOTHING;\n`;
    }

    sql += `\n-- 2. DOCTORS\n`;
    const doctors = [
        ['doc_rajiv', 'Dr. Rajiv Kumar Srivastava', 'Cardiologist', 'hosp_brd', 'Gorakhpur', '9451234567', true, 'verified', true, 4.8, 700],
        ['doc_anand', 'Dr. Anand Pratap Singh', 'Neurologist', 'hosp_brd', 'Gorakhpur', '9451234568', true, 'verified', true, 4.9, 800],
        ['doc_rk_gupta', 'Dr. R.K. Gupta', 'Orthopedic Surgeon', 'hosp_chandan', 'Gorakhpur', '9519234567', true, 'verified', true, 4.8, 700]
    ];

    for (const d of doctors) {
        sql += `INSERT INTO "Doctor" (id, name, specialization, "hospitalId", city, phone, verified, status, "isDirectory", rating, "consultationFee") \n`;
        sql += `VALUES ('${d[0]}', '${d[1]}', '${d[2]}', '${d[3]}', '${d[4]}', '${d[5]}', ${d[6]}, '${d[7]}', ${d[8]}, ${d[9]}, ${d[10]}) ON CONFLICT (id) DO NOTHING;\n`;
    }

    sql += `\n-- 3. RETAILERS\n`;
    const retailers = [
        ['ret_swastik', 'Swastik Medical Store', 'Civil Lines, Gorakhpur', 'Gorakhpur', '9161364908', 'UP/GKP/DL/2024/001', true, true, 4.9, true],
        ['ret_chemist', 'Gorakhnath Chemist', 'Taramandal, Gorakhpur', 'Gorakhpur', '8877665544', 'UP/GKP/DL/2024/002', true, true, 4.7, true]
    ];

    for (const r of retailers) {
        sql += `INSERT INTO "Retailer" (id, "shopName", address, city, phone, "licenseNumber", verified, "isDirectory", rating, "isOnline") \n`;
        sql += `VALUES ('${r[0]}', '${r[1]}', '${r[2]}', '${r[3]}', '${r[4]}', '${r[5]}', ${r[6]}, ${r[7]}, ${r[8]}, ${r[9]}) ON CONFLICT (id) DO NOTHING;\n`;
    }

    sql += `\n-- 4. MEDICINES (500+ Items)\n`;
    const usedNames = new Set();
    let count = 0;
    while (count < 500) {
        const salt = salts[Math.floor(Math.random() * salts.length)];
        const brand = brands[Math.floor(Math.random() * brands.length)];
        const dose = dosages[Math.floor(Math.random() * dosages.length)];
        const manufacturer = manufacturers[Math.floor(Math.random() * manufacturers.length)];
        const category = categories[Math.floor(Math.random() * categories.length)];
        const price = Math.floor(Math.random() * 800) + 20;
        const discount = Math.floor(Math.random() * 25);
        const name = `${brand} ${dose}`;

        if (usedNames.has(name)) continue;
        usedNames.add(name);

        const id = `prod_${count}`;
        const isRx = ["Antibiotics","Diabetes","Cardiology","Neuro"].includes(category);
        const description = `${name} contains ${salt}. Manufactured by ${manufacturer}.`;
        const image = images[Math.floor(Math.random() * images.length)];

        sql += `INSERT INTO "Product" (id, name, description, price, image, category, "requiresPrescription", stock, salt, manufacturer, mrp, discount, "isOTC") \n`;
        sql += `VALUES ('${id}', '${name}', '${description.replace(/'/g, "''")}', ${price}, '${image}', '${category}', ${isRx}, 100, '${salt}', '${manufacturer}', ${Math.floor(price * 1.2)}, ${discount}, ${!isRx}) ON CONFLICT (name) DO NOTHING;\n`;
        count++;
    }

    return sql;
}

const fs = require('fs');
fs.writeFileSync('medicine-directory-seed.sql', generateSQL());
console.log('✅ Generated medicine-directory-seed.sql');
