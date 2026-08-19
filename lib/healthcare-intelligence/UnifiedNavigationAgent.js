import { GenericMedicineAgent } from './GenericMedicineAgent';
import { HospitalAgent } from './HospitalAgent';
import { AmbulanceAgent } from './AmbulanceAgent';
import { InsuranceAgent } from './InsuranceAgent';
import { LabAgent } from './LabAgent';
import { LLMChatAgent } from './LLMChatAgent';
import prisma from '@/lib/prisma';

/**
 * Unified Healthcare Navigation Agent
 * Routes natural language queries to the appropriate specialized healthcare agent.
 */
export class UnifiedNavigationAgent {

  /**
   * Returns a helpful response for general/greeting queries
   */
  static _generalHelpResponse() {
    return {
      found: true,
      intent: "GENERAL_HELP",
      message: "Hello! I'm Swastik AI — your personal healthcare assistant. Here's what I can help you with:",
      services: [
        { icon: "💊", label: "Medicines", examples: ["Find Glycomet 500", "Generic alternative for Metformin", "Upload prescription"], query: "find medicine" },
        { icon: "👨‍⚕️", label: "Doctors", examples: ["Find a cardiologist", "Book doctor appointment", "Consult online"], query: "find doctor" },
        { icon: "🏥", label: "Hospitals", examples: ["Hospital with cardiology near me", "Emergency hospital", "OPD timings"], query: "find hospital" },
        { icon: "🧪", label: "Lab Tests", examples: ["Book CBC test", "Diabetes test panel", "Home blood collection"], query: "find lab test" },
        { icon: "🚑", label: "Ambulance", examples: ["I need an ambulance", "Emergency transport", "ICU ambulance"], query: "need ambulance" },
        { icon: "🛡️", label: "Insurance", examples: ["Check my policy", "Hospital network", "Help with claim"], query: "insurance help" },
        { icon: "📋", label: "My Health", examples: ["View my prescriptions", "Lab reports", "Health records"], query: "my health records" },
        { icon: "🚚", label: "Delivery", examples: ["Track my order", "Medicine delivery status"], query: "track delivery" },
      ],
      tip: "Just type what you need — for example: 'I need a generic alternative for Glycomet' or 'Find a hospital with cardiology'"
    };
  }

  /**
   * Checks if a query is a greeting or general help request
   */
  static _isGeneralHelp(q) {
    const helpPhrases = [
      // English
      "help", "how can you", "what can you", "what do you do",
      "what services", "tell me", "who are you", "hi", "hello",
      "namaste", "helo", "hii", "hey", "good morning", "good evening",
      "what is this", "how does this work", "i need help",
      "can you help", "assist me", "what can i do", "options",
      "services", "let me know", "show me",
      // Hindi
      "क्या कर सकते", "मदद", "सहायता", "नमस्ते", "हैलो", "स्वास्तिक",
      // Bengali
      "সাহায্য", "হ্যালো", "কি করতে পারো", "সহায়তা"
    ];
    return helpPhrases.some(phrase => q.includes(phrase));
  }

