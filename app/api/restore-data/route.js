import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes

// ============================================================
// MEDICINE DATA (6000 generated)
// ============================================================
const salts = [
    "Paracetamol","Amoxicillin","Cetirizine","Pantoprazole","Diclofenac",
    "Ibuprofen","Aceclofenac","Azithromycin","Cefixime","Metformin",
    "Glimepiride","Teneligliptin","Vildagliptin","Dapagliflozin","Sitagliptin",
    "Telmisartan","Atorvastatin","Rosuvastatin","Amlodipine","Ramipril",
    "Losartan","Olmesartan","Bisoprolol","Carvedilol","Spironolactone",
    "Furosemide","Hydrochlorothiazide","Clopidogrel","Aspirin","Omeprazole",
    "Esomeprazole","Rabeprazole","Lansoprazole","Domperidone","Ondansetron",
    "Metoclopramide","Dicyclomine","Mebeverine","Sucralfate","Ketoconazole",
    "Itraconazole","Fluconazole","Terbinafine","Luliconazole","Clobetasol",
    "Mometasone","Betamethasone","Hydrocortisone","Mupirocin","Adapalene",
    "Benzoyl Peroxide","Salicylic Acid","Hydroquinone","Tretinoin","Ofloxacin",
    "Ciprofloxacin","Levofloxacin","Norfloxacin","Ornidazole","Metronidazole",
    "Tinidazole","Doxycycline","Clindamycin","Salbutamol","Levosalbutamol",
    "Budesonide","Formoterol","Salmeterol","Montelukast","Levocetirizine",
    "Fexofenadine","Bilastine","Ambroxol","Guaifenesin","Bromhexine",
    "Pregabalin","Gabapentin","Amitriptyline","Sertraline","Escitalopram",
    "Fluoxetine","Duloxetine","Clonazepam","Alprazolam","Methylcobalamin",
    "Pyridoxine","Folic Acid","Iron Sucrose","Calcium Carbonate","Vitamin D3",
    "Vitamin C","Zinc Gluconate","Magnesium","Omega-3","Nimesulide","Etoricoxib",
    "Mefenamic Acid","Naproxen","Thiocolchicoside","Tizanidine","Baclofen",
    "Levothyroxine","Prednisolone","Deflazacort","Dexamethasone","Colchicine","Allopurinol"
];

const brands = [
    "Dolo","Calpol","Crocin","Pan","Pantocid","Cetzine","Okacet","Zyrtec",
    "Voveran","Dynapar","Combiflam","Brufen","Zerodol","Hifenac","Acenac",
    "Augmentin","Mox","Novamox","Azithral","Azee","Zithrox","Zifi","Taxim",
    "Glycomet","Glucophage","Amaryl","Glimy","Zoryl","Telma","Tazloc","Telsartan",
    "Atorva","Lipikind","Tonact","Rosuvas","Rozucor","Amlokind","Stamlo","Amlopres",
    "Cardace","Cardiopril","Repace","Losacar","Benicar","Aspicot","Ecosprin",
    "Omee","Rabiet","Nexpro","Lanzol","Pantosec","Domstal","Emeset","Perinorm",
    "Cyclopam","Mebevast","Sucrafil","Ketostar","Nizral","Itralan","Candiforce",
    "Tyza","Lulifin","Lulican","Tenovate","Lobate","Betnovate","Clop","T-Bact",
    "Persol","Saslic","Adaferin","Retino-A","Melalong","Kojivit","Elocon",
    "Ciplox","Zenflox","Loxof","Oflox","Cifran","Flagyl","Fasigyn","Metrogyl","Tiniba",
    "Vibramycin","Dalacin","Asthalin","Levolin","Pulmicort","Foracort","Serobid","Duolin",
    "Montair","Levocet","Allegra","Fexova","Bilaxten","Rupanase","Atarax",
    "Ascoril","Mucosolvan","Ambrolite","Grilinctus","Benadryl",
    "Gabacip","Pregaba","Gabantin","Lyrica","Maxgalin","Nuroday","Mecobal",
    "Citazone","Escitop","Seralia","Duzela","Ventab","Stalopam","Rekool",
    "Lonazep","Alprax","Trinicalm","Anxit","Nexito","Flunil","Fludac",
    "Shelcal","Gemcal","Cipcal","Calcerol","Becosules","Supradyn","Zincovit",
    "A-Z Gold","Revital","Orofer","Dexorange","Fefol","Rubired","RB Tone",
    "Nise","Nucoxia","Meftal","Flanax","Myospaz","Tizpa","Liofen","Mobizox",
    "Thyronorm","Thyrox","Defcort","Medrol","Betnesol","Colchimax","Zyloric",
    "Liv.52","Himalaya","Amlycure","Honitus","Koflet","Pudin Hara","Triphala"
];

