import { Hono } from 'hono';
import { analyzeIntent } from '../engines/intent-engine.js';
import { assessRisk } from '../engines/risk-engine.js';
import { createPaymentMiddleware } from '../middleware/x402-middleware.js';
import { PRICE_MAP } from '../config.js';

export const analysisRouter = new Hono();

// Protected endpoint requiring x402 payment
analysisRouter.post('/analyze-intent', createPaymentMiddleware(PRICE_MAP.INTENT), async (c) => {
  try {
    const body = await c.req.json().catch(() => ({}));
    const { goal, parameters, estimatedCost, agentId } = body;

    if (!goal || typeof goal !== 'string') {
      return c.json({ error: 'Missing or invalid "goal" in request body' }, 400);
    }

    const intent = await analyzeIntent({ goal, parameters, estimatedCost });
    const risk = await assessRisk(intent, agentId, parameters);

    return c.json({
      intent,
      risk
    });
  } catch (error: any) {
    return c.json({ error: error.message || 'Error processing intent analysis' }, 500);
  }
});
