import { MiddlewareHandler } from 'hono';
import { ALGORAND_CONFIG, USDC_CONFIG, AVM_ADDRESS, PRICE_MAP } from '../config.js';
import { verifyPaymentSignature } from '../utils/facilitator-client.js';
import { logPayment } from '../logger.js';

export interface PaymentRequirement {
  scheme: string;
  network: string;
  amount: string;
  asset: number;
  receiver: string;
  timeout: number;
}

export function createPaymentMiddleware(customAmount?: number): MiddlewareHandler<any> {
  return async (c, next) => {
    // Check for payment signature headers (case-insensitive)
    const paymentSignature =
      c.req.header('X-Payment-Signature') ||
      c.req.header('x-payment-signature') ||
      c.req.header('Payment-Signature') ||
      c.req.header('payment-signature');

    const amountToCharge = (customAmount ?? PRICE_MAP.RESEARCH).toString();

    // If no payment signature provided, respond with HTTP 402 Payment Required
    if (!paymentSignature) {
      logPayment(`HTTP 402: Payment required for ${c.req.path} (${amountToCharge} microUSDC)`);
      
      const paymentResponsePayload: PaymentRequirement = {
        scheme: 'exact',
        network: ALGORAND_CONFIG.networkId,
        amount: amountToCharge,
        asset: USDC_CONFIG.asaId,
        receiver: AVM_ADDRESS,
        timeout: 3600
      };

      const paymentResponseHeader = JSON.stringify(paymentResponsePayload);
      
      c.header('Payment-Response', paymentResponseHeader);
      c.header('payment-response', paymentResponseHeader);

      return c.json(
        {
          error: 'Payment Required',
          message: 'This endpoint requires an x402 payment on Algorand Testnet',
          paymentDetails: paymentResponsePayload
        },
        402
      );
    }

    // Payment signature present, verify with facilitator
    logPayment(`Payment signature detected for ${c.req.path}. Verifying...`);
    const verification = await verifyPaymentSignature(paymentSignature);

    if (verification.valid) {
      logPayment(`Payment signature verified successfully for txId: ${verification.txId}`);
      c.set('paymentVerified', true);
      c.set('paymentTxId', verification.txId);
      (c.env as any).paymentVerified = true;
      (c.env as any).paymentTxId = verification.txId;
      await next();
    } else {
      logPayment(`Invalid payment signature rejected: ${verification.error || 'Verification failed'}`);
      return c.json(
        {
          error: 'Forbidden',
          message: 'Payment verification failed or invalid signature',
          details: verification.error
        },
        403
      );
    }
  };
}
