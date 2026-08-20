/**
 * REAL x402 Payment Middleware using @x402-avm/hono + @x402-avm/avm/exact/server
 *
 * This replaces the previous hand-rolled approximation with the actual x402 protocol
 * implementation from GoPlausible/x402-avm.
 *
 * Protocol flow:
 *  1. Request arrives with no `payment-signature` header
 *  2. SDK issues HTTP 402 with proper `x402Version`, `accepts[]` structure
 *  3. Client creates a real Algorand ASA transfer transaction, gets it signed
 *  4. Client base64-encodes the PaymentPayload and sends it in `payment-signature` header
 *  5. This middleware decodes, verifies, then SETTLES via the GoPlausible facilitator
 *  6. On settlement success the handler is called and the response is returned with
 *     a `payment-response` header containing the settlement proof (real Algorand TxID)
 */
import { paymentMiddleware } from '@x402-avm/hono';
import { HTTPFacilitatorClient, x402ResourceServer } from '@x402-avm/core/server';
import { registerExactAvmScheme } from '@x402-avm/avm/exact/server';
import type { Network } from '@x402-avm/core/types';
import { ALGORAND_CONFIG, USDC_CONFIG, AVM_ADDRESS, FACILITATOR_CONFIG, PRICE_MAP } from '../config.js';
import { logX402, logPayment } from '../logger.js';

// CAIP-2 Testnet network ID (canonical form from @x402-avm/avm constants)
export const ALGORAND_TESTNET_CAIP2 = 'algorand:SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI=';

/**
 * Build the real x402 Hono middleware for a given route price.
 * Uses the GoPlausible HTTPFacilitatorClient to verify & settle on Algorand Testnet.
 *
 * @param priceInMicroUsdc   Amount in microUSDC (e.g. 50000 = 0.05 USDC)
 * @param resourceDescription Human-readable label for this resource
 */
export function createX402Middleware(
  priceInMicroUsdc: number = PRICE_MAP.RESEARCH,
  resourceDescription: string = 'Proto-Y AI Research'
) {
  logX402(`Registering x402 middleware: ${priceInMicroUsdc} microUSDC → ${AVM_ADDRESS} on ${ALGORAND_CONFIG.network}`);

  // 1. Create the GoPlausible HTTP facilitator client
  const facilitatorClient = new HTTPFacilitatorClient({
    url: FACILITATOR_CONFIG.url
  });

  // 2. Build a ResourceServer with the ExactAvmScheme registered for Algorand
  const resourceServer = new x402ResourceServer(facilitatorClient);
  registerExactAvmScheme(resourceServer); // registers algorand:* wildcard

  // 3. Define the route payment requirements using the official Price format
  //    Asset amounts use the AssetAmount object format: { amount: string; asset: string }
  const price: { amount: string; asset: string } = {
    amount: priceInMicroUsdc.toString(),
    asset: USDC_CONFIG.asaId.toString()   // "10458941" for TestNet USDC
  };

  const routeConfig = {
    accepts: {
      scheme: 'exact' as const,
      network: ALGORAND_TESTNET_CAIP2 as Network,
      payTo: AVM_ADDRESS,
      price,
      maxTimeoutSeconds: 3600
    },
    description: resourceDescription
  };

  logPayment(`x402 route config: payTo=${AVM_ADDRESS}, asset=${USDC_CONFIG.asaId}, amount=${priceInMicroUsdc}`);

  return paymentMiddleware(routeConfig, resourceServer);
}

/**
 * Convenience: pre-built middleware for each Proto-Y service tier.
 */
export const intentPaymentMiddleware = () => createX402Middleware(PRICE_MAP.INTENT, 'Intent Analysis');
export const economicsPaymentMiddleware = () => createX402Middleware(PRICE_MAP.ECONOMICS, 'Economics Analysis');
export const providerPaymentMiddleware = () => createX402Middleware(PRICE_MAP.PROVIDER, 'Provider Selection');
export const researchPaymentMiddleware = () => createX402Middleware(PRICE_MAP.RESEARCH, 'AI Research');
