/**
 * ABDM Consent Management Service
 * 
 * Handles the workflow of doctors requesting access to a patient's PHR
 * and patients granting/revoking consent.
 */

import prisma from '@/lib/prisma';

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
      // TODO: Broadcast consent request to ABDM Consent Manager API
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
      // TODO: Sync consent status with ABDM API
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
