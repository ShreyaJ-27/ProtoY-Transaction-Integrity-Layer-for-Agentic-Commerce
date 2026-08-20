import 'dotenv/config';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serve } from '@hono/node-server';
import { PORT, ALGORAND_CONFIG, USDC_CONFIG } from './config.js';
import { logInfo } from './logger.js';
import { createPaymentMiddleware } from './middleware/x402-middleware.js';
import { analysisRouter } from './routes/analysis.js';
import { economicsRouter } from './routes/economics.js';
import { providerRouter } from './routes/provider.js';

export type AppEnv = {
  Variables: {
    paymentVerified?: boolean;
    paymentTxId?: string;
  };
};

export const app = new Hono<AppEnv>();

// CORS middleware
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-Payment-Signature', 'Payment-Signature', 'payment-response', 'Payment-Response'],
  exposeHeaders: ['Payment-Response', 'payment-response']
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

// Base public health and info endpoints
app.get('/health', (c) => {
  return c.json({
    status: 'ok',
    uptime: process.uptime(),
    network: ALGORAND_CONFIG.network,
    usdcAsaId: USDC_CONFIG.asaId
  });
});

app.get('/info', (c) => {
  return c.json({
    name: 'Proto-Y',
    version: '1.0.0',
    description: 'Autonomous Transaction Integrity Layer for Agentic Commerce',
    network: ALGORAND_CONFIG.network,
    usdcAsaId: USDC_CONFIG.asaId,
    layers: [
      '1. Intent & Risk Engine',
      '2. Economic Engine',
      '3. Provider Engine',
      '4. x402 Payment Engine',
      '5. Outcome Verifier',
      '6. Reputation & Memory'
    ]
  });
});

app.get('/', (c) => {
  return c.json({
    name: 'Proto-Y',
    message: 'Proto-Y Transaction Integrity Layer online',
    status: 'ready'
  });
});

// Test protected x402 endpoint
app.get('/api/test', createPaymentMiddleware(50000), (c) => {
  return c.json({
    status: 'success',
    message: 'Payment verified! Access granted to protected resource.',
    paymentVerified: true,
    txId: c.get('paymentTxId') || (c.env as any)?.paymentTxId
  });
});

// Mount modular sub-routers under both /api and root paths for maximum compatibility
app.route('/api', analysisRouter);
app.route('/api', economicsRouter);
app.route('/api', providerRouter);

app.route('', analysisRouter);
app.route('', economicsRouter);
app.route('', providerRouter);

// Start server
console.log(`✓ Proto-Y server running on http://localhost:${PORT}`);
logInfo(`Algorand Network: ${ALGORAND_CONFIG.network} (Node: ${ALGORAND_CONFIG.nodeUrl})`);
logInfo(`USDC ASA ID: ${USDC_CONFIG.asaId}`);

serve({
  fetch: app.fetch,
  port: PORT
});