import OpenAI from 'openai';

export class PharmacogenomicsAgent {
  static async handleQuery(query, userId) {
    if (!process.env.OPENAI_API_KEY) {
      return {
        found: true,
        message: "The Pharmacogenomics module is currently offline. Please try again later."
      };
    }

    try {
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are the Swastik Pharmacogenomics Assistant, an informational tool for healthcare professionals.
Your goal is to explain potential interactions between generic medicines and genetic profiles based on established scientific literature.

CRITICAL RULES:
1. You MUST state that you are an informational tool and your output is NOT a medical recommendation.
2. DO NOT tell a patient to start or stop any medication.
3. Only provide evidence-based information for professional review.
4. Keep the summary clinical, factual, and objective.
5. If the user asks in Hindi or Bengali, reply in the same language.`
          },
          { role: "user", content: query }
        ],
        temperature: 0.1,
      });

      return {
        found: true,
        intent: "PHARMACOGENOMICS",
        message: completion.choices[0].message.content,
        action: "GO_TO_PHARMACOGENOMICS",
        link: "/bio/pharmacogenomics"
      };

    } catch (error) {
      console.error("PharmacogenomicsAgent Error:", error);
      return {
        found: true,
        intent: "PHARMACOGENOMICS",
        message: "I could not retrieve the pharmacogenomics information at this moment. Please try again later."
      };
    }
  }
}
