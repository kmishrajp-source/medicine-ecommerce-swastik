import OpenAI from 'openai';
import prisma from '@/lib/prisma';

export class AmbulanceBookingEngine {
  static async extractDetails(query) {
    if (!process.env.OPENAI_API_KEY) {
      return { vehicleType: "Basic", pickupAddress: "Registered Address" };
    }
    try {
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `Extract ambulance booking details. Return valid JSON only: { "vehicleType": "Basic" | "ICU" | "Advance", "pickupAddress": string }`
          },
          { role: "user", content: query }
        ],
        response_format: { type: "json_object" },
        temperature: 0
      });
      return JSON.parse(completion.choices[0].message.content);
    } catch (e) {
      return { vehicleType: "Basic", pickupAddress: "Registered Address" };
    }
  }

  static async process(query, userId) {
    const isTestMode = process.env.TEST_MODE === 'true' || process.env.TEST_MODE === 'TRUE';
    
    const details = await this.extractDetails(query);
    const vehicleType = details.vehicleType || 'Basic';
    
    let ambulance;
    if (isTestMode) {
      ambulance = { id: 'test-amb-123', driverName: 'Test Driver', vehicleType: vehicleType, pricePerKm: 20, isAvailable: true };
    } else {
      ambulance = await prisma.ambulance.findFirst({
        where: { vehicleType: { contains: vehicleType, mode: 'insensitive' }, isAvailable: true, verified: true },
      });
    }

    if (!ambulance) {
      return {
        intent: "NO_PROVIDER_FOUND",
        message: `I couldn't find an available ${vehicleType} ambulance right now. Would you like me to check for other available ambulances?`,
        data: { vehicleType }
      };
    }

    const q = query.toLowerCase();
    const isConfirming = /\b(yes|yeah|sure|confirm|ok|book it|book an ambulance)\b/i.test(q);

    if (!isConfirming) {
      return {
        intent: "USER_CONFIRMATION_REQUIRED",
        message: `I found an available ${ambulance.vehicleType} ambulance nearby. ETA is approx 15 minutes. Would you like me to book it now?`,
        data: { ambulanceId: ambulance.id, vehicleType: ambulance.vehicleType, pricePerKm: ambulance.pricePerKm }
      };
    }

    let bookingId;
    if (isTestMode) {
      bookingId = 'TEST-AMB-' + Math.floor(Math.random() * 100000);
    } else {
      try {
        const ambBooking = await prisma.ambulanceBooking.create({
          data: {
            userId: userId,
            ambulanceId: ambulance.id,
            pickupAddress: details.pickupAddress || 'User Location',
            dropAddress: 'To be decided',
            status: "Accepted"
          }
        });
        bookingId = ambBooking.id;
      } catch (err) {
        return {
          intent: "BOOKING_FAILED",
          message: "I could not dispatch the ambulance at this time. Please call the emergency number.",
          data: { error: err.message }
        };
      }
    }

    return {
      intent: "BOOKING_CONFIRMED",
      message: `Your ambulance is confirmed and on the way. \nDriver: ${ambulance.driverName}\nVehicle: ${ambulance.vehicleType}\nBooking number: ${bookingId}. \nStay calm, help is arriving.`,
      data: { bookingId, driverName: ambulance.driverName, status: "BOOKING_CONFIRMED" }
    };
  }
}
