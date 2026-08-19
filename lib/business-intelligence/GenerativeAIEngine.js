import OpenAI from 'openai';
import prisma from '@/lib/prisma';

/**
 * The Swastik Generative AI Business Engine.
 * This is the central layer for all high-level business intelligence, content generation, and task management.
 */
export class GenerativeAIEngine {
  
  /**
   * AI Business Executive Query Agent
   * Handles natural language queries from the admin panel and uses tools to fetch real data.
   */
  static async executeBusinessQuery(query, adminId) {
    if (!process.env.OPENAI_API_KEY) {
      return {
        success: false,
        message: "Generative AI is currently disabled. Missing OPENAI_API_KEY in environment.",
      };
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    // Define the tools (data access methods) the AI can use
    const tools = [
      {
        type: "function",
        function: {
          name: "get_business_summary",
          description: "Get daily business metrics like total orders, revenue, and active customers.",
          parameters: { type: "object", properties: {} }
        }
      },
      {
        type: "function",
        function: {
          name: "get_low_stock_medicines",
          description: "Get a list of medicines that are running low on stock (stock < 20).",
          parameters: { type: "object", properties: {} }
        }
      },
      {
        type: "function",
        function: {
          name: "get_top_pharmacies",
          description: "Get a list of the top performing pharmacies.",
          parameters: { type: "object", properties: {} }
        }
      },
      {
        type: "function",
        function: {
          name: "get_delivery_summary",
          description: "Get information about delivery agents and pending deliveries.",
          parameters: { type: "object", properties: {} }
        }
      }
    ];

    const messages = [
      {
        role: "system",
        content: `You are the Swastik AI Business Executive.
You assist the platform administrator by answering questions about the business using the available data tools.
NEVER invent data. If you don't have the data, explicitly state "Insufficient data available."
Do not calculate profitability using incomplete data without clearly labeling assumptions.
Keep answers concise, professional, and highly actionable.`
      },
      { role: "user", content: query }
    ];

    try {
      // Step 1: Ask the model what it wants to do
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: messages,
        tools: tools,
        tool_choice: "auto",
      });

      const responseMessage = response.choices[0].message;

      // Step 2: Handle tool calls
      if (responseMessage.tool_calls) {
        messages.push(responseMessage); // Append assistant's tool call request

        for (const toolCall of responseMessage.tool_calls) {
          const functionName = toolCall.function.name;
          let functionResponse = "";

          // Execute actual database queries
          if (functionName === "get_business_summary") {
            const totalOrders = await prisma.order.count();
            const pendingOrders = await prisma.order.count({ where: { status: { notIn: ["Delivered", "Cancelled"] } } });
            const revenueAgg = await prisma.order.aggregate({ _sum: { total: true }, where: { status: "Delivered" } });
            functionResponse = JSON.stringify({ 
              totalOrders, 
              pendingOrders, 
              totalRevenue: revenueAgg._sum.total || 0 
            });
          } else if (functionName === "get_low_stock_medicines") {
            const lowStock = await prisma.product.findMany({ 
              where: { stock: { lt: 20 } }, 
              take: 10, 
              select: { name: true, stock: true } 
            });
            functionResponse = JSON.stringify(lowStock);
          } else if (functionName === "get_top_pharmacies") {
            const top = await prisma.retailer.findMany({ 
              orderBy: { rating: 'desc' }, 
              take: 5, 
              select: { shopName: true, rating: true, city: true } 
            });
            functionResponse = JSON.stringify(top);
          } else if (functionName === "get_delivery_summary") {
            const onlineAgents = await prisma.deliveryAgent.count({ where: { isOnline: true } });
            const pendingDeliveries = await prisma.order.count({ where: { status: "Out_for_Delivery" } });
            functionResponse = JSON.stringify({ onlineAgents, pendingDeliveries });
          }

          messages.push({
            tool_call_id: toolCall.id,
            role: "tool",
            name: functionName,
            content: functionResponse,
          });
        }

        // Step 3: Second call to generate the final human-readable response
        const finalResponse = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: messages,
        });

        const finalAnswer = finalResponse.choices[0].message.content;

        // Step 4: Audit Log
        if (adminId) {
          await prisma.aIAuditLog.create({
            data: {
              actionType: "BUSINESS_EXECUTIVE_QUERY",
              userId: adminId,
              aiModel: "gpt-4o",
              inputContext: JSON.stringify({ query }),
              outputData: JSON.stringify({ answer: finalAnswer }),
              approvalStatus: "AUTO",
              actionTaken: true
            }
          });
        }

        return { success: true, message: finalAnswer };

      } else {
        // Model answered without needing data
        return { success: true, message: responseMessage.content };
      }
    } catch (err) {
      console.error("GenerativeAIEngine Error:", err);
      return { success: false, message: "Error communicating with the Swastik AI engine." };
    }
  }
}
