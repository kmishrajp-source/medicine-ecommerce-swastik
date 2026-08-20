import { PrismaClient } from '@prisma/client';
import OpenAI from 'openai';

const prisma = new PrismaClient();

export class SpeakToBuyAgent {
  /**
   * Main entry point for the Speak-To-Buy flow.
   * This handles the state machine transitions.
   */
  static async processVoiceIntent(normalizedQuery, userId) {
    if (!userId) {
      return {
        message: "I can help with your order. Please sign in to your Swastik account first.",
        intent: "AUTH_REQUIRED",
        data: null
      };
    }

    try {
      // 1. Fetch or Create Active Session
      let activeIntent = await prisma.voiceOrderIntent.findFirst({
        where: { 
          userId, 
          state: { notIn: ["DELIVERED", "CANCELLED", "FAILED"] }
        },
        orderBy: { createdAt: 'desc' }
      });

      if (!activeIntent) {
        activeIntent = await prisma.voiceOrderIntent.create({
          data: {
            userId,
            rawTranscript: normalizedQuery,
            state: "INITIATED"
          }
        });
      }

      // 2. State Machine Routing
      switch (activeIntent.state) {
        case "INITIATED":
          return await this.handleMedicineIdentification(activeIntent, normalizedQuery);
        
        case "RX_CHECK":
          return await this.handlePrescriptionCheck(activeIntent, normalizedQuery);
          
        case "RETAILER_DISCOVERY":
          return await this.handleRetailerDiscovery(activeIntent);
          
        case "USER_CONFIRMATION":
          return await this.handleUserConfirmation(activeIntent, normalizedQuery);
          
        case "PAYMENT_PENDING":
          return await this.handlePayment(activeIntent);
          
        default:
          return {
            message: "I am processing your current order.",
            intent: "PROCESSING",
            data: { state: activeIntent.state }
          };
      }

    } catch (error) {
      console.error("SpeakToBuyAgent Error:", error);
      return {
        message: "Sorry, I encountered an issue processing your order. Please try again.",
        intent: "SYSTEM_ERROR"
      };
    }
  }

  static async handleMedicineIdentification(intent, query) {
    if (!process.env.OPENAI_API_KEY) {
      return { message: "AI Engine is offline.", intent: "SYSTEM_ERROR" };
    }
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    
    // Extract Medicine Details
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "Extract the medicine name, strength, and quantity from the user's speech. Respond ONLY in valid JSON. Example: { \"medicineName\": \"Paracetamol\", \"strength\": \"500mg\", \"quantity\": 10 }"
        },
        { role: "user", content: query }
      ],
      response_format: { type: "json_object" },
      temperature: 0.1
    });

    const extraction = JSON.parse(completion.choices[0].message.content);

    if (!extraction.medicineName) {
      return {
        message: "I didn't quite catch the medicine name. Could you please repeat it?",
        intent: "CLARIFICATION_NEEDED"
      };
    }

    // Update Intent
    await prisma.voiceOrderIntent.update({
      where: { id: intent.id },
      data: {
        medicineName: extraction.medicineName,
        strength: extraction.strength,
        quantity: extraction.quantity || 1,
        state: "RX_CHECK"
      }
    });

    return this.handlePrescriptionCheck({ ...intent, ...extraction }, query);
  }

  static async handlePrescriptionCheck(intent, query) {
    // Look up compliance in DB
    const product = await prisma.product.findFirst({
      where: { name: { contains: intent.medicineName, mode: 'insensitive' } },
      include: { compliance: true }
    });

    if (!product) {
      return {
        message: `I couldn't find exactly ${intent.medicineName}. We require precise product matching for safety.`,
        intent: "PRODUCT_NOT_FOUND"
      };
    }

    const requiresRx = product.requiresPrescription || product.compliance?.isPrescriptionRequired;

    if (requiresRx && !intent.prescriptionId) {
      return {
        message: `This medicine requires a valid prescription. Please upload or provide the prescription so it can be reviewed according to applicable requirements.`,
        intent: "PRESCRIPTION_REQUIRED",
        data: {
          showUploadUI: true
        }
      };
    }

    // Move to next state
    await prisma.voiceOrderIntent.update({
      where: { id: intent.id },
      data: { state: "RETAILER_DISCOVERY" }
    });

    return this.handleRetailerDiscovery(intent);
  }

  static async handleRetailerDiscovery(intent) {
    // In production, this would query nearby Retailers using lat/lng and trigger the RetailerRequestEngine
    // For this simulation, we simulate finding a retailer
    
    const mockPrice = 120.0;
    const deliveryCharge = 50.0;
    const total = mockPrice + deliveryCharge;

    await prisma.voiceOrderIntent.update({
      where: { id: intent.id },
      data: { 
        state: "USER_CONFIRMATION",
        pricingDetails: { mrp: mockPrice, margin: 10.0, deliveryFee: deliveryCharge, totalCustomerPrice: total }
      }
    });

    return {
      message: `I found the requested product at a licensed nearby retailer. The total is ₹${total} including delivery. Would you like me to place the order?`,
      intent: "USER_CONFIRMATION_NEEDED",
      data: {
        medicineName: intent.medicineName,
        total: total,
        showConfirmUI: true
      }
    };
  }

  static async handleUserConfirmation(intent, query) {
    const isYes = /yes|yeah|sure|confirm|ok|place/i.test(query);

    if (isYes) {
      await prisma.voiceOrderIntent.update({
        where: { id: intent.id },
        data: { state: "PAYMENT_PENDING" }
      });

      return {
        message: "Your order has been placed. I am arranging payment, pickup and delivery.",
        intent: "ORDER_PLACED",
        data: {
          showPaymentUI: true,
          orderId: intent.id
        }
      };
    } else {
      await prisma.voiceOrderIntent.update({
        where: { id: intent.id },
        data: { state: "CANCELLED" }
      });
      return {
        message: "Order cancelled. Let me know if you need anything else.",
        intent: "ORDER_CANCELLED"
      };
    }
  }
  
  static async handlePayment(intent) {
      // Simulate Payment Pending State
      return {
          message: "Please complete the payment on your screen.",
          intent: "PAYMENT_PENDING",
          data: {
             showPaymentUI: true,
             orderId: intent.id
          }
      };
  }
}
