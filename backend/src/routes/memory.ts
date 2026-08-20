import { Hono } from 'hono';
import { getAgentMemories } from '../models/agent-memory.js';
import { getProviderAnalytics } from '../analytics/provider-analytics.js';

export const memoryRouter = new Hono();

// GET /memory/:agentId
memoryRouter.get('/memory/:agentId', (c) => {
  const agentId = c.req.param('agentId');
  const transactions = getAgentMemories(agentId);

  const totalTransactions = transactions.length;
  const successfulCount = transactions.filter(t => t.outcome?.isValid).length;
  const successRate = totalTransactions > 0 ? Math.round((successfulCount / totalTransactions) * 100) / 100 : 1.0;

  // Count provider occurrences
  const providerUsage: Record<string, number> = {};
  transactions.forEach(t => {
    providerUsage[t.providerId] = (providerUsage[t.providerId] || 0) + 1;
  });

  const topProviders = Object.entries(providerUsage)
    .sort((a, b) => b[1] - a[1])
    .map(([providerId, count]) => ({ providerId, count }));

  return c.json({
    agentId,
    transactions,
    summary: {
      totalTransactions,
      successRate,
      topProviders
    }
  });
});

// POST /memory/:agentId/query
memoryRouter.post('/memory/:agentId/query', async (c) => {
  try {
    const agentId = c.req.param('agentId');
    const body = await c.req.json().catch(() => ({}));
    const { query } = body;

    const memories = getAgentMemories(agentId);
    if (!query || typeof query !== 'string') {
      return c.json({ agentId, query: '', matches: memories });
    }

    const queryLower = query.toLowerCase();
    const matches = memories.filter(m => {
      const goalStr = m.intent?.goal?.toLowerCase() || '';
      const categoryStr = m.intent?.category?.toLowerCase() || '';
      const providerStr = m.providerId.toLowerCase();
      const lessonsStr = (m.lessonsLearned || []).join(' ').toLowerCase();

      return (
        goalStr.includes(queryLower) ||
        categoryStr.includes(queryLower) ||
        providerStr.includes(queryLower) ||
        lessonsStr.includes(queryLower)
      );
    });

    return c.json({
      agentId,
      query,
      matchCount: matches.length,
      matches
    });
  } catch (error: any) {
    return c.json({ error: error.message || 'Error querying agent memories' }, 500);
  }
});

// GET /providers/:providerId/reputation
memoryRouter.get('/providers/:providerId/reputation', (c) => {
  const providerId = c.req.param('providerId');
  const analytics = getProviderAnalytics(providerId);

  return c.json(analytics);
});
