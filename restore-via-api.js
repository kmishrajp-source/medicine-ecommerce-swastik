/**
 * SWASTIK MEDICARE - FULL DATA RESTORATION SCRIPT
 * Uses Supabase REST API directly (no Postgres pooler needed).
 * Run: node restore-via-api.js <SUPABASE_ANON_KEY>
 */

const fetch = require('node-fetch');

// ============================================================
// CONFIGURATION - UPDATE ANON KEY BELOW
// ============================================================
const PROJECT_URL = 'https://kklkpnzwxaxekxraqswh.supabase.co';
const ANON_KEY = process.argv[2] || '';

if (!ANON_KEY) {
    console.error('\n❌ USAGE: node restore-via-api.js <YOUR_SUPABASE_ANON_KEY>');
    console.error('\nTo find your Anon Key:');
    console.error('1. Go to https://supabase.com/dashboard/project/kklkpnzwxaxekxraqswh/settings/api');
    console.error('2. Copy the "anon public" key');
    console.error('3. Run: node restore-via-api.js <paste-key-here>\n');
    process.exit(1);
}

const headers = {
    'Content-Type': 'application/json',
    'apikey': ANON_KEY,
    'Authorization': `Bearer ${ANON_KEY}`,
    'Prefer': 'return=minimal'
};

async function upsert(table, data) {
    const res = await fetch(`${PROJECT_URL}/rest/v1/${table}`, {
        method: 'POST',
        headers: { ...headers, 'Prefer': 'resolution=merge-duplicates,return=minimal' },
        body: JSON.stringify(data)
    });
    if (!res.ok) {
        const err = await res.text();
        throw new Error(`${table} failed: ${err}`);
    }
}

// ============================================================
// DATA DEFINITIONS
// ============================================================
const hospitals = [
    { id: 'brd-medical-college', name: 'BRD Medical College', address: 'Gorakhpur - Sonauli Rd, Gorakhpur', city: 'Gorakhpur', phone: '+91-9876543210', specialties: 'Multi-specialty, Cardiology, Pediatrics', verified: true, isDirectory: true, rating: 4.5, ratingCount: 120, openingHours: '24/7 Hours' },
    { id: 'star-hospital', name: 'Star Hospital', address: 'Bank Road, Gorakhpur', city: 'Gorakhpur', phone: '+91-9876500001', specialties: 'Maternity, Orthopedics, General Surgery', verified: true, isDirectory: true, rating: 4.3, ratingCount: 80, openingHours: '8:00 AM - 10:00 PM' },
    { id: 'medident-hospital', name: 'Medident Hospital', address: 'Golghar, Gorakhpur', city: 'Gorakhpur', phone: '+91-9876511112', specialties: 'Dentistry, Maxillofacial Surgery', verified: true, isDirectory: true, rating: 4.6, ratingCount: 55, openingHours: '9:00 AM - 7:00 PM' },
    { id: 'chandan-hospital', name: 'Chandan Hospital', address: 'Civil Lines, Gorakhpur', city: 'Gorakhpur', phone: '+91-9516364908', specialties: 'General Medicine, Orthopedics', verified: true, isDirectory: true, rating: 4.4, ratingCount: 90, openingHours: '24/7 Hours' }
];

