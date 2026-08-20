import { OutcomeVerification } from '../types.js';

export interface OutcomeProof {
  paymentTxId: string;
  responseHash: string;
  timestamp: Date;
  verificationScore: number;
  verified: boolean;
  outcome?: OutcomeVerification;
}

export const outcomeStorage = new Map<string, OutcomeProof>();

export function storeOutcomeProof(proof: OutcomeProof): void {
  outcomeStorage.set(proof.paymentTxId, proof);
}

export function getOutcomeProof(paymentTxId: string): OutcomeProof | undefined {
  return outcomeStorage.get(paymentTxId);
}

export function getAllOutcomeProofs(): OutcomeProof[] {
  return Array.from(outcomeStorage.values());
}
