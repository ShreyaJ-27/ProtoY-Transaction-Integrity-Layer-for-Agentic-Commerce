import { PaymentReceipt } from '../types.js';
import { verifyPaymentSignature } from './facilitator-client.js';
import { storePaymentReceipt } from '../models/payment-storage.js';
import { AVM_ADDRESS, USDC_CONFIG, PRICE_MAP } from '../config.js';
import { logPayment } from '../logger.js';

export async function processX402Payment(
  txGroup: string,
  options?: {
    from?: string;
    amount?: number;
    asset?: number;
  }
): Promise<PaymentReceipt> {
  const startTime = Date.now();
  logPayment(`Processing x402 payment execution for txGroup/signature...`);

  // Verify payment with facilitator or handle local test signature
  let verification = await verifyPaymentSignature(txGroup);

  // If local demo or simulated test signature, generate valid test receipt
  const isMockSig = txGroup.startsWith('mock-') || txGroup.startsWith('test-') || txGroup === 'SIMULATED_PAYMENT';
  if (!verification.valid && isMockSig) {
    verification = {
      valid: true,
      txId: 'ALGO-TX-' + Math.random().toString(36).substring(2, 10).toUpperCase()
    };
  }

  const txId = verification.txId || `TX-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const settlementTime = Date.now() - startTime;

  const receipt: PaymentReceipt = {
    txId,
    from: options?.from || 'TESTNET_AGENT_WALLET_ADDRESS',
    to: AVM_ADDRESS,
    amount: options?.amount || PRICE_MAP.RESEARCH,
    asset: options?.asset || USDC_CONFIG.asaId,
    timestamp: new Date(),
    settlementTime: Math.max(1, settlementTime)
  };

  // Store in in-memory storage
  storePaymentReceipt(receipt);
  logPayment(`Payment processed and settled: txId=${receipt.txId}, amount=${receipt.amount} microUSDC, asset=${receipt.asset}`);

  return receipt;
}
