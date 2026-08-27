import OpenAI from 'openai';
import prisma from '@/lib/prisma';
import { getAgentByName } from './AgentRegistry';
import { VoiceAgent } from './VoiceAgent';

/**
 * SWASTIK MASTER ORCHESTRATOR
 * This is the central coordinator for all AI Agents.
 * Its job is to understand requests/events, select the correct agent, and delegate.
 */
export class MasterOrchestrator {
  
  /**
   * Main entry point for events or admin chat.
   * @param {string} input - The natural language request or stringified event.
   * @param {string} source - 'ADMIN_CHAT', 'SYSTEM_EVENT', 'VOICE'
   * @param {object} context - User/Admin ID, related IDs, etc.
   */
  static async execute(input, source = 'ADMIN_CHAT', context = {}) {
    if (source === 'VOICE') {
      const voiceResult = await VoiceAgent.processInput({ transcript: input, userId: context.userId });
      return {
        success: true,
        message: voiceResult.message,
        delegatedTo: "VoiceAgent",
        rawOutput: voiceResult
      };
    }

    if (!process.env.OPENAI_API_KEY) {
      return {
        success: false,
        message: "Master Orchestrator disabled. Missing OPENAI_API_KEY in environment.",
        delegatedTo: null
      };
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    // The Master Orchestrator determines which agent to call.
    // In a full implementation, these would actually trigger the agent code.
    // For Sprint 1, we route to the existing AI executive functions or return structured routing.
    const tools = [
      {
        type: "function",
        function: {
          name: "delegate_to_supplier_agent",
          description: "Delegate to SupplierIntelligenceAgent. Use when the request is about finding suppliers, requesting quotes, or stock alerts.",
          parameters: { type: "object", properties: { reason: { type: "string" }, action: { type: "string" } } }
        }
      },
      {
        type: "function",
        function: {
          name: "delegate_to_inventory_agent",
          description: "Delegate to InventoryAgent. Use when the request is about low stock, shortage predictions, or reorder lists.",
          parameters: { type: "object", properties: { reason: { type: "string" }, action: { type: "string" } } }
        }
      },
      {
        type: "function",
        function: {
          name: "delegate_to_customer_agent",
          description: "Delegate to CustomerIntelligenceAgent. Use when the request is about customer segments, inactivity, or retention.",
          parameters: { type: "object", properties: { reason: { type: "string" }, action: { type: "string" } } }
        }
      },
      {
        type: "function",
        function: {
          name: "delegate_to_logistics_agent",
          description: "Delegate to LogisticsAgent. Use when the request is about riders, delivery delays, or driver fraud.",
          parameters: { type: "object", properties: { reason: { type: "string" }, action: { type: "string" } } }
        }
      },
      {
        type: "function",
        function: {
          name: "delegate_to_revenue_agent",
          description: "Delegate to RevenueAgent. Use when the request is about margins, settlements, or financial analytics.",
          parameters: { type: "object", properties: { reason: { type: "string" }, action: { type: "string" } } }
        }
      },
      {
        type: "function",
        function: {
          name: "delegate_to_healthcare_agent",
          description: "Delegate to HealthcareAgent. Use when the request is about doctors, labs, hospitals, or symptoms.",
          parameters: { type: "object", properties: { reason: { type: "string" }, action: { type: "string" } } }
        }
      },
      {
        type: "function",
        function: {
          name: "delegate_to_voice_agent",
          description: "Delegate to VoiceAgent. Use when the request is a voice command, a request to buy a medicine by speaking, or general speech interaction.",
          parameters: { type: "object", properties: { reason: { type: "string" }, action: { type: "string" } } }
        }
      },
      // Direct data tools for the Orchestrator itself to answer generic business questions
      {
        type: "function",
        function: {
          name: "get_business_summary",
          description: "Get daily business metrics like total orders, revenue, and active customers.",
          parameters: { type: "object", properties: {} }
        }
      }
    ];

    const messages = [
      {
        role: "system",
        content: `You are the SWASTIK MASTER ORCHESTRATOR.
You are the central coordinator for the Swastik Medicare Agentic AI OS.
Your job is to understand the user's request or system event and delegate it to the correct specialized agent.
If the request is a general business query, use 'get_business_summary'.
If the request requires specific action or analysis, use a delegation tool to route it to the appropriate agent.
Keep responses highly concise and professional.`
      },
      { role: "user", content: `[SOURCE: ${source}] ${input}` }
    ];

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: messages,
        tools: tools,
        tool_choice: "auto",
      });

