export interface ProviderMemory {
  providerId: string;
  successCount: number;
  failureCount: number;
  avgResponseTime: number;
  lastUsed: Date;
}

export const providerMemoryStore = new Map<string, ProviderMemory>();

// Seed default memory with healthy sample data
providerMemoryStore.set('weather-api', {
  providerId: 'weather-api',
  successCount: 48,
  failureCount: 2,
  avgResponseTime: 120,
  lastUsed: new Date()
});

providerMemoryStore.set('ai-research', {
  providerId: 'ai-research',
  successCount: 35,
  failureCount: 5,
  avgResponseTime: 850,
  lastUsed: new Date()
});

providerMemoryStore.set('data-feed', {
  providerId: 'data-feed',
  successCount: 95,
  failureCount: 5,
  avgResponseTime: 210,
  lastUsed: new Date()
});

export function recordProviderSuccess(providerId: string, responseTimeMs: number = 200): void {
  const mem = providerMemoryStore.get(providerId) || {
    providerId,
    successCount: 0,
    failureCount: 0,
    avgResponseTime: responseTimeMs,
    lastUsed: new Date()
  };

  mem.avgResponseTime = (mem.avgResponseTime * mem.successCount + responseTimeMs) / (mem.successCount + 1);
  mem.successCount += 1;
  mem.lastUsed = new Date();
  providerMemoryStore.set(providerId, mem);
}

export function recordProviderFailure(providerId: string): void {
  const mem = providerMemoryStore.get(providerId) || {
    providerId,
    successCount: 0,
    failureCount: 0,
    avgResponseTime: 0,
    lastUsed: new Date()
  };

  mem.failureCount += 1;
  mem.lastUsed = new Date();
  providerMemoryStore.set(providerId, mem);
}
