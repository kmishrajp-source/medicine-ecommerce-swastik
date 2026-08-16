/**
 * ABDM Consent Management Service
 * 
 * Handles the workflow of doctors requesting access to a patient's PHR
 * and patients granting/revoking consent.
 */

import prisma from '@/lib/prisma';
import axios from 'axios';

const ABDM_LIVE_MODE = process.env.ABDM_LIVE_MODE === 'true';
const ABDM_GATEWAY_URL = process.env.ABDM_GATEWAY_URL || 'https://dev.abdm.gov.in/gateway/v0.5';

export class ConsentService {
  /**
   * Doctor requests consent to view a patient's health records
   */
  static async requestConsent(doctorId, patientId, purpose) {
    try {
      const request = await prisma.consentRequest.create({
        data: {
          doctorId,
          patientId,
          purpose,
          status: "PENDING",
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days expiry
        }
      });
      
      if (ABDM_LIVE_MODE) {
        try {
          await axios.post(`${ABDM_GATEWAY_URL}/consent-requests/init`, {
            consent: { purpose: { text: purpose }, patient: { id: patientId }, hiu: { id: process.env.ABDM_HIU_ID } }
          }, {
            headers: { 'Authorization': `Bearer ${process.env.ABDM_AUTH_TOKEN}`, 'X-CM-ID': process.env.ABDM_CM_ID }
          });
        } catch (error) {
          console.error("ABDM Live Mode Error (Init Consent):", error.response?.data || error.message);
        }
      }

      return { success: true, request };
    } catch (error) {
      console.error("Error requesting consent:", error);
      return { success: false, error: "Database error" };
    }
  }

  /**
   * Patient grants or denies a pending consent request
   */
  static async resolveConsent(requestId, status) {
    // status should be "GRANTED" or "REVOKED"
    try {
      const request = await prisma.consentRequest.update({
        where: { id: requestId },
        data: { status }
      });
      
      if (ABDM_LIVE_MODE) {
        try {
          await axios.post(`${ABDM_GATEWAY_URL}/consents/status/notify`, {
            notification: { consentId: requestId, status: status }
          }, {
            headers: { 'Authorization': `Bearer ${process.env.ABDM_AUTH_TOKEN}`, 'X-CM-ID': process.env.ABDM_CM_ID }
          });
        } catch (error) {
          console.error("ABDM Live Mode Error (Notify Consent):", error.response?.data || error.message);
        }
      }

      return { success: true, request };
    } catch (error) {
      console.error("Error resolving consent:", error);
      return { success: false, error: "Database error" };
    }
  }

  /**
   * Fetch all active consents for a patient
   */
  static async getPatientConsents(patientId) {
    return await prisma.consentRequest.findMany({
      where: { patientId },
      include: { doctor: true },
      orderBy: { createdAt: 'desc' }
    });
  }
}
