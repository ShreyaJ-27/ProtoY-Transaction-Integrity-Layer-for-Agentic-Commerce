import { providerMemoryStore } from '../models/provider-memory.js';
import { getAllAgentMemories } from '../models/agent-memory.js';
import { PROVIDER_DATABASE } from '../config.js';

export interface ProviderAnalytics {
  providerId: string;
  name: string;
  currentReputation: number;
  totalTransactions: number;
  successCount: number;
  failureCount: number;
  successRate: number;
  avgResponseTimeMs: number;
  avgQualityScore: number;
}

export function getProviderAnalytics(providerId: string): ProviderAnalytics {
  const provider = PROVIDER_DATABASE.find(p => p.id === providerId);
  const mem = providerMemoryStore.get(providerId);
  const agentMemories = getAllAgentMemories().filter(m => m.providerId === providerId);

  const successCount = mem?.successCount ?? 0;
  const failureCount = mem?.failureCount ?? 0;
  const totalMem = successCount + failureCount;
  const totalTransactions = Math.max(totalMem, agentMemories.length);

  const successRate = totalMem > 0 ? Math.round((successCount / totalMem) * 100) / 100 : 1.0;

  // Calculate average quality score from historical agent memories
  const scoredMemories = agentMemories.filter(m => m.outcome && typeof m.outcome.qualityScore === 'number');
  const avgQualityScore = scoredMemories.length > 0
    ? Math.round(scoredMemories.reduce((acc, m) => acc + (m.outcome?.qualityScore ?? 0), 0) / scoredMemories.length)
    : 85;

  return {
    providerId,
    name: provider?.name || providerId,
    currentReputation: provider?.reputation ?? 0.85,
    totalTransactions,
    successCount,
    failureCount,
    successRate,
    avgResponseTimeMs: Math.round(mem?.avgResponseTime ?? 150),
    avgQualityScore
  };
}
