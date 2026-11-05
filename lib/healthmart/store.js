/**
 * Swastik HealthMart — Unified Data Store
 *
 * Strategy:
 *   - On Vercel / production: Prisma (Supabase) is PRIMARY. No filesystem writes.
 *   - On local dev without DB: falls back to healthmart-runtime-store.json.
 *
 * Detection: process.env.VERCEL === '1' means we are on Vercel serverless.
 * If Prisma write succeeds → DB is primary.
 * If Prisma throws → fall to local JSON file store.
 */

import prisma from "../prisma.js";
import fs from "fs";
import path from "path";
import { matchProvidersForEnquiry } from "./matching-engine.js";
import { sendSMS } from "../sms.js";
import { sendWhatsAppText, WhatsAppTriggers } from "../whatsapp.js";

const IS_VERCEL = process.env.VERCEL === "1";
const LOCAL_STORE_FILE = path.join(process.cwd(), "data", "healthmart-runtime-store.json");

// ─── Demo seed data ────────────────────────────────────────────────────────────
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
    },
    {
      id: "enq-demo-002",
      enquiryNumber: "HM-REQ-202611-1002",
      buyerId: "user-buyer-demo-2",
      categorySlug: "healthcare-staffing",
      serviceType: "staffing",
      title: "Staffing: 6 ICU Trained Nurses (GNM / B.Sc) for Night Shift",
      description: "Immediate requirement for 6 registered female staff nurses with minimum 2 years critical care / ICU exposure.",
      quantity: 6,
      budgetRangeMin: 150000,
      budgetRangeMax: 200000,
      locationCity: "Gorakhpur",
      locationState: "Uttar Pradesh",
      locationPincode: "273001",
      deliveryAddress: "City Hospital, Golghar, Gorakhpur",
      categorySpecificData: { cadreType: "ICU/OT Trained GNM/B.Sc", headcount: 6, engagementModel: "Contractual", shiftArrangement: "Night Shifts" },
      buyerName: "Vikramaditya Roy",
      buyerPhone: "+91 94500 55123",
      buyerEmail: "hr@cityhospitalgkp.org",
      buyerOrganization: "City Hospital Gorakhpur",
      isPhoneVerified: true,
      privacyMode: "PROTECTED",
      priority: "MEDIUM",
      status: "UNDER_REVIEW",
      source: "demo_seed",
      createdAt: "2026-11-01T09:00:00.000Z",
      updatedAt: "2026-11-01T09:00:00.000Z",
    },
  ],
  quotations: [
    {
      id: "quo-demo-001",
      quoteNumber: "HM-QUO-202611-0101",
      enquiryId: "enq-demo-001",
      providerId: "sp-eq-001",
      providerType: "SUPPLIER",
      providerBusinessName: "Purvanchal MedTech & Surgical Supplies",
      providerContactName: "Rajesh Kumar",
      providerPhone: "+91 79921 22974",
      providerEmail: "procure@purvanchalmedtech.com",
      subtotalAmount: 320000,
      taxAmount: 38400,
      shippingOrServiceFee: 2500,
      totalAmount: 360900,
      currency: "INR",
      timelineDelivery: "7 business days after PO",
      warrantyTerms: "2 Years on-site warranty",
      paymentTerms: "50% advance, 50% on delivery",
      cancellationTerms: "10% restocking fee after dispatch",
      inclusions: ["5x ICU Multipara Monitors (CE Certified)", "5x Semi-Electric ICU Beds", "Cables & accessories"],
      exclusions: ["Extended battery modules", "Replacement sensors after Year 1"],
      notes: "Competitive pricing for Gorakhpur clinics.",
      validUntil: "2026-11-15T23:59:59.000Z",
      status: "SENT",
      versionNumber: 1,
      isRevised: false,
      verificationBadge: "SWASTIK_VERIFIED",
      rating: 4.9,
      items: [
        { itemName: "ICU Patient Monitor (Standard)", quantity: 5, unitPrice: 35000, taxRatePercent: 12, totalPrice: 196000 },
        { itemName: "Semi-Electric ICU Bed", quantity: 5, unitPrice: 29000, taxRatePercent: 12, totalPrice: 162400 },
        { itemName: "Transport & Unloading", quantity: 1, unitPrice: 2500, taxRatePercent: 0, totalPrice: 2500 },
      ],
      createdAt: "2026-11-01T10:15:00.000Z",
      updatedAt: "2026-11-01T10:15:00.000Z",
    },
    {
      id: "quo-demo-002",
      quoteNumber: "HM-QUO-202611-0102",
      enquiryId: "enq-demo-001",
      providerId: "sp-eq-002",
      providerType: "SUPPLIER",
      providerBusinessName: "MediLine Healthcare Solutions Pvt Ltd",
      providerContactName: "Priya Sharma",
      providerPhone: "+91 98765 43210",
      providerEmail: "sales@medilinehealthcare.com",
      subtotalAmount: 298000,
      taxAmount: 35760,
      shippingOrServiceFee: 3500,
      totalAmount: 337260,
      currency: "INR",
      timelineDelivery: "10 business days after PO",
      warrantyTerms: "1 Year comprehensive + 1 Year AMC",
      paymentTerms: "30% advance, 70% against delivery",
      cancellationTerms: "Full refund if cancelled before dispatch",
      inclusions: ["5x Patient Monitors with SpO2, ECG", "5x Motorized ICU Beds", "Free installation & demo", "Staff training included"],
      exclusions: ["Consumables", "Spare parts after warranty"],
      notes: "GST invoice provided. ISO 9001 certified supplier.",
      validUntil: "2026-11-18T23:59:59.000Z",
      status: "SENT",
      versionNumber: 1,
      isRevised: false,
      verificationBadge: "SWASTIK_VERIFIED",
      rating: 4.6,
      items: [
        { itemName: "Patient Monitor (Advanced Series)", quantity: 5, unitPrice: 32000, taxRatePercent: 12, totalPrice: 179200 },
        { itemName: "Motorized 5-Function ICU Bed", quantity: 5, unitPrice: 30000, taxRatePercent: 12, totalPrice: 168000 },
        { itemName: "Installation & Training", quantity: 1, unitPrice: 0, taxRatePercent: 0, totalPrice: 0 },
        { itemName: "Freight & Insurance", quantity: 1, unitPrice: 3500, taxRatePercent: 0, totalPrice: 3500 },
      ],
      createdAt: "2026-11-01T11:30:00.000Z",
      updatedAt: "2026-11-01T11:30:00.000Z",
    },
    {
      id: "quo-demo-003",
      quoteNumber: "HM-QUO-202611-0103",
      enquiryId: "enq-demo-001",
      providerId: "sp-eq-003",
      providerType: "SUPPLIER",
      providerBusinessName: "Swastik Medical Equipment Hub",
      providerContactName: "Ankit Agarwal",
      providerPhone: "+91 70001 88888",
      providerEmail: "ankit@swastikmedhub.com",
      subtotalAmount: 355000,
      taxAmount: 42600,
      shippingOrServiceFee: 0,
      totalAmount: 397600,
      currency: "INR",
      timelineDelivery: "5 business days after PO confirmation",
      warrantyTerms: "3 Years Comprehensive On-Site Warranty",
      paymentTerms: "100% advance via NEFT/RTGS",
      cancellationTerms: "Non-refundable after order placed",
      inclusions: ["5x Premium ICU Monitors (Mindray brand)", "5x Full-Electric ICU Beds (imported)", "3-Year on-site AMC included", "Free delivery & installation"],
      exclusions: [],
      notes: "Premium imported equipment. Best-in-class 3-year warranty.",
      validUntil: "2026-11-10T23:59:59.000Z",
      status: "SENT",
      versionNumber: 1,
      isRevised: false,
      verificationBadge: "SWASTIK_VERIFIED",
      rating: 4.8,
      items: [
        { itemName: "Mindray Premium ICU Monitor", quantity: 5, unitPrice: 42000, taxRatePercent: 12, totalPrice: 235200 },
        { itemName: "Full-Electric ICU Bed (Imported)", quantity: 5, unitPrice: 35000, taxRatePercent: 12, totalPrice: 196000 },
        { itemName: "Free Delivery & Installation", quantity: 1, unitPrice: 0, taxRatePercent: 0, totalPrice: 0 },
      ],
      createdAt: "2026-11-01T13:00:00.000Z",
      updatedAt: "2026-11-01T13:00:00.000Z",
    },
  ],
  orders: [],
  messages: [],
};

