import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req) {
  try {
    console.log('Seeding Gorakhpur Hospital & Retailer Data via API...');

    // 1. Seed Hospitals
    const hospitals = [
      {
        name: "AIIMS Gorakhpur",
        address: "Kunaaghat, Gorakhpur, Uttar Pradesh 273008",
        city: "Gorakhpur",
        phone: "0551-2207700",
        specialties: "Multi-specialty, Cardiology, Neurology, Oncology, Pediatrics",
        isDirectory: true,
        verified: true,
        rating: 4.8,
        ratingCount: 1250,
        photoUrl: "https://images.unsplash.com/photo-1587350859728-117699f43611?q=80&w=800&auto=format&fit=crop",
        openingHours: "24/7 Hours"
      },
      {
        name: "BRD Medical College",
        address: "Medical Road, Gorakhpur, Uttar Pradesh 273013",
        city: "Gorakhpur",
        phone: "0551-2501736",
        specialties: "General Medicine, Surgery, Orthopedics, Gynecology",
        isDirectory: true,
        verified: true,
        rating: 4.2,
        ratingCount: 3400,
        photoUrl: "https://images.unsplash.com/photo-1586773860418-d319a398557b?q=80&w=800&auto=format&fit=crop",
        openingHours: "24/7 Hours"
      },
      {
        name: "Regency Hospital Gorakhpur",
        address: "Near Medical College Road, Moglaha, Gorakhpur",
        city: "Gorakhpur",
        phone: "+91-9228052805",
        specialties: "Critical Care, Nephrology, Urology, Gastroenterology",
        isDirectory: true,
        verified: true,
        rating: 4.6,
        ratingCount: 890,
        photoUrl: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=800&auto=format&fit=crop",
        openingHours: "24/7 Hours"
      },
      {
        name: "Rana Hospital (IVF & Neurology)",
        address: "7, Park Road, Gorakhpur",
        city: "Gorakhpur",
        phone: "0551-2201234",
        specialties: "IVF, Neurology, Neurosurgery, Orthopedics",
        isDirectory: true,
        verified: true,
        rating: 4.7,
        ratingCount: 750,
        photoUrl: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=800&auto=format&fit=crop",
        openingHours: "9:00 AM - 9:00 PM"
      },
      {
        name: "Synergy Super Specialty Hospital",
        address: "Mahadev Jharkhand, Near Rail Museum, Gorakhpur",
        city: "Gorakhpur",
        phone: "0551-2205566",
        specialties: "Oncology, Cancer Care, Bone Marrow Transplant",
        isDirectory: true,
        verified: true,
        rating: 4.5,
        ratingCount: 420,
        photoUrl: "https://images.unsplash.com/photo-1551076805-e1869033e561?q=80&w=800&auto=format&fit=crop",
        openingHours: "24/7 Hours"
      }
    ];

    for (const h of hospitals) {
      await prisma.hospital.upsert({
        where: { id: h.name.replace(/\s+/g, '-').toLowerCase() },
        update: h,
        create: {
          id: h.name.replace(/\s+/g, '-').toLowerCase(),
          ...h
        }
      });
    }

    // 2. Seed Retailers (Medical Stores)
    const retailers = [
      {
        shopName: "Sahi Medical Store",
        address: "Town Hall, Gorakhpur, UP",
        phone: "91-9876543210",
        city: "Gorakhpur",
        licenseNumber: "UP-GKP-12345",
        isDirectory: true,
        verified: true,
        rating: 4.5,
        ratingCount: 120,
        openingHours: "8:00 AM - 11:00 PM",
        photoUrl: "https://images.unsplash.com/photo-1631549916768-4119b255f012?q=80&w=800&auto=format&fit=crop"
      },
      {
        shopName: "Gorakhnath Pharmacy",
        address: "Near Gorakhnath Temple, Gorakhpur",
        phone: "91-9888877777",
        city: "Gorakhpur",
        licenseNumber: "UP-GKP-56789",
        isDirectory: true,
        verified: true,
        rating: 4.8,
        ratingCount: 340,
        openingHours: "7:00 AM - 10:00 PM",
        photoUrl: "https://images.unsplash.com/photo-1587854692152-cbe660dbbb88?q=80&w=800&auto=format&fit=crop"
      },
      {
        shopName: "Life Care Medicos",
        address: "Golghar, Gorakhpur",
        phone: "91-9555544444",
        city: "Gorakhpur",
        licenseNumber: "UP-GKP-99999",
        isDirectory: true,
        verified: true,
        rating: 4.3,
        ratingCount: 88,
        openingHours: "24/7 Hours",
        photoUrl: "https://images.unsplash.com/photo-1586015555751-63bb77f4322a?q=80&w=800&auto=format&fit=crop"
      }
    ];

    for (const r of retailers) {
      await prisma.retailer.upsert({
        where: { id: r.shopName.replace(/\s+/g, '-').toLowerCase() },
        update: r,
        create: {
          id: r.shopName.replace(/\s+/g, '-').toLowerCase(),
          ...r
        }
      });
    }

    return NextResponse.json({ success: true, message: "Gorakhpur data seeded successfully!" });
  } catch (error) {
    console.error("Seeding failed:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
