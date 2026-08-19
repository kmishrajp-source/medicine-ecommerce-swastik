import { GenomicsAgent } from './GenomicsAgent';
import { BiomedicalResearchAgent } from './BiomedicalResearchAgent';
import { BioinformaticsAgent } from './BioinformaticsAgent';
import { PharmacogenomicsAgent } from './PharmacogenomicsAgent';
import { LLMChatAgent } from './LLMChatAgent';
import prisma from '@/lib/prisma';

/**
 * Bio-Health Navigator Agent
 * Connects UnifiedNavigationAgent to the Bio-Health sub-agents.
 */
export class BioHealthNavigatorAgent {

  static async handleQuery(query, userId) {
    const q = query.toLowerCase().trim();
    let intent = "BIO_HEALTH_UNKNOWN";
    let agentResponse = null;

    try {
      // 1. Biomedical Research
      if (
        q.includes("research") || q.includes("study") || q.includes("trial") || 
        q.includes("paper") || q.includes("development") || q.includes("discovery") ||
        q.includes("researchers") || q.includes("researcher") || q.includes("evidence")
      ) {
        intent = "BIOMEDICAL_RESEARCH";
        agentResponse = await BiomedicalResearchAgent.handleQuery(query, userId);

      // 2. Bioinformatics
      } else if (
        q.includes("bioinformatics") || q.includes("dataset") || q.includes("fastq") || 
        q.includes("vcf") || q.includes("computational biology")
      ) {
        intent = "BIOINFORMATICS_ENGINE";
        agentResponse = await BioinformaticsAgent.handleQuery(query, userId);

      // 3. Pharmacogenomics
      } else if (
        q.includes("pharmacogenomic") || q.includes("drug interaction") || 
        q.includes("metabolism") || (q.includes("medicine") && q.includes("gene"))
      ) {
        intent = "PHARMACOGENOMICS";
        agentResponse = await PharmacogenomicsAgent.handleQuery(query, userId);

      // 4. Genomics & Biotechnology Education
      } else if (
        q.includes("genomic") || q.includes("genetic") || q.includes("dna") ||
        q.includes("biotech") || q.includes("biomarker") || q.includes("crispr") ||
        q.includes("mutation") || q.includes("sequencing") || q.includes("gene")
      ) {
        intent = "GENOMICS_EDUCATION";
        agentResponse = await GenomicsAgent.handleQuery(query, userId);

      // Fallback
      } else {
        intent = "BIO_HEALTH_FALLBACK";
        agentResponse = await LLMChatAgent.handleQuery(query);
      }

      // Log Bio-Health search
      if (userId) {
        await prisma.healthcareSearch.create({
          data: {
            userId,
            rawQuery: query,
            resolvedIntent: intent,
            routingAgent: "BioHealthNavigatorAgent",
            aiResponse: JSON.stringify(agentResponse),
            isEmergency: false
          }
        }).catch(() => {});
      }

      return agentResponse;

    } catch (error) {
      console.error("BioHealthNavigatorAgent Error:", error);
      return {
        found: true,
        intent: "ERROR",
        message: "I encountered an error connecting to the Bio-Health Intelligence network. Please try again."
      };
    }
  }
}
