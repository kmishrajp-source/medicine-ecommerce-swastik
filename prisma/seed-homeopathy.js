const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Homeopathic Medicines...");
  
  const homeopathyMedicines = [
    {
      name: "SBL Arnica Montana Dilution 30 CH",
      description: "Effective homeopathic remedy for bruises, muscle soreness, and joint pains.",
      price: 95.0,
      mrp: 100.0,
      discount: 5.0,
      image: "https://www.netmeds.com/images/product-v1/600x600/834376/sbl_arnica_montana_dilution_30_ch_30_ml_0.jpg",
      category: "Homeopathy",
      brand: "SBL",
      requiresPrescription: false,
      isOTC: true
    },
    {
      name: "Dr. Reckeweg R89 Hair Care Drop",
      description: "Homeopathic drops for hair fall, premature graying, and baldness.",
      price: 270.0,
      mrp: 300.0,
      discount: 10.0,
      image: "https://www.netmeds.com/images/product-v1/600x600/893649/dr_reckeweg_r89_hair_care_drop_30_ml_0.jpg",
      category: "Homeopathy",
      brand: "Dr. Reckeweg",
      requiresPrescription: false,
      isOTC: true
    },
    {
      name: "SBL Nux Vomica Dilution 200 CH",
      description: "Helps relieve digestive issues, acidity, and hangover symptoms.",
      price: 90.0,
      mrp: 100.0,
      discount: 10.0,
      image: "https://www.netmeds.com/images/product-v1/600x600/835467/sbl_nux_vomica_dilution_200_ch_30_ml_0_1.jpg",
      category: "Homeopathy",
      brand: "SBL",
      requiresPrescription: false,
      isOTC: true
    },
    {
      name: "Schwabe Alpha-Coff Syrup",
      description: "Homeopathic cough syrup for soothing dry and spasmodic cough.",
      price: 115.0,
      mrp: 125.0,
      discount: 8.0,
      image: "https://www.netmeds.com/images/product-v1/600x600/825414/schwabe_alpha_coff_syrup_100_ml_0_1.jpg",
      category: "Homeopathy",
      brand: "Schwabe",
      requiresPrescription: false,
      isOTC: true
    },
    {
      name: "SBL Rhus Tox Dilution 30 CH",
      description: "Relief from arthritis, rheumatic pains, and skin eruptions.",
      price: 90.0,
      mrp: 100.0,
      discount: 10.0,
      image: "https://www.netmeds.com/images/product-v1/600x600/835824/sbl_rhus_tox_dilution_30_ch_30_ml_0_1.jpg",
      category: "Homeopathy",
      brand: "SBL",
      requiresPrescription: false,
      isOTC: true
    }
  ];

  for (const med of homeopathyMedicines) {
    const existing = await prisma.product.findFirst({ where: { name: med.name } });
    if (!existing) {
      await prisma.product.create({ data: med });
      console.log(`+ Created Product: ${med.name}`);
    }
  }

  console.log("\nSeeding Homeopathic Doctors...");

  const homeopathDoctors = [
    {
      name: "Dr. Ramesh Sharma",
      specialization: "Homeopath",
      city: "Gorakhpur",
      experience: 15,
      hospital: "Sharma Homeo Clinic",
      location: "Golghar, Gorakhpur",
      verified: true,
      isDirectory: true,
      consultationFee: 300,
      openingHours: "10:00 AM - 07:00 PM"
    },
    {
      name: "Dr. Anjali Gupta",
      specialization: "Homeopath Specialist",
      city: "Gorakhpur",
      experience: 8,
      hospital: "Gupta Homeopathy Centre",
      location: "Medical College Road, Gorakhpur",
      verified: true,
      isDirectory: true,
      consultationFee: 250,
      openingHours: "09:00 AM - 05:00 PM"
    },
    {
      name: "Dr. Sunil Verma",
      specialization: "Classical Homeopath",
      city: "Gorakhpur",
      experience: 22,
      hospital: "Verma Healing Care",
      location: "Betiahata, Gorakhpur",
      verified: true,
      isDirectory: true,
      consultationFee: 400,
      openingHours: "11:00 AM - 08:00 PM"
    }
  ];

  for (const doc of homeopathDoctors) {
    const existing = await prisma.doctor.findFirst({ where: { name: doc.name, specialization: doc.specialization } });
    if (!existing) {
      await prisma.doctor.create({ data: doc });
      console.log(`+ Created Doctor: ${doc.name}`);
    }
  }

  console.log("\nHomeopathy Seeding Complete!");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
