import prisma from '@/lib/prisma';

export class LabAgent {
  static async handleQuery(query, userId) {
    const q = query.toLowerCase();
    
    // Extract keywords (ignore common words)
    const keywords = q
      .replace(/book|find|test|lab|search|with|home|collection/gi, '')
      .trim()
      .split(/\s+/)
      .filter(k => k.length > 2);
      
    // Try DB first
    let tests = [];
    try {
      if (keywords.length > 0) {
        const keywordConditions = keywords.map(kw => ({
          name: { contains: kw, mode: 'insensitive' }
        }));
        
        tests = await prisma.labTest.findMany({
          where: {
            OR: keywordConditions
          },
          take: 4,
          include: {
            lab: true
          }
        });
      } else {
        // If no specific keyword, try matching the whole query or just fetch some
        tests = await prisma.labTest.findMany({
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
      }
    } catch (dbErr) {
      console.warn('[LabAgent] DB query failed:', dbErr.message);
    }

    if (!tests || tests.length === 0) {
      // Smart Fallback
      return { 
        found: true, 
        message: "🧪 **Swastik Lab Network**\n\nWe provide 500+ diagnostic tests with **Free Home Sample Collection**.\n\nTo book a test (like CBC, Thyroid, Diabetes Panel, etc.):\n1. Visit the **Lab Tests** section\n2. Add tests to cart\n3. Schedule your home collection\n\nNeed help? Call our support line.",
        actions: [
          { label: "Book Lab Test", link: "/lab-tests" },
          { label: "Call Support", link: "tel:917992122974" }
        ]
      };
    }

    return {
      found: true,
      tests: tests.map(t => ({
        id: t.id,
        name: t.name,
        price: t.price,
        labName: t.lab.name,
        homeCollectionAvailable: true,
        preparationRequired: t.description || "Fasting may be required. Confirm with lab."
      }))
    };
  }
}
