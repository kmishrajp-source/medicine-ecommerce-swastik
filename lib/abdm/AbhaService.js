/**
 * ABDM ABHA (Ayushman Bharat Health Account) Service
 * 
 * Stub implementation ready for future NHA API integration.
 * Currently uses local database models to simulate ABDM workflows.
 */

import prisma from '@/lib/prisma';

export class AbhaService {
  /**
   * Generates OTP for creating or linking an ABHA ID via Aadhaar/Mobile
   */
  static async generateOtp(identifier, method = 'MOBILE') {
    // TODO: Integrate with NHA Gateway API (/v1/registration/mobile/generateOtp)
    return { success: true, message: `OTP sent to ${identifier}`, transactionId: "txn-stub-12345" };
  }

  /**
   * Verifies the OTP to authenticate the ABHA profile creation/linking
   */
  static async verifyOtp(transactionId, otp) {
    // TODO: Integrate with NHA Gateway API (/v1/registration/mobile/verifyOtp)
    if (otp === "123456") {
      return { success: true, token: "abdm-auth-token-stub", abhaProfile: { name: "Test User", abhaNumber: "91-1234-5678-9012" } };
    }
    return { success: false, error: "Invalid OTP" };
  }

  /**
   * Links a verified ABHA profile to a Swastik Medicare User Account
   */
  static async linkAbhaToUser(userId, abhaDetails) {
    try {
      const profile = await prisma.abhaProfile.upsert({
        where: { userId },
        update: {
          abhaNumber: abhaDetails.abhaNumber,
          abhaAddress: abhaDetails.abhaAddress,
          kycStatus: "VERIFIED"
        },
        create: {
          userId,
          abhaNumber: abhaDetails.abhaNumber,
          abhaAddress: abhaDetails.abhaAddress,
          kycStatus: "VERIFIED"
        }
      });
      return { success: true, profile };
    } catch (error) {
      console.error("Error linking ABHA:", error);
      return { success: false, error: "Database error linking ABHA" };
    }
  }

  /**
   * Fetches the ABHA profile for a given user
   */
  static async getAbhaProfile(userId) {
    const profile = await prisma.abhaProfile.findUnique({ where: { userId } });
    return { success: true, profile };
  }
}
