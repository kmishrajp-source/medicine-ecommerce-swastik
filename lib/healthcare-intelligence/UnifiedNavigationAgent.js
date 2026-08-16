import { GenericMedicineAgent } from './GenericMedicineAgent';
import { HospitalAgent } from './HospitalAgent';
import { AmbulanceAgent } from './AmbulanceAgent';
import { InsuranceAgent } from './InsuranceAgent';
import { LabAgent } from './LabAgent';
import prisma from '@/lib/prisma';

/**
 * Unified Healthcare Navigation Agent
 * Routes natural language queries to the appropriate specialized healthcare agent.
 */
export class UnifiedNavigationAgent {
  /**
   * Processes a user's free-text request and routes to the correct intelligence engine.
   * @param {string} query The natural language query from the user.
   * @param {string} userId The ID of the requesting user.
   */
  static async processRequest(query, userId) {
    const q = query.toLowerCase();
    let intent = "UNKNOWN";
    let agentResponse = null;
    let isEmergency = false;
    
    try {
      // Basic heuristic routing. In production, this would use an LLM or intent classifier.
      if (q.includes("ambulance") || q.includes("emergency") || q.includes("accident")) {
        intent = "AMBULANCE";
        isEmergency = true;
        agentResponse = await AmbulanceAgent.handleQuery(query, userId);
      } else if (q.includes("hospital") || q.includes("admit") || q.includes("doctor")) {
        intent = "HOSPITAL_SEARCH";
        agentResponse = await HospitalAgent.handleQuery(query, userId);
      } else if (q.includes("lab") || q.includes("test") || q.includes("blood") || q.includes("cbc")) {
        intent = "LAB_SEARCH";
        agentResponse = await LabAgent.handleQuery(query, userId);
      } else if (q.includes("insurance") || q.includes("claim") || q.includes("policy") || q.includes("cashless")) {
        intent = "INSURANCE";
        agentResponse = await InsuranceAgent.handleQuery(query, userId);
      } else if (q.includes("medicine") || q.includes("generic") || q.includes("pill") || q.includes("alternative")) {
        intent = "MEDICINE_SEARCH";
        agentResponse = await GenericMedicineAgent.handleQuery(query, userId);
      } else {
        // Default to medicine if ambiguous, or ask for clarification
        intent = "MEDICINE_SEARCH";
        agentResponse = await GenericMedicineAgent.handleQuery(query, userId);
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
        });
      }

      return {
        success: true,
        intent,
        isEmergency,
        result: agentResponse
      };

    } catch (error) {
      console.error("UnifiedNavigationAgent Error:", error);
      return { success: false, error: "Failed to process healthcare request" };
    }
  }
}
