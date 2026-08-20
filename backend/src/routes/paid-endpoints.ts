import { Hono } from 'hono';
import { createX402Middleware } from '../middleware/x402-real-middleware.js';
import { handleResearch } from '../handlers/research-handler.js';
import { storePaymentReceipt } from '../models/payment-storage.js';
import { AVM_ADDRESS, USDC_CONFIG, PRICE_MAP } from '../config.js';
import { logX402, logPayment } from '../logger.js';
import { decodePaymentSignatureHeader } from '@x402-avm/core/http';

export const paidEndpointsRouter = new Hono();

/**
 * GET /api/v1/research?query=...
 *
 * Real x402 protected endpoint:
 * - No payment-signature → 402 with x402 payment requirements (real SDK)
 * - With valid payment-signature → GoPlausible verifies + settles → 200 with research data
 * - Settlement produces real Algorand TestNet TxID in payment-response header
 */
paidEndpointsRouter.get(
  '/v1/research',
  createX402Middleware(PRICE_MAP.RESEARCH, 'Proto-Y AI Research API'),
  async (c) => {
    const query = c.req.query('query') || 'Autonomous Agent Payments';
    const detailLevel = c.req.query('detailLevel') || 'standard';

    // Extract sender address from the payment payload header for receipt
    let payerAddress = 'unknown';
    const paymentSigHeader = c.req.header('payment-signature');
    if (paymentSigHeader) {
      try {
        const payload = decodePaymentSignatureHeader(paymentSigHeader);
        const innerPayload = (payload as any).payload as any;
        if (innerPayload?.paymentGroup && Array.isArray(innerPayload.paymentGroup)) {
          payerAddress = 'algorand-signer';
        }
      } catch (_) {
        // Non-critical: can't extract address from payload
      }
    }

    logX402(`[SERVER] Payment verified for research query: "${query}"`);

    // Execute the research service
    const researchData = await handleResearch(query, detailLevel);

    // Create payment receipt — TxID will be in the payment-response header
    // The real TxID is set by the x402 middleware via payment-response header
    // We record a receipt here for internal tracking; the TxID will be in the response header
    const receipt = {
      txId: `proto-y-settlement-${Date.now()}`,
      from: payerAddress,
      to: AVM_ADDRESS,
      amount: PRICE_MAP.RESEARCH,
      asset: USDC_CONFIG.asaId,
      timestamp: new Date(),
      settlementTime: 0,
      pending: true // Real TxID is in payment-response header
    };
    storePaymentReceipt(receipt);
    logPayment(`[SERVER] Internal receipt created. Real TxID in payment-response header.`);

    return c.json({
      success: true,
      query,
      network: 'algorand-testnet',
      assetId: USDC_CONFIG.asaId,
      amountCharged: PRICE_MAP.RESEARCH,
      payTo: AVM_ADDRESS,
      data: researchData,
      note: 'Real Algorand TestNet settlement. Check payment-response header for TxID.'
    });
  }
);
