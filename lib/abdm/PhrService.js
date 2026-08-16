/**
 * ABDM PHR (Personal Health Record) Service
 */

import prisma from '@/lib/prisma';
import axios from 'axios';

const ABDM_LIVE_MODE = process.env.ABDM_LIVE_MODE === 'true';
const ABDM_GATEWAY_URL = process.env.ABDM_GATEWAY_URL || 'https://dev.abdm.gov.in/gateway/v0.5';

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
      
      if (ABDM_LIVE_MODE) {
        try {
          await axios.post(`${ABDM_GATEWAY_URL}/links/link/add-contexts`, {
            link: { patient: { referenceNumber: userId }, contexts: [{ referenceNumber: record.id, display: recordType }] }
          }, {
            headers: { 'Authorization': `Bearer ${process.env.ABDM_AUTH_TOKEN}`, 'X-CM-ID': process.env.ABDM_CM_ID }
          });
        } catch (error) {
          console.error("ABDM Live Mode Error (Add PHR Context):", error.response?.data || error.message);
        }
      }

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
