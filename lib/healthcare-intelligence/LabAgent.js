import prisma from '@/lib/prisma';

export class LabAgent {
  static async handleQuery(query, userId) {
    const tests = await prisma.labTest.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } }
        ]
      },
      take: 4,
      include: {
        lab: true
      }
    });

    if (!tests || tests.length === 0) {
      return { found: false, message: "No matching lab tests found." };
    }

    return {
      found: true,
      tests: tests.map(t => ({
        id: t.id,
        name: t.name,
        price: t.price,
        labName: t.lab.name,
        homeCollectionAvailable: true, // Assuming true for now
        preparationRequired: t.description || "Fasting may be required. Confirm with lab."
      }))
    };
  }
}
