import { PaymentReceipt } from '../types.js';

export const paymentStorage = new Map<string, PaymentReceipt>();

export function storePaymentReceipt(receipt: PaymentReceipt): void {
  paymentStorage.set(receipt.txId, receipt);
}

export function getPaymentReceipt(txId: string): PaymentReceipt | undefined {
  return paymentStorage.get(txId);
}

export function getAllPaymentReceipts(): PaymentReceipt[] {
  return Array.from(paymentStorage.values());
}
