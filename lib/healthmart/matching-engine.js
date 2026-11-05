/**
 * Swastik HealthMart — Transparent Rules-Based Matching & Distribution Engine
 * 
 * Accurately pairs incoming buyer enquiries/RFQs with eligible, verified providers
 * without spamming. Produces auditable match reasons for admin review.
 */

import { getUnifiedProviders } from "./provider-adapter.js";

/**
 * Score and match eligible providers for a given Buyer Enquiry
 * 
 * @param {Object} enquiry - The submitted buyer requirement
 * @param {Object} options - Matching constraints (maxMatches, minScore, cityRadius)
 * @returns {Array} List of matched providers with score and audit reasons
 */
export async function matchProvidersForEnquiry(enquiry, options = {}) {
  const maxMatches = options.maxMatches || 4; // Max 4 verified providers receive the opportunity
  const minScore = options.minScore || 50;

  // 1. Fetch all providers for the category
  const candidates = await getUnifiedProviders({
    categorySlug: enquiry.categorySlug || undefined
  });

  const scoredMatches = candidates.map(provider => {
    let score = 0;
    const matchReasons = [];
    const penaltyReasons = [];

    // Rule 1: Exact Service Type & Category Match (Base 40 pts)
    if (provider.categorySlug === enquiry.categorySlug || provider.serviceType === enquiry.serviceType) {
      score += 40;
      matchReasons.push("Exact Healthcare Category Match");
    } else {
      penaltyReasons.push("Mismatch in primary service category");
    }

    // Rule 2: Geographical Reach & Location (Up to 30 pts)
    const targetCity = (enquiry.locationCity || "Gorakhpur").toLowerCase();
    const servesCity = (provider.serviceLocations || []).some(loc => 
      loc.toLowerCase().includes(targetCity) || loc.toLowerCase().includes("pan india") || loc.toLowerCase().includes("uttar pradesh")
    );

    if (servesCity) {
      score += 30;
      matchReasons.push(`Active service coverage in ${enquiry.locationCity || "Gorakhpur"}`);
    } else {
      score += 5;
      penaltyReasons.push(`Provider location radius does not explicitly list ${targetCity}`);
    }

    // Rule 3: Regulatory Verification & Credentials (Up to 20 pts)
    if (provider.isVerified) {
      score += 20;
      matchReasons.push(`Verified Credentials (${provider.verificationBadge || "SWASTIK_VERIFIED"})`);
    } else {
      penaltyReasons.push("Provider credentials submitted but pending final verification");
    }

    // Rule 4: Responsiveness & Reputation (Up to 10 pts)
    if (provider.rating && provider.rating >= 4.5) {
      score += 5;
      matchReasons.push(`High satisfaction rating (${provider.rating} ★)`);
    }
    if (provider.avgResponseTimeHours && provider.avgResponseTimeHours <= 2) {
      score += 5;
      matchReasons.push(`Fast quotation turnaround (< ${provider.avgResponseTimeHours} hrs)`);
    }

    return {
      provider,
      providerId: provider.id,
      providerType: provider.providerType,
      businessName: provider.businessName,
      matchScore: Math.min(100, score),
      isEligible: score >= minScore,
      matchReasons,
      penaltyReasons
    };
  });

  // Filter eligible and sort descending by match score
  const eligibleMatches = scoredMatches
    .filter(m => m.isEligible)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, maxMatches);

  return {
    totalEvaluated: candidates.length,
    eligibleCount: eligibleMatches.length,
    matches: eligibleMatches,
    rejectedAudit: scoredMatches.filter(m => !m.isEligible)
  };
}

/**
 * Audit explanation generator for administrators
 */
export function formatMatchingAudit(matchResult) {
  return {
    summary: `Matched ${matchResult.eligibleCount} out of ${matchResult.totalEvaluated} candidate providers.`,
    distributionList: matchResult.matches.map(m => ({
      provider: m.businessName,
      score: `${m.matchScore}%`,
      principalReasons: m.matchReasons
    })),
    rejectedCount: matchResult.rejectedAudit.length
  };
}