  /**
   * Processes a user's free-text request and routes to the correct intelligence engine.
   * @param {string} query The natural language query from the user.
   * @param {string} userId The ID of the requesting user.
   */
  static async processRequest(query, userId) {
    const q = query.toLowerCase().trim();
    let intent = "UNKNOWN";
    let agentResponse = null;
    let isEmergency = false;

    try {
      // ── 0. GREETING / GENERAL HELP ──────────────────────────────
      if (this._isGeneralHelp(q) || q.length < 4) {
        intent = "GENERAL_HELP";
        agentResponse = this._generalHelpResponse();

      // ── 1. EMERGENCY / AMBULANCE ─────────────────────────────────
      } else if (
        q.includes("ambulance") || q.includes("emergency") ||
        q.includes("accident") || q.includes("sos") || q.includes("108") ||
        // Hindi
        q.includes("एम्बुलेंस") || q.includes("आपातकाल") || q.includes("दुर्घटना") ||
        // Bengali
        q.includes("অ্যাম্বুলেন্স") || q.includes("জরুরি")
      ) {
        intent = "AMBULANCE";
        isEmergency = true;
        agentResponse = await AmbulanceAgent.handleQuery(query, userId);

      // ── 2. HOSPITAL ───────────────────────────────────────────────
      } else if (
        q.includes("hospital") || q.includes("admit") ||
        q.includes("opd") || q.includes("icu") || q.includes("surgeon") ||
        q.includes("operation") || q.includes("surgery") ||
        // Hindi
        q.includes("अस्पताल") || q.includes("ऑपरेशन") ||
        // Bengali
        q.includes("হাসপাতাল") || q.includes("অপারেশন")
      ) {
        intent = "HOSPITAL_SEARCH";
        agentResponse = await HospitalAgent.handleQuery(query, userId);

      // ── 3. DOCTOR ─────────────────────────────────────────────────
      } else if (
        q.includes("doctor") || q.includes("consult") ||
        q.includes("physician") || q.includes("specialist") ||
        q.includes("appointment") ||
        // Hindi
        q.includes("डॉक्टर") || q.includes("चिकित्सक") || q.includes("अपॉइंटमेंट") ||
        // Bengali
        q.includes("ডাক্তার") || q.includes("চিকিৎসক")
      ) {
        intent = "HOSPITAL_SEARCH"; // routes to hospital/doctor agent
        agentResponse = await HospitalAgent.handleQuery(query, userId);

      // ── 4. LAB TEST ───────────────────────────────────────────────
      } else if (
        q.includes("lab") || q.includes("test") || q.includes("blood") ||
        q.includes("cbc") || q.includes("urine") || q.includes("scan") ||
        q.includes("x-ray") || q.includes("xray") || q.includes("mri") ||
        q.includes("report") || q.includes("sample") || q.includes("pathology") ||
        // Hindi
        q.includes("खून") || q.includes("जांच") || q.includes("रिपोर्ट") || q.includes("लैब") ||
        // Bengali
        q.includes("রক্ত") || q.includes("পরীক্ষা") || q.includes("রিপোর্ট")
      ) {
        intent = "LAB_SEARCH";
        agentResponse = await LabAgent.handleQuery(query, userId);

      // ── 5. INSURANCE ──────────────────────────────────────────────
      } else if (
        q.includes("insurance") || q.includes("claim") ||
        q.includes("policy") || q.includes("cashless") ||
        q.includes("mediclaim") || q.includes("coverage")
      ) {
        intent = "INSURANCE";
        agentResponse = await InsuranceAgent.handleQuery(query, userId);

      // ── 6. MEDICINE / PHARMACY ────────────────────────────────────
      } else if (
        q.includes("medicine") || q.includes("generic") ||
        q.includes("tablet") || q.includes("capsule") || q.includes("syrup") ||
        q.includes("injection") || q.includes("pill") || q.includes("drug") ||
        q.includes("alternative") || q.includes("salt") || q.includes("dose") ||
        q.includes("pharmacy") || q.includes("chemist") || q.includes("mg") ||
        q.includes("prescription") || q.includes("rx") ||
        // Hindi
        q.includes("दवा") || q.includes("दवाई") || q.includes("टैबलेट") || q.includes("गोली") ||
        q.includes("कैप्सूल") || q.includes("सिरप") || q.includes("दवाखाना") || q.includes("जेनेरिक") ||
        // Bengali
        q.includes("ওষুধ") || q.includes("ট্যাবলেট") || q.includes("ক্যাপসুল") || q.includes("সিরাপ")
      ) {
        intent = "MEDICINE_SEARCH";
        agentResponse = await GenericMedicineAgent.handleQuery(query, userId);

      // ── 7. DELIVERY / TRACKING ────────────────────────────────────
      } else if (
        q.includes("track") || q.includes("delivery") ||
        q.includes("order") || q.includes("where is my") ||
        // Hindi
        q.includes("ऑर्डर") || q.includes("डिलीवरी") || q.includes("कहाँ है") ||
        // Bengali
        q.includes("অর্ডার") || q.includes("ডেলিভারি")
      ) {
        intent = "DELIVERY_TRACK";
        agentResponse = {
          found: true,
          message: "To track your order, please go to your Profile → My Orders, or provide your order ID.",
          action: "GO_TO_PROFILE",
          link: "/profile"
        };

      // ── 8. HEALTH RECORDS / PRESCRIPTIONS ─────────────────────────
      } else if (
        q.includes("prescription") || q.includes("health record") ||
        q.includes("my report") || q.includes("abha") || q.includes("digital health")
      ) {
        intent = "HEALTH_RECORDS";
        agentResponse = {
          found: true,
          message: "Your health records, prescriptions and lab reports are stored securely.",
          action: "GO_TO_HEALTH_RECORDS",
          link: "/my-health-records"
        };

      // ── 9. UNKNOWN / MEDICAL QA — ChatGPT Fallback ────────────────────────────
      } else {
        intent = "MEDICAL_AI";
        agentResponse = await LLMChatAgent.handleQuery(query);
      }

      // Log the search for audit and compliance
      if (userId) {
        await prisma.healthcareSearch.create({
          data: {
            userId,
            rawQuery: query,
            resolvedIntent: intent,
            routingAgent: "UnifiedNavigationAgent",
            aiResponse: JSON.stringify(agentResponse),
            isEmergency
          }
        }).catch(() => {}); // Don't crash if audit log fails
      }

      return {
        success: true,
        intent,
        isEmergency,
        result: agentResponse
      };

    } catch (error) {
      console.error("UnifiedNavigationAgent Error:", error);
      return {
        success: false,
        intent: "ERROR",
        error: "I encountered an error. Please try rephrasing your question.",
        result: this._generalHelpResponse()
      };
    }
  }
}
