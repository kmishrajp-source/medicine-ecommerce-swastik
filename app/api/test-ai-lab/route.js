import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  let createdLab = null;
  let createdTest = null;

  try {
    // 1. Check if there's an existing lab test for "blood"
    let labTest = await prisma.labTest.findFirst({
      where: { name: { contains: 'blood', mode: 'insensitive' } },
      include: { lab: true }
    });

    // 2. If not, create a dummy lab and test
    if (!labTest) {
      createdLab = await prisma.lab.create({
        data: {
          name: "Dummy AI Testing Lab",
          address: "Test Address, Gorakhpur",
          phone: "9999999999",
          city: "Gorakhpur",
          verified: true,
          isDirectory: false,
        }
      });

      createdTest = await prisma.labTest.create({
        data: {
          labId: createdLab.id,
          name: "Complete Blood Count (CBC) Test",
          price: 450,
          turnaroundTime: "24 hours"
        }
      });
      labTest = await prisma.labTest.findUnique({ where: { id: createdTest.id }, include: { lab: true } });
    }

    // 3. Simulate the AI Logic for "blood test"
    const testName = "blood test";
    let aiResponse = "";
    
    // Exact logic from route.js
    const searchMatch = testName.match(/(blood|sugar|lipid|cbc|thyroid|urine|liver|kidney).*(test|profile|panel)/i);
    const searchKeyword = searchMatch ? `${searchMatch[1]} ${searchMatch[2]}` : testName;

    const foundTest = await prisma.labTest.findFirst({
        where: { name: { contains: searchKeyword.split(' ')[0], mode: 'insensitive' } },
        include: { lab: true }
    });

    if (foundTest && foundTest.lab) {
        aiResponse = `🔬 **Lab Test Available**\n\n`;
        aiResponse += `I found the **${foundTest.name}** available at **${foundTest.lab.name}**.\n\n`;
        aiResponse += `*   **Price:** ₹${foundTest.price}\n`;
        if (foundTest.turnaroundTime) aiResponse += `*   **Results In:** ${foundTest.turnaroundTime}\n`;
        aiResponse += `\n🔗 **Book Home Collection Now:** https://swastikmed.online/en/labs/${foundTest.lab.id}`;
    } else {
        aiResponse = "Lab test not found after search!";
    }

    // 4. Cleanup dummy data if created
    if (createdTest) {
      await prisma.labTest.delete({ where: { id: createdTest.id } });
    }
    if (createdLab) {
      await prisma.lab.delete({ where: { id: createdLab.id } });
    }

    return NextResponse.json({
        success: true,
        testedLabTest: labTest.name,
        labName: labTest.lab.name,
        aiOutput: aiResponse
    });

  } catch (err) {
    console.error('Test Failed:', err);
    // Attempt cleanup if failed
    if (createdTest) await prisma.labTest.delete({ where: { id: createdTest.id } }).catch(()=>null);
    if (createdLab) await prisma.lab.delete({ where: { id: createdLab.id } }).catch(()=>null);
    
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