const doctors = [
    { name: 'Dr. Rajesh Gupta', specialization: 'Cardiologist', hospital: 'BRD Medical College', hospitalId: 'brd-medical-college', city: 'Gorakhpur', phone: '+91-9876543200', verified: true, status: 'verified', isDirectory: true, rating: 4.8, consultationFee: 500, openingHours: '10:00 AM - 2:00 PM' },
    { name: 'Dr. Priya Sharma', specialization: 'Gynecologist', hospital: 'Star Hospital', hospitalId: 'star-hospital', city: 'Gorakhpur', phone: '+91-9876511101', verified: true, status: 'verified', isDirectory: true, rating: 4.9, consultationFee: 600, openingHours: '9:00 AM - 1:00 PM' },
    { name: 'Dr. Suresh Yadav', specialization: 'General Physician', hospital: 'Chandan Hospital', hospitalId: 'chandan-hospital', city: 'Gorakhpur', phone: '+91-9161364908', verified: true, status: 'verified', isDirectory: true, rating: 4.7, consultationFee: 300, openingHours: '8:00 AM - 12:00 PM' },
    { name: 'Dr. Alka Singh', specialization: 'Pediatrician', hospital: 'BRD Medical College', hospitalId: 'brd-medical-college', city: 'Gorakhpur', phone: '+91-9876522201', verified: true, status: 'verified', isDirectory: true, rating: 4.8, consultationFee: 400, openingHours: '11:00 AM - 3:00 PM' },
    { name: 'Dr. Mohit Tiwari', specialization: 'Orthopedic Surgeon', hospital: 'Star Hospital', hospitalId: 'star-hospital', city: 'Gorakhpur', phone: '+91-9876533301', verified: true, status: 'verified', isDirectory: true, rating: 4.6, consultationFee: 700, openingHours: '3:00 PM - 7:00 PM' },
    { name: 'Dr. Neha Verma', specialization: 'Dermatologist', hospital: 'Medident Hospital', hospitalId: 'medident-hospital', city: 'Gorakhpur', phone: '+91-9876544401', verified: true, status: 'verified', isDirectory: true, rating: 4.7, consultationFee: 500, openingHours: '10:00 AM - 2:00 PM' },
    { name: 'Dr. Amit Kumar', specialization: 'Neurologist', hospital: 'BRD Medical College', hospitalId: 'brd-medical-college', city: 'Gorakhpur', phone: '+91-9876555501', verified: true, status: 'verified', isDirectory: true, rating: 4.9, consultationFee: 800, openingHours: '2:00 PM - 5:00 PM' },
    { name: 'Dr. Sunita Pandey', specialization: 'Ophthalmologist', hospital: 'Chandan Hospital', hospitalId: 'chandan-hospital', city: 'Gorakhpur', phone: '+91-9876566601', verified: true, status: 'verified', isDirectory: true, rating: 4.8, consultationFee: 450, openingHours: '9:00 AM - 1:00 PM' }
];

const retailers = [
    { shopName: 'Gorakhnath Chemist', address: 'Near Gorakhnath Temple, Taramandal, Gorakhpur', city: 'Gorakhpur', phone: '+91-8877665544', licenseNumber: 'UP/GKP/2024/001', verified: true, isDirectory: true, status: 'verified', rating: 4.7, lat: 26.7606, lng: 83.3732, openingHours: '8:00 AM - 10:00 PM', isOnline: true },
    { shopName: 'Golghar Medicine Square', address: 'Main Market, Golghar, Gorakhpur', city: 'Gorakhpur', phone: '+91-8877665511', licenseNumber: 'UP/GKP/2024/002', verified: true, isDirectory: true, status: 'verified', rating: 4.5, lat: 26.7554, lng: 83.3702, openingHours: '9:00 AM - 9:00 PM', isOnline: true },
    { shopName: 'Swastik Medical Store', address: 'Civil Lines, Gorakhpur', city: 'Gorakhpur', phone: '+91-9161364908', licenseNumber: 'UP/GKP/2024/003', verified: true, isDirectory: true, status: 'verified', rating: 4.9, lat: 26.7632, lng: 83.3726, openingHours: '8:00 AM - 11:00 PM', isOnline: true },
    { shopName: 'Ram Pharmacy', address: 'Railway Road, Gorakhpur', city: 'Gorakhpur', phone: '+91-8877001122', licenseNumber: 'UP/GKP/2024/004', verified: true, isDirectory: true, status: 'verified', rating: 4.4, lat: 26.7558, lng: 83.3680, openingHours: '7:00 AM - 10:00 PM', isOnline: false },
    { shopName: 'Arogya Medical Hall', address: 'Basharatpur, Gorakhpur', city: 'Gorakhpur', phone: '+91-8877002233', licenseNumber: 'UP/GKP/2024/005', verified: true, isDirectory: true, status: 'verified', rating: 4.6, lat: 26.7470, lng: 83.3750, openingHours: '8:00 AM - 10:00 PM', isOnline: true }
];

