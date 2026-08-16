import prisma from '@/lib/prisma';

export class AmbulanceAgent {
  static async handleQuery(query, userId) {
    const isEmergency = query.toLowerCase().includes("emergency") || query.toLowerCase().includes("accident");
    let vehicleType = "Basic";

    if (query.toLowerCase().includes("icu") || query.toLowerCase().includes("advanced") || query.toLowerCase().includes("oxygen")) {
      vehicleType = "Advance";
    }

    const ambulances = await prisma.ambulance.findMany({
      where: {
        isAvailable: true,
        verified: true,
        vehicleType: { contains: vehicleType, mode: 'insensitive' }
      },
      take: 3,
      orderBy: { rating: 'desc' }
    });

    if (!ambulances || ambulances.length === 0) {
      return { 
        found: false, 
        message: "No ambulances currently available on the network in your area.",
        action: "CALL_108_IMMEDIATELY"
      };
    }

    return {
      found: true,
      isEmergency,
      disclaimer: "If this is a life-threatening emergency, please ALSO contact your local emergency services (108) immediately.",
      ambulances: ambulances.map(a => ({
        id: a.id,
        driverName: a.driverName,
        vehicleType: a.vehicleType,
        phone: a.phone,
        estimatedArrivalTime: "10-15 mins" // Hardcoded for demo, normally calculated via routing API
      }))
    };
  }
}
