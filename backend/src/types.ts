export interface AgentIntent {
  goal: string;
  budget: number;
  priority: string;
  category?: string;
}

export interface RiskAssessment {
  score: number;
  flags: string[];
  recommendation: 'ALLOW' | 'DENY' | 'ESCALATE';
}

export interface ProviderOption {
  id: string;
  name: string;
  reputation: number;
  price: number;
  sla: number;
  healthStatus?: string;
}

export interface EconomicsAnalysis {
  totalCost: number;
  unitPrice: number;
  valueRatio: number;
  recommendedProvider?: string;
  alternatives?: ProviderOption[];
  withinBudget: boolean;
  savingsOpportunity?: number;
}

export interface OutcomeVerification {
  isValid: boolean;
  qualityScore: number;
  proof: string;
  breakdown?: any;
  recommendation: 'TRUST' | 'CONDITIONAL' | 'DISTRUST';
}

export interface AgentMemory {
  id: string;
  agentId: string;
  providerId: string;
  paymentTxId?: string;
  intent?: AgentIntent;
  outcome?: OutcomeVerification;
  timestamp: Date;
  lessonsLearned?: string[];
}

export interface PaymentReceipt {
  txId: string;
  from: string;
  to: string;
  amount: number;
  asset: number;
  timestamp: Date;
  settlementTime?: number;
}
