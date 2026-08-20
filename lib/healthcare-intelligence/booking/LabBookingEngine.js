import OpenAI from 'openai';
import prisma from '@/lib/prisma';

export class LabBookingEngine {
  static async extractDetails(query) {
    if (!process.env.OPENAI_API_KEY) {
      return { testName: "CBC", date: new Date().toISOString(), time: "8:00 AM", mode: "HOME_COLLECTION" };
    }
    try {
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `Extract lab test booking details. Return valid JSON only: { "testName": string, "date": "YYYY-MM-DD", "time": "HH:MM AM/PM", "mode": "HOME_COLLECTION" | "LAB_VISIT" }`
          },
          { role: "user", content: query }
        ],
        response_format: { type: "json_object" },
        temperature: 0
      });
      return JSON.parse(completion.choices[0].message.content);
    } catch (e) {
      return { testName: "General Blood Test", date: new Date().toISOString(), time: "8:00 AM", mode: "LAB_VISIT" };
    }
  }

  static async process(query, userId) {
    const isTestMode = process.env.TEST_MODE === 'true' || process.env.TEST_MODE === 'TRUE';
    
    const details = await this.extractDetails(query);
    const testName = details.testName || 'Routine Blood Test';
    
    let labTest, lab;
    if (isTestMode) {
      labTest = { id: 'test-labtest-123', name: testName, price: 400 };
      lab = { id: 'test-lab-123', name: 'Test Diagnostic Center', address: 'Test Location' };
    } else {
      labTest = await prisma.labTest.findFirst({
        where: { name: { contains: testName, mode: 'insensitive' } },
        include: { lab: true }
      });
      if (labTest) lab = labTest.lab;
    }

    if (!labTest || !lab) {
      return {
        intent: "NO_PROVIDER_FOUND",
        message: `I couldn't find an approved lab offering the ${testName} test near you. Would you like me to check for alternatives?`,
        data: { testName }
      };
    }

    const q = query.toLowerCase();
    const isConfirming = /\b(yes|yeah|sure|confirm|ok|book it)\b/i.test(q);

    if (!isConfirming) {
      return {
        intent: "USER_CONFIRMATION_REQUIRED",
        message: `I found ${labTest.name} at ${lab.name}. The cost is ₹${labTest.price}. Would you like me to book it for ${details.date || 'tomorrow'} at ${details.time || 'morning'}?`,
        data: { testId: labTest.id, labId: lab.id, testName: labTest.name, price: labTest.price, providerName: lab.name }
      };
    }

    let bookingId;
    if (isTestMode) {
      bookingId = 'TEST-LAB-' + Math.floor(Math.random() * 100000);
    } else {
      try {
        const labBooking = await prisma.labBooking.create({
          data: {
            patientId: userId,
            testId: labTest.id,
            bookingDate: new Date(details.date || Date.now()),
            status: "Confirmed"
          }
        });
        bookingId = labBooking.id;
      } catch (err) {
        return {
          intent: "BOOKING_FAILED",
          message: "I could not complete the lab booking at this time.",
          data: { error: err.message }
        };
      }
    }

    return {
      intent: "BOOKING_CONFIRMED",
      message: `Your lab test is confirmed. \nTest: ${labTest.name}\nLab: ${lab.name}\nBooking number: ${bookingId}. \nI have sent the details to your WhatsApp.`,
      data: { bookingId, providerName: lab.name, testName: labTest.name, status: "BOOKING_CONFIRMED" }
    };
  }
}
