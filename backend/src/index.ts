import 'dotenv/config';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serve } from '@hono/node-server';
import { PORT, ALGORAND_CONFIG, USDC_CONFIG, AVM_ADDRESS } from './config.js';
import { logInfo, logX402 } from './logger.js';
import { analysisRouter } from './routes/analysis.js';
import { economicsRouter } from './routes/economics.js';
import { providerRouter } from './routes/provider.js';
import { paidEndpointsRouter } from './routes/paid-endpoints.js';
import { verificationRouter } from './routes/verification.js';
import { memoryRouter } from './routes/memory.js';
import { orchestratorRouter } from './routes/orchestrator.js';
import { agentRouter } from './routes/agent.js';
import { isGroqAvailable } from './agent/groq-client.js';

export type AppEnv = {
  Variables: {
    paymentVerified?: boolean;
    paymentTxId?: string;
  };
};

export const app = new Hono<AppEnv>();

// CORS — include x402 headers (payment-signature, x-payment-required, payment-response)
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: [
    'Content-Type', 'Authorization',
    // x402 real headers (lowercase canonical)
    'payment-signature', 'x-payment', 'x-payment-required',
    // Legacy aliases from old middleware
    'X-Payment-Signature', 'Payment-Signature'
  ],
  exposeHeaders: [
    'payment-response',    // x402 settlement proof header (real TxID)
    'x-payment-required',  // x402 payment requirements (402 response)
    'Payment-Response'
  ]
}));

// Request logging middleware
app.use('*', async (c, next) => {
  const start = Date.now();
  const timestamp = new Date().toISOString();
  console.log(`\x1b[90m[${timestamp}]\x1b[0m \x1b[34m[HTTP]\x1b[0m ${c.req.method} ${c.req.path}`);
  await next();
  const ms = Date.now() - start;
  console.log(`\x1b[90m[${timestamp}]\x1b[0m \x1b[34m[HTTP]\x1b[0m ${c.req.method} ${c.req.path} -> ${c.res.status} (${ms}ms)`);
});

// ─── Public endpoints ────────────────────────────────────────────────────────

app.get('/health', (c) => {
  return c.json({
    status: 'ok',
    uptime: process.uptime(),
    network: ALGORAND_CONFIG.network,
    usdcAsaId: USDC_CONFIG.asaId,
    receiverAddress: AVM_ADDRESS,
    groqAvailable: isGroqAvailable()
  });
});

app.get('/info', (c) => {
  return c.json({
    name: 'Proto-Y',
    version: '2.0.0',
    description: 'Autonomous Transaction Integrity Layer for Agentic Commerce — x402 on Algorand TestNet',
    network: ALGORAND_CONFIG.network,
    usdcAsaId: USDC_CONFIG.asaId,
    faciltiatorUrl: 'https://facilitator.goplausible.xyz',
    agentAddress: AVM_ADDRESS,
    groqEnabled: isGroqAvailable(),
    layers: [
      '1. Intent & Risk Engine (deterministic)',
      '2. Economic Engine (deterministic)',
      '3. Provider Engine (deterministic)',
      '4. x402 Payment Engine (real Algorand TestNet)',
      '5. Outcome Verifier (deterministic)',
      '6. Reputation & Memory (deterministic)',
      '7. Groq AI Agent Reasoning (LLM layer)'
    ]
  });
});

app.get('/', (c) => {
  return c.json({
    name: 'Proto-Y',
    message: 'Proto-Y Transaction Integrity Layer online — x402 on Algorand TestNet',
    status: 'ready',
    endpoints: {
      health: 'GET /health',
      info: 'GET /info',
      agentExecute: 'POST /api/agent/execute',
      agentStatus: 'GET /api/agent/status',
      research: 'GET /api/v1/research?query=... (x402 protected)',
      orchestrate: 'POST /api/orchestrate'
    }
  });
});

// ─── Mount sub-routers ───────────────────────────────────────────────────────

// Mount under /api prefix
app.route('/api', analysisRouter);
app.route('/api', economicsRouter);
app.route('/api', providerRouter);
app.route('/api', paidEndpointsRouter);
app.route('/api', verificationRouter);
app.route('/api', memoryRouter);
app.route('/api', orchestratorRouter);
app.route('/api', agentRouter);

// Mount without prefix for backward compatibility
app.route('', analysisRouter);
app.route('', economicsRouter);
app.route('', providerRouter);
app.route('', paidEndpointsRouter);
app.route('', verificationRouter);
app.route('', memoryRouter);
app.route('', orchestratorRouter);
app.route('', agentRouter);

// ─── Start server ─────────────────────────────────────────────────────────────

console.log(`\n✓ Proto-Y v2.0 starting on http://localhost:${PORT}`);
logInfo(`Algorand Network: ${ALGORAND_CONFIG.network}`);
logInfo(`USDC ASA ID: ${USDC_CONFIG.asaId}`);
logInfo(`Receiver (payTo): ${AVM_ADDRESS}`);
logInfo(`Facilitator: https://facilitator.goplausible.xyz`);
logX402(`x402 Real Protocol: @x402-avm/hono SDK (GoPlausible)`);
logInfo(`Groq AI Agent: ${isGroqAvailable() ? '✅ ENABLED' : '⚠️  GROQ_API_KEY not set — Groq disabled, deterministic fallback active'}`);

serve({
  fetch: app.fetch,
  port: PORT
});