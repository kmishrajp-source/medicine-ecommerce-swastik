const { Client } = require('pg');
require('dotenv').config();

const categories = [
  { slug: 'pharmacies-and-medicine-services', name: 'Pharmacies & Medicine Services', serviceType: 'pharmacy', icon: 'fa-solid fa-pills' },
  { slug: 'doctors-and-clinics', name: 'Doctors & Clinics', serviceType: 'doctor_consultation', icon: 'fa-solid fa-user-doctor' },
  { slug: 'diagnostic-laboratories', name: 'Diagnostic Laboratories', serviceType: 'lab_diagnostic', icon: 'fa-solid fa-flask-vial' },
  { slug: 'hospitals-and-nursing-homes', name: 'Hospitals & Nursing Homes', serviceType: 'hospital', icon: 'fa-solid fa-hospital' },
  { slug: 'ambulance-and-medical-transport', name: 'Ambulance & Medical Transport', serviceType: 'ambulance', icon: 'fa-solid fa-truck-medical' },
  { slug: 'home-healthcare-providers', name: 'Home Healthcare Providers', serviceType: 'home_healthcare', icon: 'fa-solid fa-house-medical' },
  { slug: 'ayurveda-services', name: 'Ayurveda Services', serviceType: 'ayurveda', icon: 'fa-solid fa-leaf' },
  { slug: 'homeopathy-services', name: 'Homeopathy Services', serviceType: 'homeopathy', icon: 'fa-solid fa-mortar-pestle' },
  { slug: 'medical-equipment-and-supplies', name: 'Medical Equipment & Supplies', serviceType: 'medical_equipment', icon: 'fa-solid fa-stethoscope' },
  { slug: 'healthcare-staffing', name: 'Healthcare Staffing', serviceType: 'staffing', icon: 'fa-solid fa-user-nurse' },
  { slug: 'corporate-healthcare', name: 'Corporate Healthcare', serviceType: 'corporate_health', icon: 'fa-solid fa-building-shield' },
  { slug: 'healthcare-it-and-software', name: 'Healthcare IT & Software', serviceType: 'health_it', icon: 'fa-solid fa-laptop-medical' },
  { slug: 'other-healthcare-services', name: 'Other Healthcare Services', serviceType: 'other', icon: 'fa-solid fa-briefcase-medical' }
];

async function seed() {
  const client = new Client({
    connectionString: process.env.DIRECT_URL,
    ssl: { rejectUnauthorized: false }
  });
  await client.connect();

  for (let i = 0; i < categories.length; i++) {
    const c = categories[i];
    const id = `cat-${c.slug}`;
    await client.query(`
      INSERT INTO "MarketplaceCategory" ("id", "slug", "name", "serviceType", "icon", "sortOrder", "isActive")
      VALUES ($1, $2, $3, $4, $5, $6, true)
      ON CONFLICT ("slug") DO UPDATE 
      SET "name" = EXCLUDED."name", "serviceType" = EXCLUDED."serviceType", "icon" = EXCLUDED."icon";
    `, [id, c.slug, c.name, c.serviceType, c.icon, i + 1]);
  }

  console.log(`Successfully seeded ${categories.length} Marketplace categories!`);
  await client.end();
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});

