const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Labs and Ambulances in Gorakhpur...');

  // 1. Seed Labs
  const labs = [
    {
      name: "Pathkind Labs - Gorakhpur",
      address: "Golghar, Gorakhpur, UP",
      phone: "9876543210",
      city: "Gorakhpur",
      verified: true,
      isDirectory: true,
      rating: 4.8,
      ratingCount: 120,
      status: "verified",
      photoUrl: "https://images.unsplash.com/photo-1581594658553-359ec99d6fcb?auto=format&fit=crop&q=80&w=800",
      openingHours: "8:00 AM - 8:00 PM"
    },
    {
      name: "Dr. Lal PathLabs - Civil Lines",
      address: "Civil Lines, Near Town Hall, Gorakhpur",
      phone: "9988776655",
      city: "Gorakhpur",
      verified: true,
      isDirectory: true,
      rating: 4.7,
      ratingCount: 250,
      status: "verified",
      photoUrl: "https://images.unsplash.com/photo-1579154235602-282e0f42ee8a?auto=format&fit=crop&q=80&w=800",
      openingHours: "7:00 AM - 9:00 PM"
    },
    {
      name: "Swastik Medicare Diagnostics",
      address: "Medical College Road, Gorakhpur",
      phone: "9000000000",
      city: "Gorakhpur",
      verified: true,
      isDirectory: true,
      rating: 4.9,
      ratingCount: 45,
      status: "verified",
      photoUrl: "https://images.unsplash.com/photo-1579165138304-b973a0a056d9?auto=format&fit=crop&q=80&w=800",
      openingHours: "24/7"
    }
  ];

  for (const lab of labs) {
    await prisma.lab.upsert({
      where: { id: lab.id || 'placeholder' }, // This won't match, creating new
      update: {},
      create: lab
    }).catch(e => console.log(`Error seeding lab ${lab.name}:`, e.message));
  }

  // 2. Seed Ambulances
  const ambulances = [
    {
      driverName: "Swastik Emergency - ICU Van",
      vehicleType: "ICU",
      city: "Gorakhpur",
      phone: "9111111111",
      verified: true,
      isDirectory: true,
      isAvailable: true,
      rating: 5.0,
      ratingCount: 15,
      status: "verified",
      pricePerKm: 25.0,
      photoUrl: "https://images.unsplash.com/photo-1587748803976-68572bd09299?auto=format&fit=crop&q=80&w=800"
    },
    {
      driverName: "City Care Ambulance Service",
      vehicleType: "Advance",
      city: "Gorakhpur",
      phone: "9222222222",
      verified: true,
      isDirectory: true,
      isAvailable: true,
      rating: 4.6,
      ratingCount: 88,
      status: "verified",
      pricePerKm: 18.0,
      photoUrl: "https://images.unsplash.com/photo-1516593498872-56459345712e?auto=format&fit=crop&q=80&w=800"
    },
    {
      driverName: "Gorakhpur Life Support",
      vehicleType: "Basic",
      city: "Gorakhpur",
      phone: "9333333333",
      verified: true,
      isDirectory: true,
      isAvailable: true,
      rating: 4.8,
      ratingCount: 102,
      status: "verified",
      pricePerKm: 12.0,
      photoUrl: "https://images.unsplash.com/photo-1551601651-2a8555f1a136?auto=format&fit=crop&q=80&w=800"
    }
  ];

  for (const amb of ambulances) {
    await prisma.ambulance.create({
      data: amb
    }).catch(e => console.log(`Error seeding ambulance ${amb.driverName}:`, e.message));
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
