import prisma from '@/lib/prisma';

export class HospitalAgent {
  static async handleQuery(query, userId) {
    // Basic service mapping
    let matchedDepartment = null;
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes("cardiology") || lowerQuery.includes("heart")) matchedDepartment = "Cardiology";
    if (lowerQuery.includes("emergency") || lowerQuery.includes("casualty")) matchedDepartment = "Emergency";
    if (lowerQuery.includes("pediatric") || lowerQuery.includes("child")) matchedDepartment = "Pediatrics";

    const whereClause = matchedDepartment ? {
      hospitalServices: { some: { department: { contains: matchedDepartment, mode: 'insensitive' } } }
    } : {
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { specialties: { contains: query, mode: 'insensitive' } }
      ]
    };

    const hospitals = await prisma.hospital.findMany({
      where: whereClause,
      take: 3,
      include: {
        hospitalServices: true,
        insuranceNetworks: {
          include: { company: true }
        }
      },
      orderBy: { rating: 'desc' }
    });

    if (!hospitals || hospitals.length === 0) {
      return { found: false, message: "No hospitals found matching your criteria in the network." };
    }

    return {
      found: true,
      hospitals: hospitals.map(h => ({
        id: h.id,
        name: h.name,
        address: h.address,
        rating: h.rating,
        verified: h.verified,
        services: h.hospitalServices.map(s => s.department),
        acceptedInsurances: h.insuranceNetworks.map(n => n.company.name),
        contact: h.phone
      }))
    };
  }
}
