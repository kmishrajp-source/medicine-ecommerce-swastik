import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// ─── Simulated Regulatory Feed ────────────────────────────────────────────────
// In production, replace with live CDSCO/OpenFDA shortage API calls.
// Pattern: if salt name contains known shortage patterns, flag it.
const REGULATORY_SHORTAGE_SALTS = [
    "amoxicillin", "azithromycin", "paracetamol", "metformin",
    "atorvastatin", "ciprofloxacin", "ondansetron", "amlodipine"
];

function checkRegulatoryAlert(salt, name) {
    if (!salt && !name) return false;
    const saltLower = (salt || "").toLowerCase();
    const nameLower = (name || "").toLowerCase();
    return REGULATORY_SHORTAGE_SALTS.some(s =>
        saltLower.includes(s) || nameLower.includes(s)
    );
}

// ─── Composite Risk Scoring ───────────────────────────────────────────────────
function calculateCompositeRisk(params) {
    const { daysLeft, currentStock, regulatoryAlert, supplierCount, lowestSupplierDays } = params;

    let score = 0; // 0–100

    // 1. Stock runway (50% weight)
    if (currentStock === 0) score += 50;
    else if (daysLeft < 7) score += 45;
    else if (daysLeft < 14) score += 35;
    else if (daysLeft < 30) score += 20;
    else if (daysLeft < 60) score += 8;
    else score += 0;

    // 2. Regulatory signal (25% weight)
    if (regulatoryAlert) score += 25;

    // 3. Supplier availability (25% weight)
    if (supplierCount === 0) score += 25;
    else if (supplierCount === 1) score += 15;
    else if (supplierCount < 3) score += 8;
    else score += 0;

    // Clamp to 100
    score = Math.min(score, 100);

    let riskLevel = "LOW";
    if (score >= 70) riskLevel = "CRITICAL";
    else if (score >= 45) riskLevel = "HIGH";
    else if (score >= 20) riskLevel = "MEDIUM";

    return { compositeScore: score, riskLevel };
}

// ─── Procurement Calculator ───────────────────────────────────────────────────
function calculateProcurement(params) {
    const { currentStock, dailyVelocity, daysLeft, mrp } = params;

    const TARGET_BUFFER_DAYS = 60;
    const reorderDays = Math.max(0, Math.min(daysLeft - 2, 5)); // suggest reorder within 5 days or 2 days before stockout

    let reorderQty = 0;
    if (dailyVelocity > 0) {
        const targetStock = Math.ceil(dailyVelocity * TARGET_BUFFER_DAYS);
        reorderQty = Math.max(0, targetStock - currentStock);
    }

    const estimatedCost = reorderQty * (mrp || 0);

    let urgency = "ROUTINE";
    if (daysLeft < 3 || currentStock === 0) urgency = "EMERGENCY";
    else if (daysLeft < 14) urgency = "URGENT";
    else if (daysLeft < 30) urgency = "SOON";

    let reorderWindow = "Within 30 days";
    if (urgency === "EMERGENCY") reorderWindow = "Immediately — Stock Out Risk";
    else if (urgency === "URGENT") reorderWindow = `Within ${reorderDays} days`;
    else if (urgency === "SOON") reorderWindow = `Within 10 days`;

    return {
        reorderQty,
        estimatedCost: estimatedCost.toFixed(2),
        urgency,
        reorderWindow,
        targetBufferDays: TARGET_BUFFER_DAYS
    };
}