const dosages = [
    "500mg","650mg","100mg","200mg","250mg","400mg","40mg","20mg","10mg",
    "5mg","2.5mg","1mg","80mg","160mg","600mg","1000mg","1gm","50mg",
    "XL","SR","DSR","CV","Plus","D3","XT","Z","DS","HD","M","AM","H","SP","P",
    "Syrup","Drops","Gel","Cream","Ointment","Lotion","Inhaler","Respules"
];

const categories = [
    "General","Pain Relief","Antibiotics","Supplements","Diabetes",
    "Cardiology","Dermatology","Gastrointestinal","Respiratory","Neuro",
    "Antiallergic","Vitamins","Hormonal","Antifungal","Ayurvedic"
];

const manufacturers = [
    "Cipla Ltd","Sun Pharmaceutical","Lupin Ltd","Dr Reddy's Labs","Alkem Laboratories",
    "Torrent Pharmaceuticals","Zydus Lifesciences","Mankind Pharma","Abbott India","GSK India",
    "Pfizer India","Sanofi India","Glenmark Pharma","Biocon","Aurobindo Pharma","Ipca Labs",
    "JB Chemicals","Micro Labs","Aristo Pharmaceuticals","Intas Pharmaceuticals",
    "Cadila Healthcare","Eris Lifesciences","Emcure Pharmaceuticals","FDC Limited",
    "Himalaya Drug Company","Dabur India","Patanjali Ayurved","Bayer India"
];

const images = [
    "https://images.unsplash.com/photo-1584308666744-24d59b298f0d?auto=format&fit=crop&w=200&q=80",
    "https://images.unsplash.com/photo-1631549916768-4119b2e5f926?auto=format&fit=crop&w=200&q=80",
    "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&w=200&q=80",
    "https://images.unsplash.com/photo-1550572017-edb9215037d0?auto=format&fit=crop&w=200&q=80",
    "https://images.unsplash.com/photo-1585435557343-3b092031a831?auto=format&fit=crop&w=200&q=80",
    "https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?auto=format&fit=crop&w=200&q=80"
];

