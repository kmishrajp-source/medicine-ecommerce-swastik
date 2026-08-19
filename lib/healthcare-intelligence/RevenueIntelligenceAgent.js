import prisma from '@/lib/prisma';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export class RevenueIntelligenceAgent {
  static async analyzeRevenue(params) {
    // 1. Fetch raw data
    const period = params?.period || 30; // default to 30 days
    const startDate = new Date(Date.now() - period * 24 * 60 * 60 * 1000);
    
    const transactions = await prisma.revenueTransaction.findMany({
      where: {
        createdAt: { gte: startDate }
      },
      select: {
        transactionType: true,
        grossMargin: true,
        netRevenue: true,
        customerPaid: true,
      }
    });

    const b2bContracts = await prisma.b2bContract.findMany({
      where: { status: 'ACTIVE' },
      select: { organizationType: true, contractType: true, monthlyFee: true, annualFee: true }
    });

    // 2. Aggregate Data
    const summary = {
      transactionsCount: transactions.length,
      totalNetRevenue: transactions.reduce((sum, t) => sum + t.netRevenue, 0),
      totalMargin: transactions.reduce((sum, t) => sum + t.grossMargin, 0),
      activeContracts: b2bContracts.length,
    };

    // 3. Prompt AI for Intelligence
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are the Swastik Medicare Revenue Intelligence AI. Analyze the provided financial data and identify high-margin opportunities, churn risks, and B2B expansion recommendations."
          },
          {
            role: "user",
            content: `Analyze this recent data: ${JSON.stringify(summary)}. What are 3 actionable recommendations to optimize revenue without increasing customer prices?`
          }
        ],
        temperature: 0.7,
      });

      return {
        dataSummary: summary,
        aiInsights: completion.choices[0].message.content
      };
    } catch (error) {
      console.error("AI Generation Error:", error);
      return {
        dataSummary: summary,
        aiInsights: "AI analysis temporarily unavailable."
      };
    }
  }

  static async optimizePricing(params) {
    // Concept implementation for pricing optimization recommendations
    return {
      recommendations: [
        { service: 'Bioinformatics SaaS', currentPrice: 500, suggestedPrice: 550, reasoning: 'High B2B retention observed.' },
        { service: 'Genetic Testing', currentPrice: 15000, suggestedPrice: 14500, reasoning: 'Elasticity suggests volume increase offsets price drop.' }
      ]
    };
  }
}
