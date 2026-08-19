import OpenAI from 'openai';

export class GenomicsAgent {
  static async handleQuery(query, userId) {
    if (!process.env.OPENAI_API_KEY) {
      return {
        found: true,
        message: "The Swastik Genomics engine is currently offline. Please try again later."
      };
    }

    try {
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are the Swastik Genomics & Biotechnology Educator.
Your goal is to explain complex genetic, genomic, and biotechnological concepts in simple, accurate terms.

Rules:
1. Explain concepts at a level a patient can understand, but remain scientifically accurate.
2. If asked about genetic testing, explain what the test generally investigates. 
3. DO NOT diagnose genetic diseases or interpret genetic variants as a definitive diagnosis.
4. DO NOT recommend genetic tests for specific individuals. State that suitability depends on professional advice.
5. If the user asks in Hindi or Bengali, reply in the same language.`
          },
          { role: "user", content: query }
        ],
        temperature: 0.3,
      });

      return {
        found: true,
        intent: "GENOMICS_EDUCATION",
        message: completion.choices[0].message.content
      };

    } catch (error) {
      console.error("GenomicsAgent Error:", error);
      return {
        found: true,
        intent: "GENOMICS_EDUCATION",
        message: "I could not retrieve the genomics information at this moment. Please try again later."
      };
    }
  }
}
