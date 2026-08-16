import prisma from '@/lib/prisma';

export class InsuranceAgent {
  static async handleQuery(query, userId) {
    if (!userId) {
      return { found: false, message: "Please log in to access your insurance profile." };
    }

    const lowerQuery = query.toLowerCase();

    // Determine intent
    if (lowerQuery.includes("network") || lowerQuery.includes("cashless")) {
      return await this._handleNetworkCheck(query);
    } else if (lowerQuery.includes("claim")) {
      return this._handleClaimAssist();
    } else {
      return await this._handlePolicyInfo(userId);
    }
  }

  static async _handleNetworkCheck(query) {
    // Attempt to extract hospital name from query (very basic heuristic)
    // In production, this requires NLP entity extraction
    const hospitals = await prisma.hospital.findMany({
      where: { name: { contains: "Hospital", mode: 'insensitive' } }, // Dummy filter
      take: 1,
      include: { insuranceNetworks: { include: { company: true } } }
    });

    if (hospitals.length === 0) return { found: false, message: "Could not identify hospital in network check." };

    const hospital = hospitals[0];
    return {
      found: true,
      intent: "NETWORK_CHECK",
      hospitalName: hospital.name,
      acceptedInsurers: hospital.insuranceNetworks.filter(n => n.cashlessEnabled).map(n => n.company.name),
      disclaimer: "Network status can change. Always verify with the hospital TPA desk before admission."
    };
  }

  static _handleClaimAssist() {
    return {
      found: true,
      intent: "CLAIM_ASSIST",
      message: "I can help you prepare your insurance claim. Please ensure you have your Discharge Summary, Final Hospital Bill, and Payment Receipts ready.",
      checklist: [
        "Discharge Summary",
        "Final Hospital Bill with Breakdown",
        "Payment Receipts",
        "Prescriptions and Lab Reports",
        "Cancelled Cheque for NEFT"
      ]
    };
  }

  static async _handlePolicyInfo(userId) {
    const profiles = await prisma.insuranceProfile.findMany({
      where: { userId },
      include: { company: true }
    });

    if (profiles.length === 0) {
      return { found: false, message: "You don't have any insurance policies linked to your profile." };
    }

    return {
      found: true,
      intent: "POLICY_INFO",
      policies: profiles.map(p => ({
        company: p.company.name,
        policyNumber: p.policyNumber,
        coverageAmount: p.coverageAmount,
        renewalDate: p.renewalDate
      })),
      disclaimer: "This is an informational summary. The actual policy document remains authoritative."
    };
  }
}
