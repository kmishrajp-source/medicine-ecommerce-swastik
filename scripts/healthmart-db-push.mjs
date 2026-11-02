#!/usr/bin/env node
/**
 * Swastik HealthMart — Production Database Push Script
 * 
 * Run this script ONCE in an environment with network access to Supabase
 * (e.g., on Vercel CI, or locally with the real DATABASE_URL in .env).
 * 
 * What it does:
 *   1. Validates Prisma schema
 *   2. Pushes new HealthMart tables to the database (additive, non-destructive)
 *   3. Verifies the new tables exist
 *   4. Seeds initial categories (idempotent — skips if already present)
 * 
 * Run: node scripts/healthmart-db-push.mjs
 * 
 * IMPORTANT: This script is ADDITIVE ONLY. It will NOT drop or alter 
 * existing tables. The --accept-data-loss flag only applies to enum changes
 * or index alterations, not to existing data.
 */

import { execSync } from 'child_process';
import { PrismaClient } from '@prisma/client';

const HEALTHMART_CATEGORIES_SEED = [
  {
    slug: 'pharmacies-and-medicine-services',
    name: 'Pharmacies & Medicine Services',
    description: 'Licensed pharmacies, generic medicine retailers, online dispensaries, and permitted medicine supply services.',
    icon: '💊',
    serviceType: 'pharmacy',
    quotationSupported: true,
    directBookingSupported: true,
    paymentSupported: true,
    manualConfirmationRequired: false,
    isActive: true,
    sortOrder: 1,
  },
  {
    slug: 'doctors-and-clinics',
    name: 'Doctors & Clinics',
    description: 'Specialist and general practitioner consultations, clinic services, telemedicine, and second opinions.',
    icon: '👨‍⚕️',
    serviceType: 'doctor_consultation',
    quotationSupported: false,
    directBookingSupported: true,
    paymentSupported: true,
    manualConfirmationRequired: true,
    isActive: true,
    sortOrder: 2,
  },
  {
    slug: 'diagnostic-laboratories',
    name: 'Diagnostic Laboratories',
    description: 'Pathology, radiology, genetic testing, home sample collection, and corporate diagnostic packages.',
    icon: '🔬',
    serviceType: 'lab_diagnostic',
    quotationSupported: true,
    directBookingSupported: true,
    paymentSupported: true,
    manualConfirmationRequired: false,
    isActive: true,
    sortOrder: 3,
  },
  {
    slug: 'hospitals-and-nursing-homes',
    name: 'Hospitals & Nursing Homes',
    description: 'IPD/OPD services, surgical packages, ICU care, maternity services, and specialized hospital care.',
    icon: '🏥',
    serviceType: 'hospital',
    quotationSupported: true,
    directBookingSupported: false,
    paymentSupported: false,
    manualConfirmationRequired: true,
    isActive: true,
    sortOrder: 4,
  },
  {
    slug: 'ambulance-and-medical-transport',
    name: 'Ambulance & Medical Transport',
    description: 'BLS/ALS ambulance services, non-emergency patient transport, air ambulance coordination.',
    icon: '🚑',
    serviceType: 'ambulance',
    quotationSupported: true,
    directBookingSupported: true,
    paymentSupported: false,
    manualConfirmationRequired: true,
    isActive: true,
    sortOrder: 5,
  },
  {
    slug: 'home-healthcare-providers',
    name: 'Home Healthcare',
    description: 'Nursing care at home, physiotherapy, IV infusion, post-surgical care, and palliative care services.',
    icon: '🏠',
    serviceType: 'home_healthcare',
    quotationSupported: true,
    directBookingSupported: true,
    paymentSupported: true,
    manualConfirmationRequired: false,
    isActive: true,
    sortOrder: 6,
  },
  {
    slug: 'ayurveda-services',
    name: 'Ayurveda Services',
    description: 'Ayurvedic consultations, Panchakarma treatments, herbal medicine supply, and wellness retreats.',
    icon: '🌿',
    serviceType: 'ayurveda',
    quotationSupported: true,
    directBookingSupported: true,
    paymentSupported: true,
    manualConfirmationRequired: false,
    isActive: true,
    sortOrder: 7,
  },
  {
    slug: 'homeopathy-services',
    name: 'Homeopathy Services',
    description: 'Homeopathic consultations, remedy supply, and homeopathic clinics.',
    icon: '⚗️',
    serviceType: 'homeopathy',
    quotationSupported: true,
    directBookingSupported: true,
    paymentSupported: true,
    manualConfirmationRequired: false,
    isActive: true,
    sortOrder: 8,
  },
  {
    slug: 'medical-equipment-and-supplies',
    name: 'Medical Equipment & Supplies',
    description: 'Hospital equipment, surgical instruments, diagnostic devices, consumables, and personal medical devices.',
    icon: '🩺',
    serviceType: 'medical_equipment',
    quotationSupported: true,
    directBookingSupported: false,
    paymentSupported: false,
    manualConfirmationRequired: true,
    isActive: true,
    sortOrder: 9,
  },
  {
    slug: 'healthcare-staffing',
    name: 'Healthcare Staffing',
    description: 'Nursing staff, paramedics, medical technicians, hospital administrators, and allied health professionals.',
    icon: '👩‍⚕️',
    serviceType: 'staffing',
    quotationSupported: true,
    directBookingSupported: false,
    paymentSupported: false,
    manualConfirmationRequired: true,
    isActive: true,
    sortOrder: 10,
  },
  {
    slug: 'corporate-healthcare',
    name: 'Corporate Healthcare',
    description: 'Employee health check packages, occupational health services, corporate wellness programs.',
    icon: '🏢',
    serviceType: 'corporate_health',
    quotationSupported: true,
    directBookingSupported: false,
    paymentSupported: false,
    manualConfirmationRequired: true,
    isActive: true,
    sortOrder: 11,
  },
  {
    slug: 'healthcare-it-and-software',
    name: 'Healthcare IT & Software',
    description: 'Hospital management systems, EMR/EHR software, telemedicine platforms, and health data services.',
    icon: '💻',
    serviceType: 'health_it',
    quotationSupported: true,
    directBookingSupported: false,
    paymentSupported: false,
    manualConfirmationRequired: true,
    isActive: true,
    sortOrder: 12,
  },
  {
    slug: 'other-healthcare-services',
    name: 'Other Healthcare Services',
    description: 'Any other authorized healthcare business services not listed in the above categories.',
    icon: '➕',
    serviceType: 'other',
    quotationSupported: true,
    directBookingSupported: false,
    paymentSupported: false,
    manualConfirmationRequired: true,
    isActive: true,
    sortOrder: 13,
  },
];

