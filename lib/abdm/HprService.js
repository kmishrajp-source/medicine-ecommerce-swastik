/**
 * ABDM HPR (Healthcare Professionals Registry) Service
 */

import prisma from '@/lib/prisma';

export class HprService {
  /**
   * Registers a doctor with HPR details
   */
  static async registerDoctorHpr(doctorId, hprId, registrationNumber, medicalCouncil) {
    try {
      const profile = await prisma.doctorHprProfile.upsert({
        where: { doctorId },
        update: {
          hprId,
          registrationNumber,
          medicalCouncil,
          hprStatus: "PENDING"
        },
        create: {
          doctorId,
          hprId,
          registrationNumber,
          medicalCouncil,
          hprStatus: "PENDING"
        }
      });
      // TODO: Call ABDM HPR API to verify credentials
      return { success: true, profile };
    } catch (error) {
      console.error("Error registering HPR:", error);
      return { success: false, error: "Database error" };
    }
  }

  static async getDoctorHpr(doctorId) {
    const profile = await prisma.doctorHprProfile.findUnique({ where: { doctorId } });
    return { success: true, profile };
  }
}