function generateMedicines(count = 6000) {
    const rxCategories = ["Antibiotics","Diabetes","Cardiology","Neuro","Hormonal"];
    const medicines = [];
    const usedNames = new Set();
    let attempts = 0;

    while (medicines.length < count && attempts < 50000) {
        attempts++;
        const salt = salts[Math.floor(Math.random() * salts.length)];
        const brand = brands[Math.floor(Math.random() * brands.length)];
        const dose = dosages[Math.floor(Math.random() * dosages.length)];
        const manufacturer = manufacturers[Math.floor(Math.random() * manufacturers.length)];
        const category = categories[Math.floor(Math.random() * categories.length)];
        const price = Math.floor(Math.random() * 800) + 20;
        const discount = Math.floor(Math.random() * 25);
        const finalName = `${brand} ${dose}`;
        if (usedNames.has(finalName)) continue;
        usedNames.add(finalName);
        const isRx = rxCategories.includes(category);
        medicines.push({
            name: finalName, salt, manufacturer, brand, category, price,
            mrp: Math.floor(price * (1 + discount / 100 + 0.1)),
            discount,
            description: `${finalName} contains ${salt}. By ${manufacturer}. Used for ${category} conditions.`,
            image: images[Math.floor(Math.random() * images.length)],
            requiresPrescription: isRx,
            isOTC: !isRx,
            isScheduleH1: category === 'Antibiotics' && Math.random() > 0.5,
            stock: Math.floor(Math.random() * 500) + 10,
            uses: `Treatment of ${category} related conditions using ${salt}.`,
            sideEffects: "May cause mild stomach upset or dizziness. Consult doctor if symptoms persist."
        });
    }
    return medicines;
}

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const secret = searchParams.get("secret");
    const step = searchParams.get("step") || "all";

    if (secret !== "swastik_restore_2026") {
        return NextResponse.json({ error: "Unauthorized. Use ?secret=swastik_restore_2026" }, { status: 401 });
    }

    const report = { hospitals: 0, doctors: 0, retailers: 0, medicines: 0, errors: [] };

    try {
        // ── HOSPITALS ──────────────────────────────────────────
        if (step === "all" || step === "hospitals") {
            const hospitals = [
                { id: 'brd-medical-college', name: 'BRD Medical College & Hospital', address: 'Gorakhpur-Sonauli Road, Gorakhpur, UP 273013', city: 'Gorakhpur', phone: '0551-2206060', specialties: 'Multi-Specialty, Cardiology, Pediatrics, Neurology', verified: true, isDirectory: true, rating: 4.2, ratingCount: 890, openingHours: '24/7 Emergency' },
                { id: 'chandan-hospital', name: 'Chandan Hospital', address: 'Bank Road, Gorakhpur, UP', city: 'Gorakhpur', phone: '0551-2334001', specialties: 'General Surgery, Gynecology, Orthopedics, ICU', verified: true, isDirectory: true, rating: 4.5, ratingCount: 340, openingHours: '24/7 Hours' },
                { id: 'star-hospital-gkp', name: 'Star Hospital Gorakhpur', address: 'Mohaddipur, Gorakhpur', city: 'Gorakhpur', phone: '9305555500', specialties: 'Maternity, Neonatology, General Surgery', verified: true, isDirectory: true, rating: 4.4, ratingCount: 210, openingHours: '24/7 Hours' },
                { id: 'sewa-hospital', name: 'Sewa Hospital', address: 'Civil Lines, Gorakhpur', city: 'Gorakhpur', phone: '9935455544', specialties: 'Multi-specialty, Oncology, Orthopedics', verified: true, isDirectory: true, rating: 4.6, ratingCount: 180, openingHours: '8 AM - 10 PM' },
                { id: 'lilavati-hospital', name: 'Lilavati Hospital', address: 'Golghar, Gorakhpur', city: 'Gorakhpur', phone: '9876512345', specialties: 'Dermatology, Cosmetology, Gynecology', verified: true, isDirectory: true, rating: 4.7, ratingCount: 90, openingHours: '9 AM - 7 PM' },
                { id: 'nidaan-hospital', name: 'Nidaan Hospital & Research Centre', address: 'Basharatpur, Gorakhpur', city: 'Gorakhpur', phone: '9560123456', specialties: 'Nephrology, Urology, Dialysis', verified: true, isDirectory: true, rating: 4.4, ratingCount: 75, openingHours: '24/7 Hours' },
                { id: 'sahara-hospital-gkp', name: 'Sahara Hospital Gorakhpur', address: 'Padrauna Road, Gorakhpur', city: 'Gorakhpur', phone: '9696969696', specialties: 'Cardiology, ICU, Trauma', verified: true, isDirectory: true, rating: 4.3, ratingCount: 130, openingHours: '24/7 Hours' }
            ];
            for (const h of hospitals) {
                await prisma.hospital.upsert({ where: { id: h.id }, update: h, create: h });
                report.hospitals++;
            }
        }

        // ── DOCTORS ───────────────────────────────────────────
        if (step === "all" || step === "doctors") {
            const doctors = [
                { name: 'Dr. Rajiv Kumar Srivastava', specialization: 'Cardiologist', hospital: 'BRD Medical College & Hospital', hospitalId: 'brd-medical-college', city: 'Gorakhpur', phone: '9451234567', verified: true, status: 'verified', isDirectory: true, rating: 4.8, consultationFee: 700, openingHours: '10:00 AM - 2:00 PM', experience: 22, source: 'practo' },
                { name: 'Dr. Anand Pratap Singh', specialization: 'Neurologist', hospital: 'BRD Medical College & Hospital', hospitalId: 'brd-medical-college', city: 'Gorakhpur', phone: '9451234568', verified: true, status: 'verified', isDirectory: true, rating: 4.9, consultationFee: 800, openingHours: '11:00 AM - 2:00 PM', experience: 18, source: 'practo' },
                { name: 'Dr. Alka Singh', specialization: 'Pediatrician', hospital: 'BRD Medical College & Hospital', hospitalId: 'brd-medical-college', city: 'Gorakhpur', phone: '9451234569', verified: true, status: 'verified', isDirectory: true, rating: 4.7, consultationFee: 400, openingHours: '9:00 AM - 12:00 PM', experience: 15, source: 'docduniya' },
                { name: 'Dr. Sanjay Kumar Pandey', specialization: 'General Surgeon', hospital: 'BRD Medical College & Hospital', hospitalId: 'brd-medical-college', city: 'Gorakhpur', phone: '9451234570', verified: true, status: 'verified', isDirectory: true, rating: 4.6, consultationFee: 500, openingHours: '2:00 PM - 5:00 PM', experience: 20, source: 'docduniya' },
                { name: 'Dr. Prabha Pandey', specialization: 'Gynecologist', hospital: 'BRD Medical College & Hospital', hospitalId: 'brd-medical-college', city: 'Gorakhpur', phone: '9451234571', verified: true, status: 'verified', isDirectory: true, rating: 4.8, consultationFee: 600, openingHours: '9:00 AM - 11:00 AM', experience: 17, source: 'medindia' },
                { name: 'Dr. R.K. Gupta', specialization: 'Orthopedic Surgeon', hospital: 'Chandan Hospital', hospitalId: 'chandan-hospital', city: 'Gorakhpur', phone: '9519234567', verified: true, status: 'verified', isDirectory: true, rating: 4.8, consultationFee: 700, openingHours: '10:00 AM - 1:00 PM', experience: 25, source: 'practo' },
                { name: 'Dr. Sunita Sahu', specialization: 'Gynecologist & Obstetrician', hospital: 'Chandan Hospital', hospitalId: 'chandan-hospital', city: 'Gorakhpur', phone: '9519234568', verified: true, status: 'verified', isDirectory: true, rating: 4.9, consultationFee: 600, openingHours: '9:00 AM - 12:00 PM', experience: 20, source: 'docduniya' },
                { name: 'Dr. Manoj Kumar Sinha', specialization: 'General Physician', hospital: 'Chandan Hospital', hospitalId: 'chandan-hospital', city: 'Gorakhpur', phone: '9519234569', verified: true, status: 'verified', isDirectory: true, rating: 4.5, consultationFee: 300, openingHours: '8:00 AM - 12:00 PM', experience: 12, source: 'medindia' },
                { name: 'Dr. S.K. Mishra', specialization: 'ENT Specialist', hospital: 'Chandan Hospital', hospitalId: 'chandan-hospital', city: 'Gorakhpur', phone: '9519234570', verified: true, status: 'verified', isDirectory: true, rating: 4.7, consultationFee: 450, openingHours: '4:00 PM - 7:00 PM', experience: 16, source: 'docduniya' },
                { name: 'Dr. Priya Sharma', specialization: 'Neonatologist', hospital: 'Star Hospital Gorakhpur', hospitalId: 'star-hospital-gkp', city: 'Gorakhpur', phone: '9305234567', verified: true, status: 'verified', isDirectory: true, rating: 4.9, consultationFee: 700, openingHours: '10:00 AM - 1:00 PM', experience: 14, source: 'practo' },
                { name: 'Dr. Vivek Pandey', specialization: 'Laparoscopic Surgeon', hospital: 'Star Hospital Gorakhpur', hospitalId: 'star-hospital-gkp', city: 'Gorakhpur', phone: '9305234568', verified: true, status: 'verified', isDirectory: true, rating: 4.8, consultationFee: 800, openingHours: '3:00 PM - 6:00 PM', experience: 18, source: 'docduniya' },
                { name: 'Dr. Sudhir Kumar Srivastava', specialization: 'Oncologist', hospital: 'Sewa Hospital', hospitalId: 'sewa-hospital', city: 'Gorakhpur', phone: '9935234567', verified: true, status: 'verified', isDirectory: true, rating: 4.7, consultationFee: 1000, openingHours: '10:00 AM - 2:00 PM', experience: 20, source: 'medindia' },
                { name: 'Dr. Neha Agarwal', specialization: 'Dermatologist', hospital: 'Sewa Hospital', hospitalId: 'sewa-hospital', city: 'Gorakhpur', phone: '9935234568', verified: true, status: 'verified', isDirectory: true, rating: 4.8, consultationFee: 500, openingHours: '11:00 AM - 3:00 PM', experience: 10, source: 'practo' },
                { name: 'Dr. Suresh Yadav', specialization: 'General Physician', hospital: 'Swastik Medicare Clinic', city: 'Gorakhpur', phone: '9161364908', verified: true, status: 'verified', isDirectory: true, rating: 4.9, consultationFee: 300, openingHours: '8:00 AM - 12:00 PM', experience: 14, source: 'field_agent' },
                { name: 'Dr. Mohit Tiwari', specialization: 'Diabetologist', hospital: 'Tiwari Diabetes Clinic', city: 'Gorakhpur', phone: '9876533301', verified: true, status: 'verified', isDirectory: true, rating: 4.6, consultationFee: 600, openingHours: '5:00 PM - 8:00 PM', experience: 13, source: 'docduniya' },
                { name: 'Dr. Amit Kumar Singh', specialization: 'Cardiologist', hospital: 'Heart Care Gorakhpur', city: 'Gorakhpur', phone: '9876555501', verified: true, status: 'verified', isDirectory: true, rating: 4.9, consultationFee: 1000, openingHours: '4:00 PM - 7:00 PM', experience: 22, source: 'medindia' },
                { name: 'Dr. Rachna Singh', specialization: 'Gynecologist', hospital: 'Mother & Child Care Clinic', city: 'Gorakhpur', phone: '9876544401', verified: true, status: 'verified', isDirectory: true, rating: 4.8, consultationFee: 500, openingHours: '10:00 AM - 1:00 PM', experience: 11, source: 'docduniya' },
                { name: 'Dr. Pawan Kumar Gupta', specialization: 'Gastroenterologist', hospital: 'Gut Health Clinic', city: 'Gorakhpur', phone: '9876566601', verified: true, status: 'verified', isDirectory: true, rating: 4.7, consultationFee: 700, openingHours: '3:00 PM - 6:00 PM', experience: 16, source: 'practo' },
                { name: 'Dr. Kavita Gupta', specialization: 'Ophthalmologist', hospital: 'Eye Cure Gorakhpur', city: 'Gorakhpur', phone: '9876588801', verified: true, status: 'verified', isDirectory: true, rating: 4.8, consultationFee: 500, openingHours: '9:00 AM - 1:00 PM', experience: 12, source: 'docduniya' },
                { name: 'Dr. Hemant Jaiswal', specialization: 'Psychiatrist', hospital: 'Mind Wellness Clinic', city: 'Gorakhpur', phone: '9876599901', verified: true, status: 'verified', isDirectory: true, rating: 4.7, consultationFee: 700, openingHours: '5:00 PM - 8:00 PM', experience: 13, source: 'practo' },
                { name: 'Dr. Ritesh Agrawal', specialization: 'Urologist', hospital: 'Nidaan Hospital & Research Centre', hospitalId: 'nidaan-hospital', city: 'Gorakhpur', phone: '9560654321', verified: true, status: 'verified', isDirectory: true, rating: 4.6, consultationFee: 800, openingHours: '10:00 AM - 2:00 PM', experience: 14, source: 'medindia' }
            ];
            for (const d of doctors) {
                await prisma.doctor.create({ data: d });
                report.doctors++;
            }
        }

        // ── RETAILERS ─────────────────────────────────────────
        if (step === "all" || step === "retailers") {
            const retailers = [
                { shopName: 'Swastik Medical Store', address: 'Civil Lines, Gorakhpur, UP 273001', city: 'Gorakhpur', phone: '9161364908', licenseNumber: 'UP/GKP/DL/2024/001', verified: true, isDirectory: true, status: 'verified', rating: 4.9, ratingCount: 220, lat: 26.7632, lng: 83.3726, openingHours: '8:00 AM - 11:00 PM', isOnline: true, priority_score: 100 },
                { shopName: 'Gorakhnath Chemist', address: 'Near Gorakhnath Temple, Taramandal, Gorakhpur', city: 'Gorakhpur', phone: '8877665544', licenseNumber: 'UP/GKP/DL/2024/002', verified: true, isDirectory: true, status: 'verified', rating: 4.7, ratingCount: 180, lat: 26.7606, lng: 83.3732, openingHours: '8:00 AM - 10:00 PM', isOnline: true, priority_score: 90 },
                { shopName: 'Golghar Medicine Square', address: 'Main Market, Golghar, Gorakhpur', city: 'Gorakhpur', phone: '8877665511', licenseNumber: 'UP/GKP/DL/2024/003', verified: true, isDirectory: true, status: 'verified', rating: 4.5, ratingCount: 120, lat: 26.7554, lng: 83.3702, openingHours: '9:00 AM - 9:00 PM', isOnline: true, priority_score: 85 },
                { shopName: 'Ram Pharmacy', address: 'Railway Road, Gorakhpur', city: 'Gorakhpur', phone: '8877001122', licenseNumber: 'UP/GKP/DL/2024/004', verified: true, isDirectory: true, status: 'verified', rating: 4.4, ratingCount: 95, lat: 26.7558, lng: 83.3680, openingHours: '7:00 AM - 10:00 PM', isOnline: false, priority_score: 80 },
                { shopName: 'Arogya Medical Hall', address: 'Basharatpur, Gorakhpur', city: 'Gorakhpur', phone: '8877002233', licenseNumber: 'UP/GKP/DL/2024/005', verified: true, isDirectory: true, status: 'verified', rating: 4.6, ratingCount: 110, lat: 26.7470, lng: 83.3750, openingHours: '8:00 AM - 10:00 PM', isOnline: true, priority_score: 82 },
                { shopName: 'Jan Aushadhi Kendra - Gorakhpur', address: 'Near BRD Medical, Gorakhpur', city: 'Gorakhpur', phone: '8009123456', licenseNumber: 'PM-JAK-GKP-001', verified: true, isDirectory: true, status: 'verified', rating: 4.8, ratingCount: 300, lat: 26.7620, lng: 83.3790, openingHours: '8:00 AM - 8:00 PM', isOnline: false, priority_score: 95 },
                { shopName: 'Medicos Pharmacy', address: 'Mohaddipur, Gorakhpur', city: 'Gorakhpur', phone: '7007123456', licenseNumber: 'UP/GKP/DL/2024/006', verified: true, isDirectory: true, status: 'verified', rating: 4.5, ratingCount: 85, lat: 26.7490, lng: 83.3410, openingHours: '9:00 AM - 10:00 PM', isOnline: true, priority_score: 75 },
                { shopName: 'Life Care Pharmacy', address: 'Golghar, Gorakhpur', city: 'Gorakhpur', phone: '9876512312', licenseNumber: 'UP/GKP/DL/2024/007', verified: true, isDirectory: true, status: 'verified', rating: 4.3, ratingCount: 70, lat: 26.7540, lng: 83.3700, openingHours: '8:30 AM - 9:30 PM', isOnline: true, priority_score: 72 }
            ];
            for (const r of retailers) {
                await prisma.retailer.create({ data: r });
                report.retailers++;
            }
        }

        // ── MEDICINES (6000) ──────────────────────────────────
        if (step === "all" || step === "medicines") {
            const medicines = generateMedicines(6000);
            const batchSize = 100;
            for (let i = 0; i < medicines.length; i += batchSize) {
                const batch = medicines.slice(i, i + batchSize);
                await prisma.product.createMany({ data: batch, skipDuplicates: true });
                report.medicines += batch.length;
            }
        }

        return NextResponse.json({
            success: true,
            message: "🎉 Full restoration complete!",
            restored: report
        });

    } catch (error) {
        console.error("Restore Error:", error);
        return NextResponse.json({
            success: false,
            error: error.message,
            partial: report
        }, { status: 500 });
    }
}
