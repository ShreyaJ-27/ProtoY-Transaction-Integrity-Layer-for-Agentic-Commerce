import { Hono } from 'hono';
import { runAgent } from '../agent/agent.js';
import { isGroqAvailable } from '../agent/groq-client.js';

export const agentRouter = new Hono();

/**
 * POST /api/agent/execute
 *
 * Main agent endpoint — combines Groq AI reasoning with Proto-Y deterministic engines.
 *
 * The route is the master flow: Proto-Y approves the proposal before the
 * real x402 client signs and settles the protected research request.
 */
agentRouter.post('/agent/execute', async (c) => {
  try {
    const body = await c.req.json().catch(() => ({}));
    const { agentId, goal, budget, parameters, providerPreferences } = body;

    if (!goal || typeof goal !== 'string') {
      return c.json({ error: 'Missing or invalid "goal" string' }, 400);
    }

    const result = await runAgent({
      agentId: agentId || 'agent-default',
      goal,
      budget: Number(budget) || 50000,
      parameters,
      providerPreferences
    });

    const statusCode = result.agent.decision === 'DENY' ? 403 :
                       result.agent.decision === 'ESCALATE' ? 402 : 200;

    return c.json(result, statusCode);
  } catch (error: any) {
    return c.json({
      error: error.message || 'Internal agent error',
      groqAvailable: isGroqAvailable()
    }, 500);
  }
});

/**
 * GET /api/agent/status
 *
 * Returns agent system status including Groq availability.
 */
agentRouter.get('/agent/status', (c) => {
  return c.json({
    status: 'online',
    groqAvailable: isGroqAvailable(),
    network: 'algorand-testnet',
    usdcAsaId: 10458941
  });
});
