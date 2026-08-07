/**
 * ABDM Digital Prescription Verification Service
 */

import prisma from '@/lib/prisma';

export class PrescriptionService {
  /**
   * Registers a digital prescription for ABDM tracking
   */
  static async registerDigitalPrescription(prescriptionId, qrCodeUrl = null) {
    try {
      const digitalRx = await prisma.digitalPrescription.upsert({
        where: { prescriptionId },
        update: { qrCodeUrl },
        create: {
          prescriptionId,
          qrCodeUrl,
          validationStatus: "UNVERIFIED"
        }
      });
      // TODO: Register with ABDM Prescription Vault API
      return { success: true, digitalRx };
    } catch (error) {
      console.error("Error registering Digital Rx:", error);
      return { success: false, error: "Database error" };
    }
  }

  /**
   * Pharmacist verifies and dispenses a digital prescription
   */
  static async verifyAndDispense(digitalRxId, pharmacistId, itemsDispensed) {
    try {
      const digitalRx = await prisma.digitalPrescription.update({
        where: { id: digitalRxId },
        data: {
          validationStatus: "VERIFIED",
          pharmacistId,
          dispensed: true,
          dispensingRecord: itemsDispensed
        }
      });
      // TODO: Push dispensing event to ABDM Registry
      return { success: true, digitalRx };
    } catch (error) {
      console.error("Error dispensing Digital Rx:", error);
      return { success: false, error: "Database error" };
    }
  }
}
