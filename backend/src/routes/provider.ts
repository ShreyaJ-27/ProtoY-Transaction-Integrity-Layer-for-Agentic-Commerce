import { Hono } from 'hono';
import { selectProvider } from '../engines/provider-engine.js';
import { providerMemoryStore } from '../models/provider-memory.js';
import { createPaymentMiddleware } from '../middleware/x402-middleware.js';
import { PROVIDER_DATABASE, PRICE_MAP } from '../config.js';

export const providerRouter = new Hono();

// Protected endpoint requiring x402 payment
providerRouter.post('/select-provider', createPaymentMiddleware(PRICE_MAP.PROVIDER), async (c) => {
  try {
    const body = await c.req.json().catch(() => ({}));
    const { economics } = body;

    if (!economics || !economics.recommendedProvider) {
      return c.json({ error: 'Missing or invalid "economics" analysis object' }, 400);
    }

    const result = await selectProvider(economics, providerMemoryStore);
    return c.json(result);
  } catch (error: any) {
    return c.json({ error: error.message || 'Error processing provider selection' }, 500);
  }
});

// Public health inspection for providers
providerRouter.get('/providers/health', (c) => {
  const healthList = PROVIDER_DATABASE.map((provider) => {
    const mem = providerMemoryStore.get(provider.id);
    const totalRequests = mem ? mem.successCount + mem.failureCount : 0;
    const successRate = totalRequests > 0 && mem ? mem.successCount / totalRequests : 1.0;

    return {
      id: provider.id,
      name: provider.name,
      reputation: provider.reputation,
      price: provider.price,
      sla: provider.sla,
      healthStatus: successRate >= 0.9 ? 'HEALTHY' : successRate >= 0.7 ? 'DEGRADED' : 'UNHEALTHY',
      stats: {
        successCount: mem?.successCount ?? 0,
        failureCount: mem?.failureCount ?? 0,
        avgResponseTimeMs: Math.round(mem?.avgResponseTime ?? 0),
        successRate: Math.round(successRate * 100) / 100,
        lastUsed: mem?.lastUsed ?? null
      }
    };
  });

  return c.json({
    providers: healthList
  });
});
