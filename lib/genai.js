/**
 * lib/genai.js
 * GenAI Explainer Service — Gemini-powered natural language shortage risk reports.
 * Falls back to deterministic explanation builder if API key is missing or unavailable.
 */

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
const GEMINI_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

/**
 * Build a deterministic explanation when GenAI is unavailable.
 * This is production-safe — always returns a useful response.
 */
function buildDeterministicExplanation(data) {
    const { name, riskLevel, currentStock, salesLast30Days, dailyVelocity, daysLeft, regulatoryAlert, supplierCount, lowestSupplierDays, category, salt } = data;

    let reasons = [];
    let actions = [];

    // Risk-driven language
    if (currentStock === 0) {
        reasons.push(`**${name}** has completely exhausted its on-hand stock — immediate procurement is critical.`);
    } else if (daysLeft < 7) {
        reasons.push(`At the current sales velocity of **${dailyVelocity} units/day**, the existing stock of ${currentStock} units will be depleted in approximately **${daysLeft} days**.`);
    } else if (daysLeft < 30) {
        reasons.push(`Demand for **${name}** has outpaced typical inventory cycles. With ${salesLast30Days} units sold in the past 30 days (${dailyVelocity}/day), a shortage is projected in **${daysLeft} days**.`);
    } else {
        reasons.push(`**${name}** has a moderate risk profile based on recent demand trends of ${dailyVelocity} units/day.`);
    }

    if (regulatoryAlert) {
        reasons.push(`🚨 **Regulatory Alert:** A known supply disruption has been flagged by drug control authorities for this molecule (${salt || 'active ingredient'}). This significantly elevates shortage risk beyond just local demand patterns.`);
    }

    if (supplierCount === 0) {
        reasons.push(`No active verified B2B suppliers in your distributor directory currently carry this product, removing your emergency restock safety net.`);
    } else if (supplierCount < 2) {
        reasons.push(`Only **${supplierCount} verified supplier** in your B2B network stocks this product — single-supplier dependency increases vulnerability to supply shocks.`);
    }

    if (lowestSupplierDays && lowestSupplierDays < 15) {
        reasons.push(`The best-stocked supplier in your network also has limited inventory — estimated to hold only **${lowestSupplierDays} days** of supply at current demand.`);
    }

    if (category) {
        reasons.push(`As a **${category}** medicine, seasonal demand spikes (e.g. monsoon infections, exam stress) may further accelerate depletion.`);
    }

    // Actions
    if (riskLevel === "CRITICAL" || riskLevel === "HIGH") {
        actions = [
            `Place an emergency procurement order within the next **${Math.min(daysLeft - 2, 2)} days** to avoid stock-out.`,
            `Activate your Swastik B2B Network broadcast to source stock from verified distributors.`,
            salt ? `Consider stocking therapeutically equivalent alternatives sharing the **${salt}** salt as a temporary buffer.` : `Review your formulary for generic alternatives if restock is delayed beyond 48 hours.`
        ];
    } else {
        actions = [
            `Schedule a routine reorder for ${name} within the next **${Math.max(daysLeft - 20, 5)} days** to maintain a comfortable buffer.`,
            `Review your reorder point and consider increasing safety stock if seasonal demand spikes are expected.`
        ];
    }

    const summary = `Based on a composite analysis of your internal sales data, B2B supplier network availability${regulatoryAlert ? ', and active regulatory intelligence' : ', and market demand patterns'}, **${name}** has been classified as **${riskLevel} risk**.`;

    return {
        summary,
        reasons,
        actions,
        source: "Swastik AI Engine (Deterministic Mode)"
    };
}

/**
 * Generate a GenAI-powered shortage explanation.
 * Uses Gemini API if available, falls back to deterministic builder.
 */
export async function explainShortage(drugData) {
    const { name, riskLevel, currentStock, salesLast30Days, dailyVelocity, daysLeft, regulatoryAlert, supplierCount, lowestSupplierDays, category, salt, procurementQty, vendorName } = drugData;

    // Try Gemini API
    if (GEMINI_API_KEY) {
        try {
            const prompt = `You are Swastik Medicare's AI Supply Chain Analyst. Generate a concise, professional shortage risk explanation for a pharmacist-administrator audience.

DRUG ANALYSIS REPORT:
- Medicine: ${name}
- Category: ${category || "General"}
- Active Ingredient (Salt): ${salt || "Unknown"}
- Current Stock: ${currentStock} units
- 30-Day Sales: ${salesLast30Days} units (${dailyVelocity} units/day)
- Estimated Days to Depletion: ${daysLeft === 999 ? "Stable (no active sales)" : daysLeft + " days"}
- Risk Level: ${riskLevel}
- Regulatory Alert: ${regulatoryAlert ? "YES — Supply disruption flagged by authorities" : "No active alerts"}
- Verified Supplier Count: ${supplierCount}
- Best Supplier Stock Runway: ${lowestSupplierDays ? lowestSupplierDays + " days" : "Unknown"}
- Recommended Reorder Qty: ${procurementQty || "Calculating..."}
- Top Suggested Vendor: ${vendorName || "See B2B Directory"}

Write a 3-paragraph analysis in clear, actionable language:
1. Why this medicine is at ${riskLevel} risk right now (cite specific data points)
2. What supply chain and regulatory factors are contributing
3. What the admin should do immediately (concrete next steps)

Keep it under 200 words. Be direct, professional, and data-driven.`;

            const response = await fetch(`${GEMINI_ENDPOINT}?key=${GEMINI_API_KEY}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: { temperature: 0.3, maxOutputTokens: 400 }
                })
            });

            if (response.ok) {
                const result = await response.json();
                const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
                if (text) {
                    return {
                        summary: text,
                        source: "Gemini AI",
                        isGenAI: true
                    };
                }
            }
        } catch (err) {
            console.warn("Gemini API unavailable, using deterministic fallback:", err.message);
        }
    }

    // Deterministic fallback
    return buildDeterministicExplanation(drugData);
}