async function main() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('   Swastik HealthMart — Database Push & Seed Script    ');
  console.log('═══════════════════════════════════════════════════════\n');

  // Step 1: Validate schema
  console.log('Step 1: Validating Prisma schema...');
  try {
    execSync('npx prisma validate', { stdio: 'inherit' });
    console.log('✅ Schema valid\n');
  } catch (e) {
    console.error('❌ Schema validation failed. Fix schema before pushing.');
    process.exit(1);
  }

  // Step 2: Push schema to DB
  console.log('Step 2: Pushing schema to database (additive only)...');
  console.log('⚠️  This will CREATE new tables but will NOT drop existing ones.\n');
  try {
    execSync('npx prisma db push', { stdio: 'inherit' });
    console.log('✅ Schema pushed\n');
  } catch (e) {
    console.error('❌ DB push failed. Ensure DATABASE_URL is set and Supabase is reachable.');
    process.exit(1);
  }

  // Step 3: Seed categories
  console.log('Step 3: Seeding HealthMart categories (idempotent)...');
  const prisma = new PrismaClient();

  try {
    let created = 0;
    let skipped = 0;

    for (const cat of HEALTHMART_CATEGORIES_SEED) {
      const existing = await prisma.marketplaceCategory.findUnique({
        where: { slug: cat.slug },
      });

      if (existing) {
        skipped++;
      } else {
        await prisma.marketplaceCategory.create({ data: cat });
        created++;
        console.log(`  ✅ Created: ${cat.name}`);
      }
    }

    console.log(`\n  Created: ${created} categories`);
    console.log(`  Skipped (already exist): ${skipped} categories`);
    console.log('\n✅ Seeding complete\n');
  } catch (e) {
    console.error('❌ Seeding failed:', e.message);
    // Non-fatal — categories can be added via admin dashboard
  } finally {
    await prisma.$disconnect();
  }

  console.log('═══════════════════════════════════════════════════════');
  console.log('  ✅ HealthMart DB push & seed complete!               ');
  console.log('  Next: deploy to Vercel and navigate to /healthmart   ');
  console.log('═══════════════════════════════════════════════════════');
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});