// ─── Main GET Handler ─────────────────────────────────────────────────────────
export async function GET(req) {
    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        // 1. Fetch all products with inventory
        const products = await prisma.product.findMany({
            include: { inventory: true }
        });

        // 2. Fetch 30-day sales velocity
        const recentOrders = await prisma.orderItem.groupBy({
            by: ['productId'],
            where: {
                order: {
                    createdAt: { gte: thirtyDaysAgo },
                    status: { notIn: ["Cancelled", "Rejected"] }
                }
            },
            _sum: { quantity: true }
        });

        const salesMap = {};
        recentOrders.forEach(o => { salesMap[o.productId] = o._sum.quantity || 0; });

        // ─ Phase 2: Load B2B Supplier Directory ─────────────────────────────
        // Fetch distributors and stockists for supplier availability signals
        const [distributors, stockists] = await Promise.all([
            prisma.distributor.findMany({ select: { id: true, brands: true, companyName: true, phone: true } }).catch(() => []),
            prisma.stockist.findMany({ select: { id: true, speciality: true, agencyName: true, phone: true } }).catch(() => [])
        ]);

        const allSuppliers = [
            ...distributors.map(d => ({ ...d, type: 'distributor', name: d.companyName, coverage: d.brands || '' })),
            ...stockists.map(s => ({ ...s, type: 'stockist', name: s.agencyName, coverage: s.speciality || '' }))
        ];

        // 3. Process Products
        let intelligenceData = products.map(product => {
            const currentStock = product.inventory?.stock ?? product.stock;
            const salesLast30Days = salesMap[product.id] || 0;
            const dailyVelocity = salesLast30Days / 30;

            let daysLeft = 999;
            if (dailyVelocity > 0) {
                daysLeft = Math.floor(currentStock / dailyVelocity);
            }

            // ─ Phase 2: Regulatory Alert Check ───────────────────────────────
            const regulatoryAlert = checkRegulatoryAlert(product.salt, product.name);

            // ─ Phase 2: Supplier availability signal ─────────────────────────
            const nameLC = (product.name || "").toLowerCase();
            const saltLC = (product.salt || "").toLowerCase();
            const brandLC = (product.brand || "").toLowerCase();

            const matchedSuppliers = allSuppliers.filter(s => {
                const cov = s.coverage.toLowerCase();
                return cov.includes(nameLC.split(' ')[0]) ||
                    (saltLC && cov.includes(saltLC.split(' ')[0])) ||
                    (brandLC && cov.includes(brandLC.split(' ')[0]));
            });

            const supplierCount = matchedSuppliers.length;
            // Simulate supplier stock runway: best-case 30-day velocity based on their assumed inventory
            const lowestSupplierDays = supplierCount > 0 ? Math.floor(20 + Math.random() * 40) : null;

            const topVendor = matchedSuppliers[0] || null;

            // ─ Composite risk score (Phase 2 upgrade) ────────────────────────
            const { compositeScore, riskLevel } = calculateCompositeRisk({
                daysLeft, currentStock, regulatoryAlert, supplierCount, lowestSupplierDays
            });

            // ─ Phase 3: Procurement Suggestion ───────────────────────────────
            const procurement = calculateProcurement({
                currentStock,
                dailyVelocity,
                daysLeft,
                mrp: product.mrp || product.price || 0
            });

            return {
                id: product.id,
                name: product.name,
                category: product.category,
                salt: product.salt,
                brand: product.brand,
                mrp: product.mrp || product.price || 0,
                currentStock,
                salesLast30Days,
                dailyVelocity: dailyVelocity.toFixed(2),
                daysLeft,
                // Phase 2 new fields
                regulatoryAlert,
                supplierCount,
                lowestSupplierDays,
                topVendor: topVendor ? { name: topVendor.name, phone: topVendor.phone, type: topVendor.type } : null,
                compositeScore,
                riskLevel,
                // Phase 3 procurement
                procurement
            };
        });

        // Sort: CRITICAL → HIGH → MEDIUM → LOW, then by composite score
        intelligenceData.sort((a, b) => {
            const weights = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
            if (weights[a.riskLevel] !== weights[b.riskLevel]) {
                return weights[a.riskLevel] - weights[b.riskLevel];
            }
            return b.compositeScore - a.compositeScore;
        });

        // Find alternatives for CRITICAL and HIGH risk items (same salt)
        for (let item of intelligenceData) {
            if (item.riskLevel === "HIGH" || item.riskLevel === "CRITICAL") {
                if (item.salt) {
                    item.alternatives = intelligenceData.filter(alt =>
                        alt.salt &&
                        alt.salt.toLowerCase() === item.salt.toLowerCase() &&
                        alt.id !== item.id &&
                        alt.riskLevel === "LOW"
                    ).map(a => ({ name: a.name, stock: a.currentStock, brand: a.brand }));
                } else {
                    item.alternatives = [];
                }
            }
        }

        // Summary stats
        const summary = {
            total: intelligenceData.length,
            critical: intelligenceData.filter(i => i.riskLevel === "CRITICAL").length,
            high: intelligenceData.filter(i => i.riskLevel === "HIGH").length,
            medium: intelligenceData.filter(i => i.riskLevel === "MEDIUM").length,
            low: intelligenceData.filter(i => i.riskLevel === "LOW").length,
            regulatoryAlerts: intelligenceData.filter(i => i.regulatoryAlert).length,
            noSuppliers: intelligenceData.filter(i => i.supplierCount === 0).length,
            totalReorderCost: intelligenceData
                .filter(i => i.riskLevel === "CRITICAL" || i.riskLevel === "HIGH")
                .reduce((sum, i) => sum + parseFloat(i.procurement.estimatedCost || 0), 0)
                .toFixed(2)
        };

        return NextResponse.json({ success: true, data: intelligenceData, summary });
    } catch (error) {
        console.error("Shortage Predictor Error:", error);
        return NextResponse.json({ success: false, error: "Failed to generate shortage intelligence" }, { status: 500 });
    }
}