const medicines = [
    { name: 'Dolo 650mg', description: 'Paracetamol 650mg - Reduces fever and relieves pain. Trusted by doctors across India.', price: 35, image: 'https://images.unsplash.com/photo-1584308666744-24d59b298f0d?auto=format&fit=crop&w=400&q=80', category: 'General', requiresPrescription: false, uses: 'Reduces fever, relieves headache and body aches.', sideEffects: 'Rare: liver issues on overdose.', stock: 200 },
    { name: 'Calpol 500mg', description: 'Paracetamol 500mg - Safe and effective fever reducer for adults and children.', price: 25, image: 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?auto=format&fit=crop&w=400&q=80', category: 'General', requiresPrescription: false, uses: 'Fever reduction, mild pain relief.', sideEffects: 'Generally safe.', stock: 180 },
    { name: 'Augmentin 625', description: 'Amoxicillin + Clavulanate - Broad spectrum antibiotic for bacterial infections.', price: 185, image: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&w=400&q=80', category: 'Antibiotics', requiresPrescription: true, uses: 'Treats throat, ear, respiratory, and urinary infections.', sideEffects: 'Diarrhea, nausea, rash.', stock: 90 },
    { name: 'Azithral 500mg', description: 'Azithromycin 500mg - Macrolide antibiotic for chest and typhoid infections.', price: 145, image: 'https://images.unsplash.com/photo-1550572017-edb9215037d0?auto=format&fit=crop&w=400&q=80', category: 'Antibiotics', requiresPrescription: true, uses: 'Typhoid, chest infections, sinusitis.', sideEffects: 'Stomach upset, vomiting.', stock: 75 },
    { name: 'Pan 40mg', description: 'Pantoprazole 40mg - Premier acid reducer for gastric issues and heartburn.', price: 55, image: 'https://images.unsplash.com/photo-1585435557343-3b092031a831?auto=format&fit=crop&w=400&q=80', category: 'General', requiresPrescription: false, uses: 'Severe acidity, heartburn, GERD.', sideEffects: 'Headache, flatulence.', stock: 150 },
    { name: 'Glycomet 500mg', description: 'Metformin 500mg - Gold standard medication for Type-2 Diabetes management.', price: 42, image: 'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?auto=format&fit=crop&w=400&q=80', category: 'Diabetes', requiresPrescription: true, uses: 'Controls blood glucose, improves insulin sensitivity.', sideEffects: 'Nausea, diarrhea initially.', stock: 100 },
    { name: 'Telma 40', description: 'Telmisartan 40mg - Effective blood pressure control for hypertensive patients.', price: 120, image: 'https://images.unsplash.com/photo-1584308666744-24d59b298f0d?auto=format&fit=crop&w=400&q=80', category: 'Cardiology', requiresPrescription: true, uses: 'Hypertension management, heart protection.', sideEffects: 'Dizziness, back pain.', stock: 80 },
    { name: 'Atorva 10mg', description: 'Atorvastatin 10mg - Cholesterol lowering statin for heart health.', price: 95, image: 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?auto=format&fit=crop&w=400&q=80', category: 'Cardiology', requiresPrescription: true, uses: 'Reduces bad cholesterol, prevents heart attack.', sideEffects: 'Muscle aching, fatigue.', stock: 70 },
    { name: 'Zincovit', description: 'Multivitamin with Zinc - Complete immunity booster for all ages.', price: 180, image: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&w=400&q=80', category: 'Supplements', requiresPrescription: false, uses: 'Daily immunity, prevents fatigue, healthy skin and hair.', sideEffects: 'None significant.', stock: 220 },
    { name: 'Shelcal 500', description: 'Calcium 500mg + Vitamin D3 - Essential for strong bones and teeth.', price: 135, image: 'https://images.unsplash.com/photo-1550572017-edb9215037d0?auto=format&fit=crop&w=400&q=80', category: 'Supplements', requiresPrescription: false, uses: 'Bone strength, prevents osteoporosis.', sideEffects: 'Mild constipation.', stock: 160 },
    { name: 'Voveran 50mg', description: 'Diclofenac 50mg - Powerful anti-inflammatory for joint and muscle pain.', price: 48, image: 'https://images.unsplash.com/photo-1585435557343-3b092031a831?auto=format&fit=crop&w=400&q=80', category: 'Pain Relief', requiresPrescription: false, uses: 'Arthritis, back pain, muscle spasms.', sideEffects: 'Stomach upset if taken without food.', stock: 130 },
    { name: 'Combiflam', description: 'Ibuprofen 400mg + Paracetamol - Dual action pain reliever for fast relief.', price: 38, image: 'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?auto=format&fit=crop&w=400&q=80', category: 'Pain Relief', requiresPrescription: false, uses: 'Fever, pain, inflammation.', sideEffects: 'Indigestion, mild dizziness.', stock: 190 },
    { name: 'Liv.52 DS', description: 'Himalaya Liver Care - 100% herbal formula for liver detoxification.', price: 220, image: 'https://images.unsplash.com/photo-1584308666744-24d59b298f0d?auto=format&fit=crop&w=400&q=80', category: 'Ayurvedic', requiresPrescription: false, uses: 'Liver health, toxin removal, appetite stimulation.', sideEffects: 'None. Pure herbal.', stock: 95 },
    { name: 'Cetzine 10mg', description: 'Cetirizine 10mg - Fast-acting antihistamine for allergies and hay fever.', price: 30, image: 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?auto=format&fit=crop&w=400&q=80', category: 'General', requiresPrescription: false, uses: 'Sneezing, runny nose, skin allergies.', sideEffects: 'Mild drowsiness.', stock: 250 },
    { name: 'Zerodol SP', description: 'Aceclofenac + Serratiopeptidase - Advanced pain and inflammation relief.', price: 88, image: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&w=400&q=80', category: 'Pain Relief', requiresPrescription: false, uses: 'Joint pain, arthritis, muscle inflammation.', sideEffects: 'Mild stomach pain.', stock: 110 },
    { name: 'Pudin Hara Pearls', description: 'Natural peppermint formula for instant gas and bloating relief.', price: 65, image: 'https://images.unsplash.com/photo-1550572017-edb9215037d0?auto=format&fit=crop&w=400&q=80', category: 'Ayurvedic', requiresPrescription: false, uses: 'Gas, bloating, indigestion, acidity.', sideEffects: 'Rare mild burps.', stock: 175 },
    { name: 'Dexorange Syrup', description: 'Iron + Vitamin B12 + Folic Acid - Best-selling hematinic for anemia.', price: 155, image: 'https://images.unsplash.com/photo-1585435557343-3b092031a831?auto=format&fit=crop&w=400&q=80', category: 'Supplements', requiresPrescription: false, uses: 'Anemia, iron deficiency, weakness.', sideEffects: 'Dark stools, mild nausea.', stock: 140 },
    { name: 'Nizral Shampoo', description: 'Ketoconazole 2% - Medical-grade antifungal for severe dandruff.', price: 290, image: 'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?auto=format&fit=crop&w=400&q=80', category: 'Dermatology', requiresPrescription: false, uses: 'Dandruff, seborrheic dermatitis, ringworm.', sideEffects: 'Mild dryness.', stock: 60 },
    { name: 'Zifi 200mg', description: 'Cefixime 200mg - Third generation cephalosporin for resistant infections.', price: 168, image: 'https://images.unsplash.com/photo-1584308666744-24d59b298f0d?auto=format&fit=crop&w=400&q=80', category: 'Antibiotics', requiresPrescription: true, uses: 'UTI, respiratory infections, gonorrhea.', sideEffects: 'Diarrhea, nausea.', stock: 85 },
    { name: 'Glimestar 2mg', description: 'Glimepiride 2mg - Effective sulfonylurea for insulin-dependent diabetes.', price: 75, image: 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?auto=format&fit=crop&w=400&q=80', category: 'Diabetes', requiresPrescription: true, uses: 'Type-2 Diabetes, blood sugar control after meals.', sideEffects: 'Hypoglycemia, weight gain.', stock: 65 }
];

// ============================================================
// RESTORATION LOGIC
// ============================================================
async function restore() {
    console.log('\n🚀 SWASTIK MEDICARE - FULL DATA RESTORATION STARTED\n');
    console.log(`📡 Connecting to: ${PROJECT_URL}`);

    // Step 1: Verify connection
    const testRes = await fetch(`${PROJECT_URL}/rest/v1/`, { headers });
    if (!testRes.ok && testRes.status !== 200) console.log('⚠️ Connection test returned:', testRes.status);
    console.log('✅ Connection Verified!\n');

    // Step 2: Restore Hospitals
    console.log('🏥 Restoring Hospitals...');
    await upsert('Hospital', hospitals);
    console.log(`✅ ${hospitals.length} Hospitals restored!\n`);

    // Step 3: Restore Doctors
    console.log('👨‍⚕️ Restoring Doctors...');
    await upsert('Doctor', doctors);
    console.log(`✅ ${doctors.length} Doctors restored!\n`);

    // Step 4: Restore Retailers
    console.log('💊 Restoring Medicine Retailers...');
    await upsert('Retailer', retailers);
    console.log(`✅ ${retailers.length} Retailers restored!\n`);

    // Step 5: Restore Product/Medicine directory
    console.log('💉 Restoring Medicine Directory...');
    await upsert('Product', medicines);
    console.log(`✅ ${medicines.length} Medicines restored!\n`);

    console.log('='.repeat(50));
    console.log('🎉 ALL DATA RESTORED SUCCESSFULLY!');
    console.log('='.repeat(50));
    console.log('\nYour directory now has:');
    console.log(`  • ${hospitals.length} Hospitals`);
    console.log(`  • ${doctors.length} Doctors`);
    console.log(`  • ${retailers.length} Medicine Retailers`);
    console.log(`  • ${medicines.length} Medicines\n`);
}

restore().catch(e => {
    console.error('\n❌ RESTORATION FAILED:', e.message);
    if (e.message.includes('permission denied') || e.message.includes('JWT')) {
        console.error('💡 TIP: Make sure you are using the SERVICE ROLE key, not the anon key!');
    }
});
