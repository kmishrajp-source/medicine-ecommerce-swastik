/**
 * ABDM PHR (Personal Health Record) Service
 */

import prisma from '@/lib/prisma';

export class PhrService {
  /**
   * Securely adds a new digital health record to the patient's vault
   */
  static async addRecord(userId, recordType, documentUrl, issuedBy = null) {
    try {
      const record = await prisma.digitalHealthRecord.create({
        data: {
          userId,
          recordType, // PRESCRIPTION, LAB_REPORT, VACCINE, CONSULTATION
          documentUrl,
          issuedBy,
          isShared: false
        }
      });
      // TODO: Push record metadata to ABDM Health Information Provider (HIP) API
      return { success: true, record };
    } catch (error) {
      console.error("Error adding PHR:", error);
      return { success: false, error: "Database error" };
    }
  }

  /**
   * Fetches all health records for a user
   */
  static async getPatientRecords(userId) {
    try {
      const records = await prisma.digitalHealthRecord.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' }
      });
      return { success: true, records };
    } catch (error) {
      console.error("Error fetching PHR:", error);
      return { success: false, error: "Database error" };
    }
  }
}
