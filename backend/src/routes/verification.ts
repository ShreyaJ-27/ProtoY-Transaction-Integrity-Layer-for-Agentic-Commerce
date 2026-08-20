import { Hono } from 'hono';
import { verifyOutcome } from '../engines/outcome-verifier.js';
import { storeOutcomeProof } from '../models/outcome-storage.js';
import { PROVIDER_DATABASE } from '../config.js';

export const verificationRouter = new Hono();

// Outcome verification route
verificationRouter.post('/verify-outcome', async (c) => {
  try {
    const body = await c.req.json().catch(() => ({}));
    const { request, response, providerId, responseTimeMs } = body;

    const provider = PROVIDER_DATABASE.find(p => p.id === providerId) || {
      id: providerId || 'custom-provider',
      name: 'Custom Provider',
      reputation: 0.9,
      price: 10000,
      sla: 99.0
    };

    const outcome = await verifyOutcome(request, response, provider, responseTimeMs);
    return c.json(outcome);
  } catch (error: any) {
    return c.json({ error: error.message || 'Error processing outcome verification' }, 500);
  }
});

// Outcome storage route
verificationRouter.post('/store-outcome', async (c) => {
  try {
    const body = await c.req.json().catch(() => ({}));
    const { paymentTxId, outcome } = body;

    if (!paymentTxId || !outcome) {
      return c.json({ error: 'Missing paymentTxId or outcome payload' }, 400);
    }

    storeOutcomeProof({
      paymentTxId,
      responseHash: outcome.proof || 'sha256-proof',
      timestamp: new Date(),
      verificationScore: outcome.qualityScore ?? 0,
      verified: outcome.isValid ?? false,
      outcome
    });

    return c.json({
      success: true,
      message: 'Outcome stored successfully in memory for agent learning',
      paymentTxId
    });
  } catch (error: any) {
    return c.json({ error: error.message || 'Error storing outcome' }, 500);
  }
});
