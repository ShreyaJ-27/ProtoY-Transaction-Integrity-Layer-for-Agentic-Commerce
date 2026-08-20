import { Hono } from 'hono';
import { analyzeEconomics } from '../engines/economics-engine.js';
import { createPaymentMiddleware } from '../middleware/x402-middleware.js';
import { PROVIDER_DATABASE, PRICE_MAP } from '../config.js';

export const economicsRouter = new Hono();

// Protected endpoint requiring x402 payment
economicsRouter.post('/check-economics', createPaymentMiddleware(PRICE_MAP.ECONOMICS), async (c) => {
  try {
    const body = await c.req.json().catch(() => ({}));
    const { intent, providers } = body;

    if (!intent || !intent.budget) {
      return c.json({ error: 'Missing or invalid "intent" object with budget' }, 400);
    }

    const providerList = (providers && Array.isArray(providers) && providers.length > 0)
      ? providers
      : PROVIDER_DATABASE;

    const analysis = await analyzeEconomics(intent, providerList);
    return c.json(analysis);
  } catch (error: any) {
    return c.json({ error: error.message || 'Error processing economics analysis' }, 500);
  }
});
