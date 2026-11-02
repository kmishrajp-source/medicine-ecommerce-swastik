/**
 * SEED DUMMY CUSTOMER & MULTI-QUOTATION COMPARISON
 * =================================================
 * Creates a realistic synthetic customer ("Rajiv Verma", Verma Care Diagnostic & Clinic)
 * with an RFQ for diagnostic equipment and 4 competitive, itemized quotations from
 * verified suppliers in the HealthMart runtime store.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, "..");
const STORE_FILE = path.join(PROJECT_ROOT, "data", "healthmart-runtime-store.json");

// 1. Initial demo data template
const INITIAL_DEMO_DATA = {
  enquiries: [
    {
      id: "enq-demo-001",
      enquiryNumber: "HM-REQ-202611-1001",
      buyerId: "user-buyer-demo",
      categorySlug: "medical-equipment-and-supplies",
      serviceType: "medical_equipment",
      title: "ICU Multi-Para Patient Monitors & Motorized Beds Procurement",
      description: "Procurement of 5 units 12.1-inch Multi-para Patient Monitors (ECG, SpO2, NIBP) and 5 units 5-Function Electric ICU Beds.",
      quantity: 5,
      budgetRangeMin: 250000,
      budgetRangeMax: 450000,
      targetDeliveryDate: "2026-11-20T00:00:00.000Z",
      locationCity: "Gorakhpur",
      locationState: "Uttar Pradesh",
      locationPincode: "273001",
      deliveryAddress: "Apex Healthcare Center, Medical College Road, Gorakhpur",
      categorySpecificData: {
        equipmentCategory: "ICU & Critical Care Equipment",
        specifications: "FDA / CE approved, 12.1-inch color display, battery backup > 4 hrs",
        warrantyRequirement: "2 to 3 Years Comprehensive Warranty",
        installationRequired: "Yes",
        budgetRange: "₹1,00,000 to ₹5,00,000",
      },
      buyerName: "Dr. Arvind Srivastava",
      buyerPhone: "+91 98390 12345",
      buyerEmail: "procurement@apexmedcenter.com",
      buyerOrganization: "Apex Multi-Specialty Clinic",
      isPhoneVerified: true,
      privacyMode: "PROTECTED",
      priority: "HIGH",
      status: "QUOTATIONS_AVAILABLE",
      source: "demo_seed",
      createdAt: "2026-11-01T08:30:00.000Z",
      updatedAt: "2026-11-01T10:15:00.000Z",
    }
  ],
  quotations: [],
  orders: [],
  messages: []
};

// 2. Dummy Customer RFQ
const DUMMY_CUSTOMER_RFQ = {
  id: "enq-cust-rajiv-001",
  enquiryNumber: "HM-REQ-202611-2045",
  buyerId: "user-dummy-rajiv-verma",
  categorySlug: "medical-equipment-and-supplies",
  serviceType: "medical_equipment",
  title: "Procurement of Digital 12-Channel ECG & Portable Ultrasound Scanner",
  description: "Requirement for 1 Unit Color Doppler Portable Ultrasound Machine (3 probes: Convex, Linear, Cardiac) and 1 Unit 12-Channel Digital ECG Machine with thermal printer and interpretive software for clinical diagnostic setup.",
  quantity: 2,
  budgetRangeMin: 180000,
  budgetRangeMax: 260000,
  targetDeliveryDate: "2026-11-25T00:00:00.000Z",
  locationCity: "Gorakhpur",
  locationState: "Uttar Pradesh",
  locationPincode: "273001",
  deliveryAddress: "Verma Care Diagnostic & Clinic, Near Asuran Chowk, Medical Road, Gorakhpur",
  categorySpecificData: {
    equipmentCategory: "Diagnostic & Imaging Equipment",
    specifications: "Color Doppler ultrasound with 15-inch LED, 12-lead interpretive ECG with USB/WiFi export",
    warrantyRequirement: "Minimum 2 Years On-Site Comprehensive Warranty",
    installationRequired: "Yes (On-site installation and technician training)",
    budgetRange: "₹1,80,000 to ₹2,60,000",
  },
  buyerName: "Rajiv Verma",
  buyerPhone: "+91 98765 12345",
  buyerEmail: "rajiv.verma@vermacare.org",
  buyerOrganization: "Verma Care Diagnostic & Clinic",
  isPhoneVerified: true,
  privacyMode: "PROTECTED",
  priority: "HIGH",
  status: "QUOTATIONS_AVAILABLE",
  source: "customer_portal",
  createdAt: "2026-11-02T10:00:00.000Z",
  updatedAt: "2026-11-02T14:30:00.000Z",
};

// 3. Four Competitive Quotations
const DUMMY_QUOTATIONS = [
  {
    id: "quo-rajiv-001",
    quoteNumber: "HM-QUO-202611-0201",
    enquiryId: "enq-cust-rajiv-001",
    providerId: "sp-eq-001",
    providerType: "SUPPLIER",
    providerBusinessName: "Purvanchal MedTech & Surgical Supplies",
    providerContactName: "Rajesh Kumar",
    providerPhone: "+91 79921 22974",
    providerEmail: "procure@purvanchalmedtech.com",
    subtotalAmount: 185000,
    taxAmount: 22200,
    shippingOrServiceFee: 2800,
    totalAmount: 210000,
    currency: "INR",
    timelineDelivery: "4 business days after confirmation",
    warrantyTerms: "2 Years Comprehensive On-Site Warranty + 2 Free Preventative Maintenances",
    paymentTerms: "30% Advance with Purchase Order, 70% upon successful on-site calibration & training",
    cancellationTerms: "Free cancellation before dispatch. 5% restocking fee if cancelled during transit.",
    inclusions: [
      "1x Portable Color Doppler Ultrasound Unit with 15-inch High-Res Display",
      "2x Multi-frequency Transducers (Convex & Linear Probes included)",
      "1x 12-Channel Interpretive Digital ECG Machine with Thermal Paper Rolls",
      "On-site Installation, Calibration Certificate & Staff Operational Training",
      "24x7 Gorakhpur Resident Service Engineer Support"
    ],
    exclusions: ["Cardiac Phased Array Probe (available optionally at ₹38,000)", "Consumable ECG Gel & extra paper"],
    notes: "Authorized regional distributor for Eastern UP. Local service center at Golghar, Gorakhpur ensures under-4-hour breakdown support.",
    validUntil: "2026-11-20T23:59:59.000Z",
    status: "SENT",
    versionNumber: 1,
    isRevised: false,
    verificationBadge: "CDSCO_APPROVED",
    rating: 4.9,
    items: [
      { itemName: "Portable Color Doppler Ultrasound Scanner (Model US-4500)", quantity: 1, unitPrice: 135000, taxRatePercent: 12, totalPrice: 151200 },
      { itemName: "12-Channel Interpretive ECG Machine with Digital Memory (Model ECG-12D)", quantity: 1, unitPrice: 50000, taxRatePercent: 12, totalPrice: 56000 },
      { itemName: "Professional Installation, Electrical Safety Testing & Medical Calibration", quantity: 1, unitPrice: 0, taxRatePercent: 0, totalPrice: 0 },
      { itemName: "Insured Transit, Handling & Doorstep Delivery in Gorakhpur", quantity: 1, unitPrice: 2800, taxRatePercent: 0, totalPrice: 2800 }
    ],
    createdAt: "2026-11-02T11:15:00.000Z",
    updatedAt: "2026-11-02T11:15:00.000Z",
  },
  {
    id: "quo-rajiv-002",
    quoteNumber: "HM-QUO-202611-0202",
    enquiryId: "enq-cust-rajiv-001",
    providerId: "sp-eq-002",
    providerType: "SUPPLIER",
    providerBusinessName: "MediLine Healthcare Solutions Pvt Ltd",
    providerContactName: "Priya Sharma",
    providerPhone: "+91 98765 43210",
    providerEmail: "sales@medilinehealthcare.com",
    subtotalAmount: 162000,
    taxAmount: 19440,
    shippingOrServiceFee: 3560,
    totalAmount: 185000, // LOWEST PRICE
    currency: "INR",
    timelineDelivery: "7 business days after PO",
    warrantyTerms: "1 Year Comprehensive Warranty + 1 Year Extended AMC (Parts extra)",
    paymentTerms: "50% Advance with order, 50% against delivery challan",
    cancellationTerms: "Non-refundable advance once dispatch initiated",
    inclusions: [
      "1x Portable B/W Ultrasound Machine with Color Flow Mapping",
      "1x 3.5MHz Convex Abdominal Probe",
      "1x 12-Channel Compact ECG System with Patient Cable",
      "Free transit insurance & standard delivery"
    ],
    exclusions: ["Linear vascular probe (available at ₹28,000)", "Extended warranty beyond Year 2"],
    notes: "Lowest price budget package ideal for startup diagnostics. GST invoice and ISO 9001 quality certificates attached.",
    validUntil: "2026-11-22T23:59:59.000Z",
    status: "SENT",
    versionNumber: 1,
    isRevised: false,
    verificationBadge: "SWASTIK_VERIFIED",
    rating: 4.6,
    items: [
      { itemName: "MediScan Portable Ultrasound with Convex Transducer", quantity: 1, unitPrice: 118000, taxRatePercent: 12, totalPrice: 132160 },
      { itemName: "CardioCheck 12-Lead Auto-Analysis ECG Unit", quantity: 1, unitPrice: 44000, taxRatePercent: 12, totalPrice: 49280 },
      { itemName: "Freight, Insurance & Delivery Charges", quantity: 1, unitPrice: 3560, taxRatePercent: 0, totalPrice: 3560 }
    ],
    createdAt: "2026-11-02T12:00:00.000Z",
    updatedAt: "2026-11-02T12:00:00.000Z",
  },
  {
    id: "quo-rajiv-003",
    quoteNumber: "HM-QUO-202611-0203",
    enquiryId: "enq-cust-rajiv-001",
    providerId: "sp-eq-003",
    providerType: "SUPPLIER",
    providerBusinessName: "Swastik Medical Equipment Hub",
    providerContactName: "Ankit Agarwal",
    providerPhone: "+91 70001 88888",
    providerEmail: "ankit@swastikmedhub.com",
    subtotalAmount: 212000,
    taxAmount: 25440,
    shippingOrServiceFee: 2560,
    totalAmount: 240000, // PREMIUM SPEC
    currency: "INR",
    timelineDelivery: "3 business days (Express Stock Available)",
    warrantyTerms: "3 Years Comprehensive Full-Replacement Warranty (Zero Downtime Guarantee)",
    paymentTerms: "100% Advance via RTGS/NEFT or 0% interest EMI options available",
    cancellationTerms: "100% refund if cancelled within 24 hours of order placement",
    inclusions: [
      "1x Mindray High-End Portable Ultrasound (Color Doppler with PW/CW)",
      "3x Multi-Frequency Transducers (Convex, High-Frequency Linear, Micro-Convex Pediatric)",
      "1x Mindray 12-Channel Touchscreen Interpretive ECG with DICOM/PACS cloud sync",
      "3-Year On-Site Comprehensive AMC including parts, probes, and software updates",
      "Free UPS Battery Backup (1kVA) for continuous clinical operation"
    ],
    exclusions: ["None — Complete Turnkey Clinical Diagnostic Solution"],
    notes: "Top-tier imported hospital-grade system. Zero-downtime policy: we provide a standby replacement unit if service takes over 24 hours.",
    validUntil: "2026-11-18T23:59:59.000Z",
    status: "SENT",
    versionNumber: 1,
    isRevised: false,
    verificationBadge: "SWASTIK_VERIFIED",
    rating: 4.8,
    items: [
      { itemName: "Mindray Color Doppler Ultrasound with 3 Active Probes (US-PRO)", quantity: 1, unitPrice: 165000, taxRatePercent: 12, totalPrice: 184800 },
      { itemName: "Mindray Touchscreen 12-Channel ECG with DICOM & Cloud Sync", quantity: 1, unitPrice: 47000, taxRatePercent: 12, totalPrice: 52640 },
      { itemName: "Complimentary 1kVA Pure Sine-Wave Medical Grade UPS Backup", quantity: 1, unitPrice: 0, taxRatePercent: 0, totalPrice: 0 },
      { itemName: "White-Glove Express Delivery, Installation & Hands-on Workshop", quantity: 1, unitPrice: 2560, taxRatePercent: 0, totalPrice: 2560 }
    ],
    createdAt: "2026-11-02T13:30:00.000Z",
    updatedAt: "2026-11-02T13:30:00.000Z",
  },
  {
    id: "quo-rajiv-004",
    quoteNumber: "HM-QUO-202611-0204",
    enquiryId: "enq-cust-rajiv-001",
    providerId: "sp-eq-004",
    providerType: "SUPPLIER",
    providerBusinessName: "Gorakhdham Diagnostic Equipments",
    providerContactName: "Ramesh Chandra",
    providerPhone: "+91 94152 88120",
    providerEmail: "ramesh@gorakhdhamdiagnostics.com",
    subtotalAmount: 172000,
    taxAmount: 20640,
    shippingOrServiceFee: 2360,
    totalAmount: 195000,
    currency: "INR",
    timelineDelivery: "5 business days",
    warrantyTerms: "2 Years On-Site Comprehensive Warranty",
    paymentTerms: "40% Advance, 60% on delivery and inspection",
    cancellationTerms: "Standard cancellation policy with 7 days return window",
    inclusions: [
      "1x Digital Ultrasound System with 2 Probes (Convex + Linear)",
      "1x 12-Channel ECG Machine with Digital Display",
      "Trolley & Probe Holders Included",
      "Free Installation & Staff Training"
    ],
    exclusions: ["Extra thermal rolls beyond starter pack"],
    notes: "Local Gorakhpur based supplier with physical showroom at Medical College Road. Fast local service.",
    validUntil: "2026-11-24T23:59:59.000Z",
    status: "SENT",
    versionNumber: 1,
    isRevised: false,
    verificationBadge: "SWASTIK_VERIFIED",
    rating: 4.7,
    items: [
      { itemName: "Sonovision Digital Portable Ultrasound System", quantity: 1, unitPrice: 125000, taxRatePercent: 12, totalPrice: 140000 },
      { itemName: "CardioPulse 12-Lead Diagnostic ECG", quantity: 1, unitPrice: 47000, taxRatePercent: 12, totalPrice: 52640 },
      { itemName: "Custom Medical Heavy-Duty Trolley for Ultrasound & ECG", quantity: 1, unitPrice: 0, taxRatePercent: 0, totalPrice: 0 },
      { itemName: "Delivery, Unloading & Operational Setup", quantity: 1, unitPrice: 2360, taxRatePercent: 0, totalPrice: 2360 }
    ],
    createdAt: "2026-11-02T14:15:00.000Z",
    updatedAt: "2026-11-02T14:15:00.000Z",
  }
];

// 4. Seed logic
function seedStore() {
  let store = INITIAL_DEMO_DATA;
  if (fs.existsSync(STORE_FILE)) {
    try {
      store = JSON.parse(fs.readFileSync(STORE_FILE, "utf8"));
    } catch (e) {
      console.warn("Could not parse existing store, creating fresh:", e.message);
    }
  }

  // Ensure collections exist
  if (!store.enquiries) store.enquiries = [];
  if (!store.quotations) store.quotations = [];
  if (!store.orders) store.orders = [];
  if (!store.messages) store.messages = [];

  // Upsert dummy customer RFQ
  const enqIndex = store.enquiries.findIndex(e => e.id === DUMMY_CUSTOMER_RFQ.id || e.enquiryNumber === DUMMY_CUSTOMER_RFQ.enquiryNumber);
  if (enqIndex >= 0) {
    store.enquiries[enqIndex] = DUMMY_CUSTOMER_RFQ;
  } else {
    store.enquiries.unshift(DUMMY_CUSTOMER_RFQ);
  }

  // Upsert 4 Quotations
  DUMMY_QUOTATIONS.forEach(quote => {
    const qIndex = store.quotations.findIndex(q => q.id === quote.id || q.quoteNumber === quote.quoteNumber);
    if (qIndex >= 0) {
      store.quotations[qIndex] = quote;
    } else {
      store.quotations.push(quote);
    }
  });

  // Save to file
  const dir = path.dirname(STORE_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(STORE_FILE, JSON.stringify(store, null, 2), "utf8");

  console.log("================================================================================");
  console.log("✅ DUMMY CUSTOMER & MULTIPLE QUOTATIONS PERSISTED TO HEALTHMART STORE");
  console.log("================================================================================");
  console.log(`📁 Store file: ${STORE_FILE}`);
  console.log(`👤 Customer:    ${DUMMY_CUSTOMER_RFQ.buyerName} (${DUMMY_CUSTOMER_RFQ.buyerOrganization})`);
  console.log(`📞 Contact:     ${DUMMY_CUSTOMER_RFQ.buyerPhone} | ${DUMMY_CUSTOMER_RFQ.buyerEmail}`);
  console.log(`📋 RFQ Number:  ${DUMMY_CUSTOMER_RFQ.enquiryNumber} (ID: ${DUMMY_CUSTOMER_RFQ.id})`);
  console.log(`🎯 Requirement: ${DUMMY_CUSTOMER_RFQ.title}`);
  console.log(`💰 Budget:      ₹${DUMMY_CUSTOMER_RFQ.budgetRangeMin.toLocaleString()} – ₹${DUMMY_CUSTOMER_RFQ.budgetRangeMax.toLocaleString()}`);
  console.log(`🏷️  Quotations:  ${DUMMY_QUOTATIONS.length} competing quotations received!`);
  console.log("--------------------------------------------------------------------------------\n");

  // 5. Run Live Comparison Matrix
  console.log("📊 LIVE QUOTATION COMPARISON MATRIX:");
  console.log("--------------------------------------------------------------------------------");

  const sortedByPrice = [...DUMMY_QUOTATIONS].sort((a, b) => a.totalAmount - b.totalAmount);

  console.log(
    "Rank".padEnd(6) +
    "Provider".padEnd(35) +
    "Total (₹)".padEnd(12) +
    "Delivery".padEnd(18) +
    "Warranty".padEnd(25) +
    "Rating"
  );
  console.log("-".repeat(105));

  sortedByPrice.forEach((q, idx) => {
    const rank = `#${idx + 1}`.padEnd(6);
    const provider = (q.providerBusinessName.length > 32 ? q.providerBusinessName.substring(0, 29) + "..." : q.providerBusinessName).padEnd(35);
    const total = `₹${q.totalAmount.toLocaleString()}`.padEnd(12);
    const delivery = (q.timelineDelivery.length > 16 ? q.timelineDelivery.substring(0, 14) + ".." : q.timelineDelivery).padEnd(18);
    const warranty = (q.warrantyTerms.length > 22 ? q.warrantyTerms.substring(0, 20) + ".." : q.warrantyTerms).padEnd(25);
    const rating = `${q.rating} ★ (${q.verificationBadge})`;

    console.log(`${rank}${provider}${total}${delivery}${warranty}${rating}`);
  });

  console.log("--------------------------------------------------------------------------------\n");

  console.log("🔍 KEY COMPARATIVE HIGHLIGHTS:");
  console.log(`  1. Lowest Price:      ₹${sortedByPrice[0].totalAmount.toLocaleString()} (${sortedByPrice[0].providerBusinessName})`);
  console.log(`  2. Fastest Delivery:  ${DUMMY_QUOTATIONS.find(q => q.providerId === 'sp-eq-003').timelineDelivery} (Swastik Medical Equipment Hub)`);
  console.log(`  3. Longest Warranty:  3 Years Replacement (Swastik Medical Equipment Hub)`);
  console.log(`  4. Best Local Service: 4-Hour Response (Purvanchal MedTech - Rajesh Kumar, Gorakhpur)`);
  console.log("\n🌐 LIVE APPLICATION NAVIGATION LINKS:");
  console.log(`  • Comparison Matrix:  /en/healthmart/compare/${DUMMY_CUSTOMER_RFQ.id}`);
  console.log(`  • Live RFQ Tracking:  /en/healthmart/enquiry/${DUMMY_CUSTOMER_RFQ.enquiryNumber}`);
  console.log(`  • Provider Dashboard: /en/healthmart/provider/dashboard`);
  console.log("================================================================================");
}

seedStore();

