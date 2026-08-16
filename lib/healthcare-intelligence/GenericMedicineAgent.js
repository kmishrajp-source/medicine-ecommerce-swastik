import prisma from '@/lib/prisma';

export class GenericMedicineAgent {
  static async handleQuery(query, userId) {
    // 1. Search for matching medicine names or active ingredients
    const products = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { salt: { contains: query, mode: 'insensitive' } },
          { composition: { contains: query, mode: 'insensitive' } }
        ]
      },
      take: 5,
      include: {
        genericTargetRelations: {
          include: { sourceProduct: true }
        },
        genericSourceRelations: {
          include: { targetProduct: true }
        }
      }
    });

    if (!products || products.length === 0) {
      return { found: false, message: "No matching medicines found for your query." };
    }

    const primaryProduct = products[0];

    // 2. Identify equivalents based on the structured relations
    let exactEquivalents = [];
    let therapeuticAlternatives = [];

    // Analyze target relations (where this product is the source)
    for (const relation of primaryProduct.genericSourceRelations) {
      if (relation.relationType === "EXACT_EQUIVALENT") exactEquivalents.push(relation.targetProduct);
      if (relation.relationType === "THERAPEUTIC_ALTERNATIVE") therapeuticAlternatives.push(relation.targetProduct);
    }

    // 3. Assemble response with STRICT Medical Safety constraints
    return {
      found: true,
      primaryMedicine: {
        name: primaryProduct.name,
        activeIngredient: primaryProduct.salt || primaryProduct.composition,
        strength: primaryProduct.packSize,
        price: primaryProduct.price,
        requiresPrescription: primaryProduct.requiresPrescription
      },
      exactEquivalents: exactEquivalents.map(e => ({
        name: e.name, price: e.price, manufacturer: e.manufacturer
      })),
      therapeuticAlternatives: therapeuticAlternatives.map(t => ({
        name: t.name, price: t.price, manufacturer: t.manufacturer
      })),
      safetyDisclaimer: "This product appears to contain the same active ingredient and strength. Confirm suitability with a qualified healthcare professional before substitution."
    };
  }
}