// ─── Local file helpers (dev only) ────────────────────────────────────────────
function loadLocalStore() {
  try {
    if (!fs.existsSync(LOCAL_STORE_FILE)) {
      if (!IS_VERCEL) {
        fs.writeFileSync(LOCAL_STORE_FILE, JSON.stringify(INITIAL_DEMO_DATA, null, 2), "utf8");
      }
      return JSON.parse(JSON.stringify(INITIAL_DEMO_DATA));
    }
    return JSON.parse(fs.readFileSync(LOCAL_STORE_FILE, "utf8"));
  } catch {
    return JSON.parse(JSON.stringify(INITIAL_DEMO_DATA));
  }
}

function saveLocalStore(data) {
  if (IS_VERCEL) return; // no-op on Vercel — DB is the store
  try {
    const dir = path.dirname(LOCAL_STORE_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(LOCAL_STORE_FILE, JSON.stringify(data, null, 2), "utf8");
  } catch (e) {
    console.error("[HealthMart store] local save error:", e.message);
  }
}

// ─── DB read helpers ──────────────────────────────────────────────────────────
async function dbEnquiryToPlain(dbEnq) {
  if (!dbEnq) return null;
  const quotations = await prisma.providerQuotation.findMany({
    where: { enquiryId: dbEnq.id },
    include: { items: true, revisions: true },
    orderBy: { createdAt: "desc" },
  });
  return {
    id: dbEnq.id,
    enquiryNumber: dbEnq.enquiryNumber,
    buyerId: dbEnq.buyerId,
    categorySlug: dbEnq.category?.slug || "",
    serviceType: dbEnq.serviceType,
    title: dbEnq.title,
    description: dbEnq.description,
    quantity: dbEnq.quantity,
    budgetRangeMin: dbEnq.budgetRangeMin ? Number(dbEnq.budgetRangeMin) : null,
    budgetRangeMax: dbEnq.budgetRangeMax ? Number(dbEnq.budgetRangeMax) : null,
    targetDeliveryDate: dbEnq.targetDeliveryDate,
    locationCity: dbEnq.locationCity,
    locationState: dbEnq.locationState,
    locationPincode: dbEnq.locationPincode,
    deliveryAddress: dbEnq.deliveryAddress,
    categorySpecificData: dbEnq.categorySpecificData || {},
    buyerName: dbEnq.buyerName,
    buyerPhone: dbEnq.buyerPhone,
    buyerEmail: dbEnq.buyerEmail,
    buyerOrganization: dbEnq.buyerOrganization,
    isPhoneVerified: dbEnq.isPhoneVerified,
    privacyMode: dbEnq.privacyMode,
    priority: dbEnq.priority,
    status: dbEnq.status,
    source: dbEnq.source,
    acceptedQuotationId: dbEnq.acceptedQuotationId,
    createdAt: dbEnq.createdAt,
    updatedAt: dbEnq.updatedAt,
    quotations: quotations.map(dbQuoteToPlain),
    quotesCount: quotations.length,
  };
}

function dbQuoteToPlain(q) {
  return {
    id: q.id,
    quoteNumber: q.quoteNumber,
    enquiryId: q.enquiryId,
    providerId: q.providerId,
    providerType: q.providerType,
    providerBusinessName: q.providerBusinessName,
    providerContactName: q.providerContactName,
    providerPhone: q.providerPhone,
    providerEmail: q.providerEmail,
    subtotalAmount: Number(q.subtotalAmount),
    taxAmount: Number(q.taxAmount),
    shippingOrServiceFee: Number(q.shippingOrServiceFee),
    totalAmount: Number(q.totalAmount),
    currency: q.currency,
    timelineDelivery: q.timelineDelivery,
    warrantyTerms: q.warrantyTerms,
    paymentTerms: q.paymentTerms,
    cancellationTerms: q.cancellationTerms,
    inclusions: q.inclusions || [],
    exclusions: q.exclusions || [],
    notes: q.notes,
    validUntil: q.validUntil,
    status: q.status,
    versionNumber: q.versionNumber,
    isRevised: q.isRevised,
    verificationBadge: q.verificationBadge,
    rating: q.rating ? Number(q.rating) : 4.5,
    items: (q.items || []).map((i) => ({
      itemName: i.itemName,
      quantity: i.quantity,
      unitPrice: Number(i.unitPrice),
      taxRatePercent: Number(i.taxRatePercent || 0),
      totalPrice: Number(i.totalPrice),
    })),
    revisions: q.revisions || [],
    createdAt: q.createdAt,
    updatedAt: q.updatedAt,
  };
}

// ─── PUBLIC API ───────────────────────────────────────────────────────────────

/**
 * Create a new Buyer Enquiry (RFQ)
 */
export async function createBuyerEnquiry(enquiryInput) {
  const enquiryNumber = `HM-REQ-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, "0")}-${Math.floor(1000 + Math.random() * 9000)}`;

  const newEnquiry = {
    id: `enq-${Date.now()}`,
    enquiryNumber,
    buyerId: enquiryInput.buyerId || null,
    categorySlug: enquiryInput.categorySlug,
    serviceType: enquiryInput.serviceType || "general",
    title: enquiryInput.title,
    description: enquiryInput.description,
    quantity: parseInt(enquiryInput.quantity || 1),
    budgetRangeMin: enquiryInput.budgetRangeMin ? parseFloat(enquiryInput.budgetRangeMin) : null,
    budgetRangeMax: enquiryInput.budgetRangeMax ? parseFloat(enquiryInput.budgetRangeMax) : null,
    targetDeliveryDate: enquiryInput.targetDeliveryDate || null,
    locationCity: enquiryInput.locationCity || "Gorakhpur",
    locationState: enquiryInput.locationState || "Uttar Pradesh",
    locationPincode: enquiryInput.locationPincode || "273001",
    deliveryAddress: enquiryInput.deliveryAddress || "",
    categorySpecificData: enquiryInput.categorySpecificData || {},
    buyerName: enquiryInput.buyerName,
    buyerPhone: enquiryInput.buyerPhone,
    buyerEmail: enquiryInput.buyerEmail || null,
    buyerOrganization: enquiryInput.buyerOrganization || null,
    isPhoneVerified: true,
    privacyMode: enquiryInput.privacyMode || "PROTECTED",
    priority: enquiryInput.priority || "MEDIUM",
    status: "MATCHING_PROVIDERS",
    source: enquiryInput.source || "marketplace_web",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    quotations: [],
    quotesCount: 0,
  };

  // Transparent provider matching
  const matchResult = await matchProvidersForEnquiry(newEnquiry);
  newEnquiry.matches = matchResult.matches;
  newEnquiry.status = matchResult.matches.length > 0 ? "SENT_TO_PROVIDERS" : "UNDER_REVIEW";

  // Try DB first (Vercel production)
  try {
    const category = await prisma.marketplaceCategory.findFirst({
      where: { slug: newEnquiry.categorySlug },
    });

    const dbRecord = await prisma.buyerEnquiry.create({
      data: {
        enquiryNumber: newEnquiry.enquiryNumber,
        buyerId: newEnquiry.buyerId,
        categoryId: category?.id || null,
        serviceType: newEnquiry.serviceType,
        title: newEnquiry.title,
        description: newEnquiry.description,
        quantity: newEnquiry.quantity,
        budgetRangeMin: newEnquiry.budgetRangeMin,
        budgetRangeMax: newEnquiry.budgetRangeMax,
        targetDeliveryDate: newEnquiry.targetDeliveryDate ? new Date(newEnquiry.targetDeliveryDate) : null,
        locationCity: newEnquiry.locationCity,
        locationState: newEnquiry.locationState,
        locationPincode: newEnquiry.locationPincode,
        deliveryAddress: newEnquiry.deliveryAddress,
        categorySpecificData: newEnquiry.categorySpecificData,
        buyerName: newEnquiry.buyerName,
        buyerPhone: newEnquiry.buyerPhone,
        buyerEmail: newEnquiry.buyerEmail,
        buyerOrganization: newEnquiry.buyerOrganization,
        isPhoneVerified: true,
        privacyMode: newEnquiry.privacyMode,
        priority: newEnquiry.priority,
        status: newEnquiry.status,
        source: newEnquiry.source,
      },
    });
    // Use DB id for consistency
    newEnquiry.id = dbRecord.id;
    newEnquiry._savedToDb = true;
    console.log("[HealthMart] Enquiry saved to DB:", dbRecord.id);

    // Persist matched providers in DB for Provider Dashboard
    if (newEnquiry.matches && newEnquiry.matches.length > 0) {
      for (const m of newEnquiry.matches) {
        try {
          await prisma.enquiryProviderMatch.create({
            data: {
              enquiryId: dbRecord.id,
              providerType: m.providerType || 'SUPPLIER',
              providerId: m.providerId || 'sp-gen-001',
              matchScore: m.matchScore || 100.0,
              matchReasons: { reasons: m.matchReasons || [] },
              status: 'MATCHED'
            }
          });
        } catch (matchErr) {
          console.warn("[HealthMart] Note saving match:", matchErr.message);
        }
      }
    }
  } catch (dbErr) {
    console.warn("[HealthMart] DB save failed, using local store:", dbErr.message);
    // Fall through to local file store
    const store = loadLocalStore();
    store.enquiries.unshift(newEnquiry);
    saveLocalStore(store);
  }

  // Always save locally on non-Vercel for local dev
  if (!IS_VERCEL && !newEnquiry._savedToDb) {
    const store = loadLocalStore();
    store.enquiries.unshift(newEnquiry);
    saveLocalStore(store);
  }

  
  // Outbound notifications for RFQ
  try {
    const adminPhone = process.env.ADMIN_PHONE || "917992122974";
    const shortNum = newEnquiry.enquiryNumber;
    sendSMS(adminPhone, `Swastik HealthMart: New RFQ #${shortNum} posted for ${newEnquiry.categorySlug}! Matched: ${newEnquiry.matchedProvidersCount || 0}.`).catch(() => {});
    
    if (newEnquiry.buyerPhone) {
      sendSMS(newEnquiry.buyerPhone, `Swastik HealthMart: Your RFQ #${shortNum} has been received and matched with ${newEnquiry.matchedProvidersCount || 3} providers! Track: https://www.swastikmed.online/en/healthmart/enquiry/${shortNum}`).catch(() => {});
    }
  } catch (notifErr) {
    console.warn("[HealthMart Notification Warning]", notifErr.message);
  }

  return newEnquiry;
}

/**
 * Fetch enquiries list with optional filters
 */
export async function getBuyerEnquiries({ categorySlug, status, buyerId } = {}) {
  // Try DB
  try {
    const where = {};
    if (categorySlug && categorySlug !== "all") {
      const cat = await prisma.marketplaceCategory.findFirst({ where: { slug: categorySlug } });
      if (cat) where.categoryId = cat.id;
    }
    if (status && status !== "all") where.status = status;
    if (buyerId) where.buyerId = buyerId;

    const dbEnquiries = await prisma.buyerEnquiry.findMany({
      where,
      include: { category: true },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    if (dbEnquiries.length > 0) {
      const list = await Promise.all(dbEnquiries.map(dbEnquiryToPlain));
      // Prepend demo data if no real data yet
      return list;
    }
  } catch (dbErr) {
    console.warn("[HealthMart] DB list failed:", dbErr.message);
  }

  // Fallback to local / demo
  const store = loadLocalStore();
  let list = [...store.enquiries];
  if (categorySlug && categorySlug !== "all") list = list.filter((e) => e.categorySlug === categorySlug);
  if (status && status !== "all") list = list.filter((e) => e.status === status);
  if (buyerId) list = list.filter((e) => e.buyerId === buyerId);
  return list.map((enq) => ({
    ...enq,
    quotations: store.quotations.filter((q) => q.enquiryId === enq.id),
    quotesCount: store.quotations.filter((q) => q.enquiryId === enq.id).length,
  }));
}

/**
 * Fetch single enquiry by ID or enquiry number
 */
export async function getEnquiryByIdOrNumber(identifier) {
  // Try DB
  try {
    const dbEnq = await prisma.buyerEnquiry.findFirst({
      where: { OR: [{ id: identifier }, { enquiryNumber: identifier }] },
      include: { category: true },
    });
    if (dbEnq) return await dbEnquiryToPlain(dbEnq);
  } catch (dbErr) {
    console.warn("[HealthMart] DB get failed:", dbErr.message);
  }

  // Fallback to local
  const store = loadLocalStore();
  const enq = store.enquiries.find((e) => e.id === identifier || e.enquiryNumber === identifier);
  if (!enq) return null;
  return {
    ...enq,
    quotations: store.quotations.filter((q) => q.enquiryId === enq.id),
    quotesCount: store.quotations.filter((q) => q.enquiryId === enq.id).length,
  };
}

/**
 * Submit or revise a Provider Quotation
 */
export async function submitProviderQuotation(quoteInput) {
  const quoteNumber =
    quoteInput.quoteNumber ||
    `HM-QUO-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, "0")}-${Math.floor(100 + Math.random() * 900)}`;

  // Try DB
  try {
    const existing = await prisma.providerQuotation.findFirst({
      where: { enquiryId: quoteInput.enquiryId, providerId: quoteInput.providerId },
      include: { items: true },
    });

    let dbQuote;

    if (existing) {
      // Save revision snapshot
      await prisma.quotationRevision.create({
        data: {
          quotationId: existing.id,
          versionNumber: existing.versionNumber,
          snapshotData: existing,
          reasonForRevision: quoteInput.revisionReason || "Quotation revised",
        },
      });
      // Delete old items and recreate
      await prisma.quotationItem.deleteMany({ where: { quotationId: existing.id } });

      dbQuote = await prisma.providerQuotation.update({
        where: { id: existing.id },
        data: {
          subtotalAmount: parseFloat(quoteInput.subtotalAmount || 0),
          taxAmount: parseFloat(quoteInput.taxAmount || 0),
          shippingOrServiceFee: parseFloat(quoteInput.shippingOrServiceFee || 0),
          totalAmount: parseFloat(quoteInput.totalAmount || 0),
          timelineDelivery: quoteInput.timelineDelivery,
          warrantyTerms: quoteInput.warrantyTerms,
          paymentTerms: quoteInput.paymentTerms,
          cancellationTerms: quoteInput.cancellationTerms,
          inclusions: quoteInput.inclusions || [],
          exclusions: quoteInput.exclusions || [],
          notes: quoteInput.notes,
          validUntil: quoteInput.validUntil ? new Date(quoteInput.validUntil) : new Date(Date.now() + 14 * 86400000),
          versionNumber: { increment: 1 },
          isRevised: true,
          status: "SENT",
          items: { create: (quoteInput.items || []).map((i) => ({ itemName: i.itemName, quantity: i.quantity, unitPrice: i.unitPrice, taxRatePercent: i.taxRatePercent || 0, totalPrice: i.totalPrice })) },
        },
        include: { items: true, revisions: true },
      });
    } else {
      dbQuote = await prisma.providerQuotation.create({
        data: {
          quoteNumber,
          enquiryId: quoteInput.enquiryId,
          providerId: quoteInput.providerId,
          providerType: quoteInput.providerType || "SUPPLIER",
          providerBusinessName: quoteInput.providerBusinessName,
          providerContactName: quoteInput.providerContactName || "",
          providerPhone: quoteInput.providerPhone || "",
          providerEmail: quoteInput.providerEmail || "",
          subtotalAmount: parseFloat(quoteInput.subtotalAmount || 0),
          taxAmount: parseFloat(quoteInput.taxAmount || 0),
          shippingOrServiceFee: parseFloat(quoteInput.shippingOrServiceFee || 0),
          totalAmount: parseFloat(quoteInput.totalAmount || 0),
          currency: "INR",
          timelineDelivery: quoteInput.timelineDelivery || "3–5 business days",
          warrantyTerms: quoteInput.warrantyTerms || "Standard Warranty",
          paymentTerms: quoteInput.paymentTerms || "Standard Terms",
          cancellationTerms: quoteInput.cancellationTerms || "Standard Policy",
          inclusions: quoteInput.inclusions || [],
          exclusions: quoteInput.exclusions || [],
          notes: quoteInput.notes || "",
          validUntil: quoteInput.validUntil ? new Date(quoteInput.validUntil) : new Date(Date.now() + 14 * 86400000),
          status: "SENT",
          versionNumber: 1,
          isRevised: false,
          verificationBadge: quoteInput.verificationBadge || "SWASTIK_VERIFIED",
          rating: quoteInput.rating || 4.7,
          items: { create: (quoteInput.items || []).map((i) => ({ itemName: i.itemName, quantity: i.quantity, unitPrice: i.unitPrice, taxRatePercent: i.taxRatePercent || 0, totalPrice: i.totalPrice })) },
        },
        include: { items: true, revisions: true },
      });

      // Update enquiry status
      await prisma.buyerEnquiry.updateMany({
        where: { id: quoteInput.enquiryId },
        data: { status: "QUOTATIONS_AVAILABLE" },
      });
    }

    console.log("[HealthMart] Quotation saved to DB:", dbQuote.id);
    return dbQuoteToPlain(dbQuote);
  } catch (dbErr) {
    console.warn("[HealthMart] DB quotation save failed, using local store:", dbErr.message);
  }

  // Local fallback
  const store = loadLocalStore();
  const existingIdx = store.quotations.findIndex(
    (q) => q.id === quoteInput.id || (q.enquiryId === quoteInput.enquiryId && q.providerId === quoteInput.providerId)
  );

  let quotation;
  if (existingIdx >= 0) {
    const oldQuote = store.quotations[existingIdx];
    quotation = { ...oldQuote, ...quoteInput, versionNumber: (oldQuote.versionNumber || 1) + 1, isRevised: true, updatedAt: new Date().toISOString() };
    store.quotations[existingIdx] = quotation;
  } else {
    quotation = {
      id: `quo-${Date.now()}`,
      quoteNumber,
      ...quoteInput,
      currency: "INR",
      status: "SENT",
      versionNumber: 1,
      isRevised: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    store.quotations.push(quotation);
    const eIdx = store.enquiries.findIndex((e) => e.id === quoteInput.enquiryId);
    if (eIdx >= 0) store.enquiries[eIdx].status = "QUOTATIONS_AVAILABLE";
  }

  saveLocalStore(store);
  
  // Notify buyer of new quotation
  try {
    const targetEnquiry = await getEnquiryByIdOrNumber(quoteInput.enquiryId);
    if (targetEnquiry && targetEnquiry.buyerPhone) {
      sendSMS(
        targetEnquiry.buyerPhone,
        `Swastik HealthMart: New quotation #${quotation.quoteNumber} received from ${quotation.providerBusinessName} for ₹${quotation.totalAmount}. Compare quotes: https://www.swastikmed.online/en/healthmart/compare/${targetEnquiry.id}`
      ).catch(() => {});
    }
  } catch (quoteNotifErr) {
    console.warn("[HealthMart Quote Notification Warning]", quoteNotifErr.message);
  }

  return quotation;
}

/**
 * Accept or Decline a quotation — and create a HealthMart Order on acceptance
 */
export async function updateQuotationStatus(quoteId, status, rejectionReason = null) {
  // Try DB
  try {
    const updated = await prisma.providerQuotation.update({
      where: { id: quoteId },
      data: {
        status,
        ...(rejectionReason ? { notes: rejectionReason } : {}),
        updatedAt: new Date(),
      },
      include: { items: true },
    });

    if (status === "ACCEPTED") {
      // Mark enquiry as accepted
      await prisma.buyerEnquiry.updateMany({
        where: { id: updated.enquiryId },
        data: { status: "ACCEPTED", acceptedQuotationId: quoteId },
      });

      // Decline all other quotations for this enquiry
      await prisma.providerQuotation.updateMany({
        where: { enquiryId: updated.enquiryId, id: { not: quoteId } },
        data: { status: "DECLINED" },
      });

      // Create a HealthMart order record in DB
      const order = await createHealthMartOrder(updated);
      console.log("[HealthMart] Order created:", order.id);
      return { ...dbQuoteToPlain(updated), order };
    }

    return dbQuoteToPlain(updated);
  } catch (dbErr) {
    console.warn("[HealthMart] DB status update failed, local fallback:", dbErr.message);
  }

  // Local fallback
  const store = loadLocalStore();
  const qIdx = store.quotations.findIndex((q) => q.id === quoteId);
  if (qIdx < 0) throw new Error("Quotation not found");

  store.quotations[qIdx].status = status;
  if (rejectionReason) store.quotations[qIdx].rejectionReason = rejectionReason;
  store.quotations[qIdx].updatedAt = new Date().toISOString();

  let order = null;
  if (status === "ACCEPTED") {
    const enqId = store.quotations[qIdx].enquiryId;
    const eIdx = store.enquiries.findIndex((e) => e.id === enqId);
    if (eIdx >= 0) {
      store.enquiries[eIdx].status = "ACCEPTED";
      store.enquiries[eIdx].acceptedQuotationId = quoteId;
      store.enquiries[eIdx].updatedAt = new Date().toISOString();
    }
    // Decline others
    store.quotations.forEach((q, i) => {
      if (q.enquiryId === enqId && q.id !== quoteId) store.quotations[i].status = "DECLINED";
    });
    // Create local order
    order = createLocalOrder(store.quotations[qIdx]);
    if (!store.orders) store.orders = [];
    store.orders.push(order);
  }

  saveLocalStore(store);
  return { ...store.quotations[qIdx], order };
}

/**
 * Create a HealthMart Order in DB (from an accepted quotation)
 */
async function createHealthMartOrder(quotation) {
  const orderNumber = `HM-ORD-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, "0")}-${Math.floor(1000 + Math.random() * 9000)}`;

  const record = await prisma.marketplaceOrder.create({
    data: {
      orderNumber,
      enquiryId: quotation.enquiryId,
      quotationId: quotation.id,
      providerId: quotation.providerId,
      providerBusinessName: quotation.providerBusinessName,
      totalAmount: Number(quotation.totalAmount),
      currency: "INR",
      timelineDelivery: quotation.timelineDelivery,
      paymentTerms: quotation.paymentTerms,
      warrantyTerms: quotation.warrantyTerms,
      status: "ORDER_CONFIRMED",
      deliveryStatus: "PENDING_DISPATCH",
    },
  });

  
  // Notify admin and winning provider
  try {
    const adminPhone = process.env.ADMIN_PHONE || "917992122974";
    sendSMS(adminPhone, `Swastik HealthMart: Order Confirmed! #${orderNumber}, Supplier: ${quotation.providerBusinessName}, Amount: ₹${quotation.totalAmount}.`).catch(() => {});
  } catch (e) {}

  return {
    id: record.id,
    orderNumber: record.orderNumber,
    enquiryId: record.enquiryId,
    quotationId: record.quotationId,
    status: record.status,
    deliveryStatus: record.deliveryStatus,
    confirmedAt: record.createdAt,
    totalAmount: record.totalAmount,
    providerBusinessName: record.providerBusinessName,
    timelineDelivery: record.timelineDelivery,
  };
}

/**
 * Create a local (file) order record
 */
function createLocalOrder(quotation) {
  const orderNumber = `HM-ORD-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, "0")}-${Math.floor(1000 + Math.random() * 9000)}`;
  return {
    id: `ord-${Date.now()}`,
    orderNumber,
    enquiryId: quotation.enquiryId,
    quoteId: quotation.id,
    quoteNumber: quotation.quoteNumber,
    providerId: quotation.providerId,
    providerBusinessName: quotation.providerBusinessName,
    totalAmount: quotation.totalAmount,
    currency: "INR",
    paymentTerms: quotation.paymentTerms,
    warrantyTerms: quotation.warrantyTerms,
    timelineDelivery: quotation.timelineDelivery,
    status: "ORDER_CONFIRMED",
    deliveryStatus: "PENDING_DISPATCH",
    confirmedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Get orders (for buyer order history / delivery tracking)
 */
export async function getHealthMartOrders({ buyerId, enquiryId } = {}) {
  try {
    const where = {};
    if (enquiryId) where.enquiryId = enquiryId;
    if (buyerId) where.buyerUserId = buyerId;

    const records = await prisma.marketplaceOrder.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    if (records.length > 0) {
      return records.map((r) => ({
        id: r.id,
        orderNumber: r.orderNumber,
        enquiryId: r.enquiryId,
        quotationId: r.quotationId,
        providerId: r.providerId,
        providerBusinessName: r.providerBusinessName,
        totalAmount: Number(r.totalAmount),
        currency: r.currency,
        status: r.status,
        deliveryStatus: r.deliveryStatus,
        deliveryNotes: r.deliveryNotes,
        timelineDelivery: r.timelineDelivery,
        paymentTerms: r.paymentTerms,
        warrantyTerms: r.warrantyTerms,
        dispatchedAt: r.dispatchedAt,
        deliveredAt: r.deliveredAt,
        confirmedAt: r.createdAt,
      }));
    }
  } catch (err) {
    console.warn("[HealthMart] getHealthMartOrders DB error:", err.message);
  }

  const store = loadLocalStore();
  return (store.orders || []).filter((o) => !enquiryId || o.enquiryId === enquiryId);
}

/**
 * Update delivery status for an order
 */
export async function updateDeliveryStatus(orderId, deliveryStatus, notes = "") {
  const VALID_STATUSES = ["PENDING_DISPATCH", "DISPATCHED", "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"];
  if (!VALID_STATUSES.includes(deliveryStatus)) throw new Error(`Invalid delivery status: ${deliveryStatus}`);

  try {
    const data = {
      deliveryStatus,
      deliveryNotes: notes,
      ...(deliveryStatus === "DISPATCHED" ? { dispatchedAt: new Date() } : {}),
      ...(deliveryStatus === "DELIVERED" ? { deliveredAt: new Date(), status: "ORDER_DELIVERED", paymentStatus: "PAID" } : {}),
      ...(deliveryStatus === "CANCELLED" ? { cancelledAt: new Date(), status: "ORDER_CANCELLED" } : {}),
    };

    const updated = await prisma.marketplaceOrder.update({
      where: { id: orderId },
      data,
    });

    return {
      id: updated.id,
      orderNumber: updated.orderNumber,
      status: updated.status,
      deliveryStatus: updated.deliveryStatus,
      deliveryNotes: updated.deliveryNotes,
      paymentStatus: updated.paymentStatus,
      dispatchedAt: updated.dispatchedAt,
      deliveredAt: updated.deliveredAt,
      cancelledAt: updated.cancelledAt,
    };
  } catch (dbErr) {
    console.warn("[HealthMart] delivery status update fallback:", dbErr.message);
    const store = loadLocalStore();
    const oIdx = (store.orders || []).findIndex((o) => o.id === orderId);
    if (oIdx < 0) throw new Error("Order not found");
    store.orders[oIdx].deliveryStatus = deliveryStatus;
    store.orders[oIdx].deliveryNotes = notes;
    store.orders[oIdx].updatedAt = new Date().toISOString();
    if (deliveryStatus === "DELIVERED") {
      store.orders[oIdx].status = "ORDER_DELIVERED";
      store.orders[oIdx].deliveredAt = new Date().toISOString();
      store.orders[oIdx].paymentStatus = "PAID";
    }
    if (deliveryStatus === "CANCELLED") {
      store.orders[oIdx].status = "ORDER_CANCELLED";
      store.orders[oIdx].cancelledAt = new Date().toISOString();
    }
    saveLocalStore(store);
    return store.orders[oIdx];
  }
}

/**
 * Fetch a single order by ID or orderNumber
 */
export async function getOrderById(orderId) {
  try {
    const record = await prisma.marketplaceOrder.findFirst({
      where: {
        OR: [{ id: orderId }, { orderNumber: orderId }]
      },
      include: {
        enquiry: true,
        quotation: {
          include: { items: true }
        }
      }
    });

    if (record) {
      return {
        id: record.id,
        orderNumber: record.orderNumber,
        enquiryId: record.enquiryId,
        quotationId: record.quotationId,
        buyerUserId: record.buyerUserId,
        providerId: record.providerId,
        providerBusinessName: record.providerBusinessName,
        totalAmount: Number(record.totalAmount),
        currency: record.currency,
        status: record.status,
        deliveryStatus: record.deliveryStatus,
        deliveryNotes: record.deliveryNotes,
        timelineDelivery: record.timelineDelivery,
        paymentTerms: record.paymentTerms,
        warrantyTerms: record.warrantyTerms,
        dispatchedAt: record.dispatchedAt,
        deliveredAt: record.deliveredAt,
        confirmedAt: record.createdAt,
        enquiry: record.enquiry,
        quotation: record.quotation ? dbQuoteToPlain(record.quotation) : null
      };
    }
  } catch (err) {
    console.warn("[HealthMart] getOrderById DB error:", err.message);
  }

  const store = loadLocalStore();
  const order = (store.orders || []).find((o) => o.id === orderId || o.orderNumber === orderId);
  return order || null;
}

/**
 * Fetch a single quotation by ID or quoteNumber
 */
export async function getQuotationById(quotationId) {
  try {
    const record = await prisma.providerQuotation.findFirst({
      where: {
        OR: [{ id: quotationId }, { quoteNumber: quotationId }]
      },
      include: { items: true, revisions: true }
    });

    if (record) {
      return dbQuoteToPlain(record);
    }
  } catch (err) {
    console.warn("[HealthMart] getQuotationById DB error:", err.message);
  }

  const store = loadLocalStore();
  const quote = (store.quotations || []).find((q) => q.id === quotationId || q.quoteNumber === quotationId);
  return quote || null;
}
