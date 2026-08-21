import type { RiskVerdict } from './constants';

export interface DemoProvider {
  name: string;
  reputation: number;
  successRate: number;
  sla: number;
  price: number;
  adjustedPrice: number;
  score: number;
  selected: boolean;
}

export interface DemoRisk {
  score: number;
  level: string;
  verdict: RiskVerdict;
  budgetRisk: number;
  frequencyRisk: number;
  injectionRisk: number;
  parameterRisk: number;
  reasons: string[];
}

export interface DemoPayment {
  amount: string;
  asset: string;
  receiver: string;
  network: string;
  facilitator: string;
  status: string;
}

export interface DemoSettlement {
  network: string;
  confirmed: boolean;
  explorerUrl: string;
}

export interface DemoOutcome {
  schemaValidity: boolean;
  freshness: boolean;
  queryMatch: boolean;
  slaCompliance: boolean;
  errors: string[];
  score: number;
  verified: boolean;
  reputationDelta: number;
}

export interface DemoMemory {
  experience: string;
  provider: string;
  intent: string;
  outcome: string;
  quality: number;
  latency: string;
  lesson: string;
}

export interface DemoIntent {
  goal: string;
  action: string;
  budget: string;
}

export interface DemoEconomics {
  budget: string;
  cost: string;
  savings: string;
  optimal: boolean;
  rationale: string;
}

export interface DemoResult {
  intent: DemoIntent;
  risk: DemoRisk;
  economics: DemoEconomics;
  providers: DemoProvider[];
  selectedProvider: DemoProvider;
  payment: DemoPayment;
  settlement: DemoSettlement;
  outcome: DemoOutcome;
  memory: DemoMemory;
}

export function DEMO_DATA(goal: string, budget: string): DemoResult {
  return {
    intent: {
      goal: goal || 'Find the latest blockchain research',
      action: 'Research request',
      budget: budget || '50000',
    },
    risk: {
      score: 18,
      level: 'LOW',
      verdict: 'ALLOW',
      budgetRisk: 12,
      frequencyRisk: 8,
      injectionRisk: 5,
      parameterRisk: 15,
      reasons: [
        'Budget within acceptable range',
        'No injection patterns detected',
        'Parameter validation passed',
        'Frequency within normal limits',
      ],
    },
    economics: {
      budget: budget || '50000',
      cost: '42,000',
      savings: '8,000',
      optimal: true,
      rationale: 'Selected provider offers best value within budget constraints',
    },
    providers: [
      {
        name: 'Provider Alpha',
        reputation: 94.2,
        successRate: 98.5,
        sla: 120,
        price: 45000,
        adjustedPrice: 42000,
        score: 92.4,
        selected: true,
      },
      {
        name: 'Provider Beta',
        reputation: 87.1,
        successRate: 95.2,
        sla: 200,
        price: 38000,
        adjustedPrice: 38000,
        score: 78.3,
        selected: false,
      },
      {
        name: 'Provider Gamma',
        reputation: 91.5,
        successRate: 96.8,
        sla: 150,
        price: 48000,
        adjustedPrice: 45000,
        score: 85.7,
        selected: false,
      },
    ],
    selectedProvider: {
      name: 'Provider Alpha',
      reputation: 94.2,
      successRate: 98.5,
      sla: 120,
      price: 45000,
      adjustedPrice: 42000,
      score: 92.4,
      selected: true,
    },
    payment: {
      amount: '42,000',
      asset: 'microUSDC',
      receiver: '7Z5X...K3FB',
      network: 'Algorand TestNet',
      facilitator: 'x402 Facilitator',
      status: 'confirmed',
    },
    settlement: {
      network: 'Algorand TestNet',
      confirmed: true,
      explorerUrl: 'https://lora.algokit.io/testnet',
    },
    outcome: {
      schemaValidity: true,
      freshness: true,
      queryMatch: true,
      slaCompliance: true,
      errors: [],
      score: 96,
      verified: true,
      reputationDelta: 0.3,
    },
    memory: {
      experience: 'Research request via Provider Alpha',
      provider: 'Provider Alpha',
      intent: 'Research request',
      outcome: 'Successful',
      quality: 96,
      latency: '142ms',
      lesson: 'Provider delivered within SLA. Optimal cost-to-quality ratio confirmed.',
    },
  };
}
