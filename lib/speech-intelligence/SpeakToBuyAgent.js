import { PrismaClient } from '@prisma/client';
import OpenAI from 'openai';

const prisma = new PrismaClient();

/**
 * Speak-To-Buy Agent
 * Stateless version — works without requiring VoiceOrderIntent DB table.
 * Uses OpenAI for medicine extraction and Prisma Product catalog for OTC/Rx check.
 */
export class SpeakToBuyAgent {
  static async processVoiceIntent(normalizedQuery, userId) {
    if (!userId) {
      return {
        message: "I can help with your order. Please sign in to your Swastik account first.",
        intent: "AUTH_REQUIRED",
        data: { message: "Please sign in to your Swastik account to place a voice order." }
      };
    }

    try {
      // Step 1: Extract medicine details using OpenAI
      const extraction = await this.extractMedicineDetails(normalizedQuery);

      if (!extraction || !extraction.medicineName) {
        return {
          message: "I didn't catch the medicine name. Could you please repeat it clearly?",
          intent: "CLARIFICATION_NEEDED",
          data: { message: "I didn't catch the medicine name. Could you please repeat it clearly?" }
        };
      }

      // Step 2: Look up product in catalogue
      let product = null;
      try {
        product = await prisma.product.findFirst({
          where: { name: { contains: extraction.medicineName, mode: 'insensitive' } },
          select: {
            id: true,
            name: true,
            price: true,
            requiresPrescription: true,
            isOTC: true,
            category: true
          }
        });
      } catch (dbErr) {
        // DB lookup failed — continue with just OpenAI-based classification
        console.warn("Product DB lookup failed, using AI classification:", dbErr.message);
      }

      // Step 3: Determine OTC vs Rx (from DB or AI fallback)
      const requiresRx = product?.requiresPrescription ?? await this.classifyRxViaAI(extraction.medicineName);

      // Step 4: Return appropriate workflow response
      if (requiresRx) {
        return {
          message: `This medicine requires a valid prescription. Please upload or provide the prescription so it can be reviewed according to applicable requirements.`,
          intent: "PRESCRIPTION_REQUIRED",
          data: {
            message: `${extraction.medicineName} requires a valid prescription. Please upload your prescription so it can be reviewed before dispensing.`,
            showUploadUI: true,
            medicineName: extraction.medicineName,
            strength: extraction.strength
          }
        };
      }

      // OTC Flow — calculate price
      const mrp = product?.price || 0;
      const deliveryCharge = 50.0;
      const platformDiscount = mrp > 0 ? Math.floor(mrp * 0.1) : 0;
      const customerPrice = mrp > 0 ? (mrp - platformDiscount + deliveryCharge) : null;

      const priceText = customerPrice
        ? `The total is ₹${customerPrice.toFixed(0)} (₹${mrp.toFixed(0)} - 10% discount + ₹${deliveryCharge} delivery).`
        : `Price will be confirmed by a licensed nearby retailer.`;

      return {
        message: `I found ${extraction.medicineName}${extraction.strength ? ' ' + extraction.strength : ''} at a licensed nearby retailer. ${priceText} Would you like me to place the order?`,
        intent: "USER_CONFIRMATION_NEEDED",
        data: {
          message: `I found ${extraction.medicineName}${extraction.strength ? ' ' + extraction.strength : ''} at a licensed nearby retailer. ${priceText} Would you like me to place the order?`,
          showConfirmUI: true,
          medicineName: extraction.medicineName,
          strength: extraction.strength,
          quantity: extraction.quantity || 1,
          total: customerPrice
        }
      };

    } catch (error) {
      console.error("SpeakToBuyAgent Error:", error);
      return {
        message: "Sorry, I had trouble processing your medicine request. Please try again.",
        intent: "SYSTEM_ERROR",
        data: { message: "Sorry, I had trouble processing your medicine request. Please try again." }
      };
    }
  }

  static async extractMedicineDetails(query) {
    if (!process.env.OPENAI_API_KEY) {
      // Fallback: simple regex extraction
      const words = query.split(' ');
      return { medicineName: words.find(w => w.length > 3) || null, strength: null, quantity: 1 };
    }
    try {
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "Extract medicine details from a healthcare voice query. Respond ONLY with valid JSON. Example: { \"medicineName\": \"Paracetamol\", \"strength\": \"500mg\", \"quantity\": 10 }. If you cannot identify a medicine name, set medicineName to null."
          },
          { role: "user", content: query }
        ],
        response_format: { type: "json_object" },
        temperature: 0.1
      });
      return JSON.parse(completion.choices[0].message.content);
    } catch (err) {
      console.error("Medicine extraction error:", err.message);
      return null;
    }
  }

  static async classifyRxViaAI(medicineName) {
    // Known Rx medicines (schedule H, H1, X in India)
    const knownRxDrugs = [
      'alprazolam', 'diazepam', 'clonazepam', 'lorazepam',
      'codeine', 'tramadol', 'morphine', 'oxycodone', 'fentanyl',
      'amoxicillin', 'azithromycin', 'ciprofloxacin', 'metronidazole',
      'metformin', 'glibenclamide', 'insulin', 'atorvastatin',
      'amlodipine', 'ramipril', 'enalapril', 'losartan',
      'fluoxetine', 'sertraline', 'escitalopram', 'quetiapine',
      'warfarin', 'clopidogrel', 'phenytoin', 'levetiracetam',
      'prednisolone', 'dexamethasone', 'methylprednisolone'
    ];
    const lowerName = medicineName.toLowerCase();
    if (knownRxDrugs.some(drug => lowerName.includes(drug))) return true;

    // OTC known safe drugs
    const knownOTC = [
      'paracetamol', 'crocin', 'dolo', 'ibuprofen', 'aspirin',
      'cetirizine', 'loratadine', 'fexofenadine', 'ranitidine',
      'omeprazole', 'pantoprazole', 'eno', 'digene', 'gelusil',
      'otrivin', 'vicks', 'strepsils', 'b-complex', 'vitamin c',
      'zinc', 'calcium', 'iron', 'multivitamin'
    ];
    if (knownOTC.some(drug => lowerName.includes(drug))) return false;

    // AI fallback for unknown drugs
    if (!process.env.OPENAI_API_KEY) return false;
    try {
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a pharmacy compliance checker for India. Respond ONLY with JSON: {\"requiresPrescription\": true/false}. A medicine requires prescription if it is Schedule H, H1, or X under Indian drug regulations."
          },
          { role: "user", content: `Does ${medicineName} require a prescription in India?` }
        ],
        response_format: { type: "json_object" },
        temperature: 0
      });
      const result = JSON.parse(completion.choices[0].message.content);
      return result.requiresPrescription === true;
    } catch (err) {
      return false; // Default to OTC on AI error
    }
  }
}