      const responseMessage = response.choices[0].message;

      let delegatedAgentName = null;
      let toolOutputs = [];

      if (responseMessage.tool_calls) {
        messages.push(responseMessage);

        for (const toolCall of responseMessage.tool_calls) {
          const functionName = toolCall.function.name;
          const args = JSON.parse(toolCall.function.arguments || "{}");
          let functionResponse = "";

          // Check if it's a delegation
          if (functionName.startsWith("delegate_to_")) {
            const agentMap = {
              "delegate_to_supplier_agent": "SupplierIntelligenceAgent",
              "delegate_to_inventory_agent": "InventoryAgent",
              "delegate_to_customer_agent": "CustomerIntelligenceAgent",
              "delegate_to_logistics_agent": "LogisticsAgent",
              "delegate_to_revenue_agent": "RevenueAgent",
              "delegate_to_healthcare_agent": "HealthcareAgent",
              "delegate_to_voice_agent": "VoiceAgent"
            };
            
            delegatedAgentName = agentMap[functionName];

            if (delegatedAgentName === "VoiceAgent") {
              const voiceRes = await VoiceAgent.processInput({ transcript: input, userId: context.userId });
              functionResponse = JSON.stringify({
                status: "DELEGATED_AND_EXECUTED",
                agent: "VoiceAgent",
                result: voiceRes
              });
            } else {
              const agentMeta = getAgentByName(delegatedAgentName);
              functionResponse = JSON.stringify({
                status: "DELEGATED",
                agent: delegatedAgentName,
                actionRequired: args.action || "analyze",
                permissions: agentMeta ? agentMeta.permissions : {}
              });
            }
            
            console.log(`[MASTER ORCHESTRATOR] Delegating task to ${delegatedAgentName}`);

          } else if (functionName === "get_business_summary") {
            const totalOrders = await prisma.order.count();
            const pendingOrders = await prisma.order.count({ where: { status: { notIn: ["Delivered", "Cancelled"] } } });
            const revenueAgg = await prisma.order.aggregate({ _sum: { total: true }, where: { status: "Delivered" } });
            functionResponse = JSON.stringify({ 
              totalOrders, 
              pendingOrders, 
              totalRevenue: revenueAgg._sum.total || 0 
            });
          }

          toolOutputs.push({
            tool_call_id: toolCall.id,
            role: "tool",
            name: functionName,
            content: functionResponse,
          });
        }
        
        messages.push(...toolOutputs);

        // Final summary response
        const finalResponse = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: messages,
        });

        const finalAnswer = finalResponse.choices[0].message.content;

        // Audit Log
        if (context.adminId) {
          await prisma.aIAuditLog.create({
            data: {
              actionType: delegatedAgentName ? `DELEGATE_${delegatedAgentName.toUpperCase()}` : "ORCHESTRATOR_QUERY",
              userId: context.adminId,
              aiModel: "gpt-4o",
              inputContext: JSON.stringify({ input, source, context }),
              outputData: JSON.stringify({ answer: finalAnswer, delegatedTo: delegatedAgentName }),
              approvalStatus: "AUTO",
              actionTaken: true
            }
          });
        }

        return { 
          success: true, 
          message: finalAnswer,
          delegatedTo: delegatedAgentName,
          rawOutput: toolOutputs
        };

      } else {
        // Simple reply
        return { 
          success: true, 
          message: responseMessage.content,
          delegatedTo: null 
        };
      }
    } catch (err) {
      console.error("MasterOrchestrator Error:", err);
      return { success: false, message: "Error in Master Orchestrator execution.", delegatedTo: null };
    }
  }
}
