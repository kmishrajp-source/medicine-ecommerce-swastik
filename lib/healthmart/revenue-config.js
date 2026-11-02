/**
 * Swastik HealthMart — Configurable Marketplace Revenue & Monetization Engine
 * 
 * Supports multi-tiered business models:
 * 1. Free Verified Listings
 * 2. Premium / Featured Placement Subscriptions
 * 3. Pay-per-lead Access for Commercial Procurement
 * 4. Enterprise B2B Procurement Support
 * 5. Lead Quality Guarantee & Dispute Policy
 */

export const HEALTHMART_BUSINESS_MODEL = {
  // Free tier
  freeListingTier: {
    name: "Free Verified Listing",
    monthlyPriceINR: 0,
    monthlyFreeLeads: 5,
    features: [
      "Standard Profile Listing in Category Directory",
      "Regulatory Credential Verification Badge",
      "Receive Direct RFQs matching Service Radius",
      "Submit itemized formal quotations"
    ]
  },

  // Paid Subscription tiers
  subscriptionTiers: [
    {
      id: "plan-silver",
      name: "Silver Business Plan",
      monthlyPriceINR: 1499,
      monthlyLeadQuota: 25,
      features: [
        "Priority match in Gorakhpur & Eastern UP cluster",
        "Up to 25 verified high-intent RFQs/month",
        "Direct Buyer Phone Contact Unlock",
        "WhatsApp instant quotation alerts",
        "Dispute refund guarantee on unreachable leads"
      ]
    },
    {
      id: "plan-gold",
      name: "Gold Regional Partner",
      monthlyPriceINR: 3999,
      monthlyLeadQuota: 75,
      isFeatured: true,
      features: [
        "Top 3 Featured Placement in Category Directory",
        "Up to 75 verified procurement RFQs/month",
        "Direct Hospital & Institutional RFQ routing",
        "Dedicated Swastik Key Account Manager",
        "Unlimited quotation revisions & messaging"
      ]
    },
    {
      id: "plan-enterprise",
      name: "Enterprise Healthcare Procurement Tier",
      monthlyPriceINR: 9999,
      monthlyLeadQuota: 250,
      features: [
        "Pan-India Regional RFQ Access",
        "Government Tender & Gem Bid Notifications",
        "Custom ERP / ABDM HIMS API Integration",
        "Institutional escrow & contract settlement support"
      ]
    }
  ],

  // Pay-per-Lead Pricing (Category-specific)
  leadUnlockPricingINR: {
    medical_equipment: 299,
    staffing: 249,
    corporate: 399,
    hospital: 199,
    laboratory: 99,
    ambulance: 79,
    pharmacy: 99,
    healthcare_it: 499,
    business_services: 199
  },

  // Lead Quality Guarantee & Dispute Policy
  leadQualityPolicy: {
    guarantee: "100% Verified Contact Guarantee",
    disputeWindowHours: 48,
    eligibleDisputeReasons: [
      "Wrong / Disconnected Phone Number",
      "Buyer Already Procured before distribution",
      "Out of Service Territory / Wrong Location",
      "Duplicate Lead Submission",
      "Spam / Fraudulent Requirement"
    ],
    resolutionTerms: "Full lead credit refund within 24 hours of admin review."
  }
};

