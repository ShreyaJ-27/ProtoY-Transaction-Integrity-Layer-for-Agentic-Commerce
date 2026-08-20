/**
 * x402 Payment Client for Algorand TestNet
 *
 * This client implements the REAL x402 payment lifecycle:
 *
 *  1. HTTP GET → 402 Payment Required
 *  2. Parse PaymentRequired from the canonical `payment-required` header (base64-encoded)
 *  3. Build + sign a real Algorand ASA transfer using toClientAvmSigner
 *  4. Encode PaymentPayload → base64 → set as `payment-signature` header
 *  5. Retry the original request
 *  6. 200 OK → parse settlement proof from `payment-response` header
 *
 * SECURITY:
 *  - Private key MUST be in AGENT_PRIVATE_KEY env var (base64-encoded 64-byte key)
 *  - Never hardcoded, never logged
 */
import { x402Client, x402HTTPClient } from '@x402-avm/core/client';
import { toClientAvmSigner } from '@x402-avm/avm';
import { registerExactAvmScheme } from '@x402-avm/avm/exact/client';
import { decodePaymentRequiredHeader, decodePaymentResponseHeader, encodePaymentSignatureHeader } from '@x402-avm/core/http';
import axios, { AxiosResponse } from 'axios';
import { logX402, logAlgorand, logPayment } from '../logger.js';
import { ALGORAND_CONFIG } from '../config.js';

export interface X402ClientResult {
  success: boolean;
  statusCode: number;
  data?: any;
  paymentTxId?: string;
  payerAddress?: string;
  error?: string;
  paymentRequired?: any;
}

/**
 * Execute a real x402 payment flow against a protected URL.
 * Uses the AGENT_PRIVATE_KEY env var for signing.
 */
export async function executeX402Request(
  url: string,
  params?: Record<string, string>
): Promise<X402ClientResult> {
  const privateKeyBase64 = process.env.AGENT_PRIVATE_KEY;

  if (!privateKeyBase64) {
    return {
      success: false,
      statusCode: 500,
      error: 'AGENT_PRIVATE_KEY environment variable not set. Cannot sign payment transactions.'
    };
  }

  // 1. Create the AVM signer from private key
  const signer = toClientAvmSigner(privateKeyBase64);
  logX402(`[CLIENT] Agent wallet address: ${signer.address}`);

  // 2. Build x402Client with ExactAvmScheme registered for Algorand
  const baseClient = new x402Client();
  registerExactAvmScheme(baseClient, {
    signer,
    algodConfig: {
      algodUrl: ALGORAND_CONFIG.nodeUrl,
      algodToken: ''
    }
  });
  const httpClient = new x402HTTPClient(baseClient);

  // 3. Initial request — expect 402
  logX402(`[CLIENT] Initial request to: ${url}`);
  let initResponse: AxiosResponse;
  try {
    initResponse = await axios.get(url, {
      params,
      validateStatus: () => true // Don't throw on 4xx
    });
  } catch (err: any) {
    return { success: false, statusCode: 0, error: `Network error: ${err.message}` };
  }

  if (initResponse.status !== 402) {
    logX402(`[CLIENT] Expected 402, got ${initResponse.status}`);
    return {
      success: initResponse.status === 200,
      statusCode: initResponse.status,
      data: initResponse.data
    };
  }

  logX402(`[CLIENT] HTTP 402 received — parsing payment requirements`);

  // 4. Parse PaymentRequired from the canonical x402 header.
  const paymentRequiredHeader = initResponse.headers['payment-required']
    ?? initResponse.headers['x-payment-required'];
  if (!paymentRequiredHeader) {
    return {
      success: false,
      statusCode: 402,
      error: 'No payment-required header in 402 response. Server may not be using real x402 SDK.'
    };
  }

  let paymentRequired: any;
  try {
    paymentRequired = decodePaymentRequiredHeader(paymentRequiredHeader);
    logX402(`[CLIENT] Payment requirements: version=${paymentRequired.x402Version}, accepts=${paymentRequired.accepts?.length} option(s)`);
  } catch (err: any) {
    return {
      success: false,
      statusCode: 402,
      error: `Failed to decode payment requirements: ${err.message}`
    };
  }

  // 5. Create signed payment payload
  logX402(`[CLIENT] Creating Algorand payment payload...`);
  let paymentPayload: any;
  try {
    paymentPayload = await httpClient.createPaymentPayload(paymentRequired);
    logAlgorand(`[CLIENT] Payment payload created (scheme: ${paymentPayload?.scheme}, network: ${paymentPayload?.network})`);
  } catch (err: any) {
    return {
      success: false,
      statusCode: 402,
      error: `Failed to create payment payload: ${err.message}`
    };
  }

  // 6. Encode to header value
  const paymentHeaders = httpClient.encodePaymentSignatureHeader(paymentPayload);
  logX402(`[CLIENT] Payment signature encoded, retrying request...`);
  logAlgorand(`[CLIENT] Submitting signed Algorand transaction to GoPlausible facilitator...`);

  // 7. Retry with payment signature
  let paidResponse: AxiosResponse;
  try {
    paidResponse = await axios.get(url, {
      params,
      headers: paymentHeaders,
      validateStatus: () => true
    });
  } catch (err: any) {
    return { success: false, statusCode: 0, error: `Network error on retry: ${err.message}` };
  }

  // 8. Parse settlement result from payment-response header
  const paymentResponseHeader = paidResponse.headers['payment-response'];
  let paymentTxId: string | undefined;
  let payerAddress: string | undefined;

  if (paymentResponseHeader) {
    try {
      const settleResponse = decodePaymentResponseHeader(paymentResponseHeader);
      paymentTxId = settleResponse.transaction;
      payerAddress = settleResponse.payer;
      logAlgorand(`[CLIENT] Settlement confirmed! TxID: ${paymentTxId}`);
      logPayment(`[CLIENT] Payment settled on Algorand TestNet. TxID=${paymentTxId}, Payer=${payerAddress}`);
    } catch (err: any) {
      logX402(`[CLIENT] Could not decode payment-response header: ${err.message}`);
    }
  }

  if (paidResponse.status === 200) {
    logX402(`[CLIENT] ✅ HTTP 200 received after payment settlement`);
    return {
      success: true,
      statusCode: 200,
      data: paidResponse.data,
      paymentTxId,
      payerAddress,
      paymentRequired
    };
  }

  return {
    success: false,
    statusCode: paidResponse.status,
    data: paidResponse.data,
    paymentTxId,
    error: `Unexpected status after payment: ${paidResponse.status}`
  };
}
