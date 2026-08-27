import prisma from '@/lib/prisma';

/**
 * MemoryTool
 * Provides structured, long-term memory for AI agents.
 */
export class MemoryTool {
  
  /**
   * Save a specific memory for an agent about an entity.
   * @param {Object} params
   * @param {string} params.agentId - The agent remembering this (e.g., 'SUP_001')
   * @param {string} params.entityId - ID of the Supplier, Customer, etc.
   * @param {string} params.memoryType - e.g., 'PERFORMANCE_RECORD', 'PREFERENCE'
   * @param {Object} params.data - The data to store
   * @param {number} params.importance - 1 (low) to 5 (high)
   */
  static async remember({ agentId, entityId, memoryType, data, importance = 1 }) {
    try {
      const memory = await prisma.agentMemory.create({
        data: {
          agentId,
          entityId,
          memoryType,
          memoryData: JSON.stringify(data),
          importance
        }
      });
      return { success: true, memoryId: memory.id };
    } catch (err) {
      console.error("[MemoryTool] Failed to save memory:", err);
      return { success: false, error: err.message };
    }
  }

  /**
   * Recall all memories for a specific entity relevant to this agent.
   * @param {string} agentId 
   * @param {string} entityId 
   * @param {string} memoryType - Optional filter
   */
  static async recall(agentId, entityId, memoryType = null) {
    try {
      const whereClause = { agentId, entityId };
      if (memoryType) whereClause.memoryType = memoryType;

      const memories = await prisma.agentMemory.findMany({
        where: whereClause,
        orderBy: { importance: 'desc' }
      });

      return memories.map(m => ({
        id: m.id,
        type: m.memoryType,
        importance: m.importance,
        data: JSON.parse(m.memoryData),
        createdAt: m.createdAt
      }));
    } catch (err) {
      console.error("[MemoryTool] Failed to recall memory:", err);
      return [];
    }
  }
}
