import { AgentIntent, OutcomeVerification, AgentMemory } from '../types.js';

export const agentMemoryStore = new Map<string, AgentMemory[]>();

export function storeAgentMemory(
  agentId: string,
  entry: Omit<AgentMemory, 'id' | 'timestamp' | 'agentId'> & { timestamp?: Date }
): AgentMemory {
  const memories = agentMemoryStore.get(agentId) || [];
  const memoryRecord: AgentMemory = {
    id: `mem-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    agentId,
    providerId: entry.providerId,
    paymentTxId: entry.paymentTxId,
    intent: entry.intent,
    outcome: entry.outcome,
    timestamp: entry.timestamp || new Date(),
    lessonsLearned: entry.lessonsLearned || []
  };

  memories.push(memoryRecord);
  agentMemoryStore.set(agentId, memories);
  return memoryRecord;
}

export function getAgentMemories(agentId: string): AgentMemory[] {
  return agentMemoryStore.get(agentId) || [];
}

export function getAllAgentMemories(): AgentMemory[] {
  const all: AgentMemory[] = [];
  for (const list of agentMemoryStore.values()) {
    all.push(...list);
  }
  return all;
}
