import OpenAI from 'openai';
import prisma from '@/lib/prisma';

export class BiomedicalResearchAgent {
  static async handleQuery(query, userId) {
    try {
      // 1. Search our local database first (if we have synced research)
      const keywordMatch = query.split(' ').find(w => w.length > 4);
      let localResearch = [];
      if (keywordMatch) {
        localResearch = await prisma.biomedicalResearch.findMany({
          where: {
            OR: [
              { title: { contains: keywordMatch, mode: 'insensitive' } },
              { summary: { contains: keywordMatch, mode: 'insensitive' } },
            ]
          },
          take: 3,
          orderBy: { publicationDate: 'desc' }
        }).catch(() => []); // Fail gracefully if table doesn't exist yet
      }

      // 2. Use OpenAI to analyze the query and the local research
      if (!process.env.OPENAI_API_KEY) {
        return {
          found: true,
          message: "Our biomedical research engine requires an active AI configuration to summarize clinical findings."
        };
      }

      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

      let systemPrompt = `You are the Swastik Biomedical Research Engine. 
Analyze the user's query about medical research, biotechnology, or drug discovery.
Provide a highly factual, objective summary.

Rules:
1. Always state the level of evidence (e.g. "Early Research", "Established Clinical Practice").
2. Distinguish clearly between experimental science and available treatments.
3. Keep answers concise (2-4 paragraphs).
4. Do NOT give medical advice.
`;

      if (localResearch.length > 0) {
        systemPrompt += `\nHere is recent verified research from our database:\n`;
        localResearch.forEach(r => {
          systemPrompt += `- ${r.title} (${r.source}, ${r.publicationDate.toDateString()}): ${r.summary}\n`;
        });
      }

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: query }
        ],
        temperature: 0.2,
      });

      return {
        found: true,
        intent: "BIOMEDICAL_RESEARCH",
        message: completion.choices[0].message.content,
        localData: localResearch
      };

    } catch (error) {
      console.error("BiomedicalResearchAgent Error:", error);
      return {
        found: true,
        intent: "BIOMEDICAL_RESEARCH",
        message: "I could not retrieve research data at this moment. Please try again later."
      };
    }
  }
}
