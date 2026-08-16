/**
 * ABDM ABHA (Ayushman Bharat Health Account) Service
 * 
 * Stub implementation ready for future NHA API integration.
 * Currently uses local database models to simulate ABDM workflows.
 */

import prisma from '@/lib/prisma';
import axios from 'axios';

const ABDM_LIVE_MODE = process.env.ABDM_LIVE_MODE === 'true';
const ABDM_GATEWAY_URL = process.env.ABDM_GATEWAY_URL || 'https://dev.abdm.gov.in/gateway/v0.5';

export class AbhaService {
  /**
   * Generates OTP for creating or linking an ABHA ID via Aadhaar/Mobile
   */
  static async generateOtp(identifier, method = 'MOBILE') {
    if (ABDM_LIVE_MODE) {
      try {
        const response = await axios.post(`${ABDM_GATEWAY_URL}/registration/mobile/generateOtp`, {
          mobile: identifier
        }, {
          headers: { 'Authorization': `Bearer ${process.env.ABDM_AUTH_TOKEN}`, 'X-CM-ID': process.env.ABDM_CM_ID }
        });
        return { success: true, message: `OTP sent to ${identifier}`, transactionId: response.data.txnId };
      } catch (error) {
        console.error("ABDM Live Mode Error:", error.response?.data || error.message);
        return { success: false, error: "Failed to communicate with ABDM Gateway" };
      }
    }
    
    // Fallback stub for development
    return { success: true, message: `OTP sent to ${identifier}`, transactionId: "txn-stub-12345" };
  }

  /**
   * Verifies the OTP to authenticate the ABHA profile creation/linking
   */
  static async verifyOtp(transactionId, otp) {
    if (ABDM_LIVE_MODE) {
      try {
        const response = await axios.post(`${ABDM_GATEWAY_URL}/registration/mobile/verifyOtp`, {
          txnId: transactionId,
          otp: otp
        }, {
          headers: { 'Authorization': `Bearer ${process.env.ABDM_AUTH_TOKEN}`, 'X-CM-ID': process.env.ABDM_CM_ID }
        });
        return { success: true, token: response.data.token, abhaProfile: response.data.abhaProfile };
      } catch (error) {
        console.error("ABDM Live Mode Error:", error.response?.data || error.message);
        return { success: false, error: "Invalid OTP from ABDM Gateway" };
      }
    }

    // Fallback stub for development
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
