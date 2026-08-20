import { Hono } from 'hono';
import { orchestratePayment } from '../orchestrator/proto-y-orchestrator.js';

export const orchestratorRouter = new Hono();

// Master execution endpoint combining all 6 integrity layers
orchestratorRouter.post('/execute-payment', async (c) => {
  try {
    const body = await c.req.json().catch(() => ({}));
    const { agentId, goal, parameters, budget } = body;

    if (!goal || typeof goal !== 'string') {
      return c.json({ error: 'Missing or invalid "goal" in request' }, 400);
    }

    const effectiveAgentId = agentId || 'agent-default';
    const effectiveBudget = Number(budget) || 50000;

    const paymentSignature =
      c.req.header('X-Payment-Signature') ||
      c.req.header('x-payment-signature') ||
      c.req.header('Payment-Signature') ||
      c.req.header('payment-signature') ||
      undefined;

    const result = await orchestratePayment({
      agentId: effectiveAgentId,
      goal,
      parameters,
      budget: effectiveBudget,
      paymentSignature
    });

    if (!result.success && result.risk?.recommendation === 'DENY') {
      return c.json(result, 403);
    }

    if (!result.success && result.error === 'Exceeds budget') {
      return c.json(result, 400);
    }

    return c.json(result);
  } catch (error: any) {
    return c.json({ error: error.message || 'Error running payment orchestrator' }, 500);
  }
});
