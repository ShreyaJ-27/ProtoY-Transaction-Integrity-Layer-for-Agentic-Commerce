// Proto-Y pipeline stages in processing order.
export type StageId =
  | 'groq'
  | 'intent'
  | 'risk'
  | 'economics'
  | 'provider'
  | 'x402'
  | 'algorand'
  | 'outcome'
  | 'memory';

export interface StageDef {
  id: StageId;
  label: string;
  short: string;
  color: string;
  description: string;
}

// Ordered pipeline. Drives the 3D node ring, the timeline, and the state machine.
export const PIPELINE: StageDef[] = [
  { id: 'groq', label: 'GROQ', short: 'GRQ', color: '#9B8CFF', description: 'Reasoning proposal' },
  { id: 'intent', label: 'INTENT', short: 'INT', color: '#65E6FF', description: 'Intent extraction' },
  { id: 'risk', label: 'RISK', short: 'RSK', color: '#FFB547', description: 'Safety evaluation' },
  { id: 'economics', label: 'ECONOMICS', short: 'ECO', color: '#65E6FF', description: 'Value optimization' },
  { id: 'provider', label: 'PROVIDER', short: 'PRV', color: '#9B8CFF', description: 'Best service selected' },
  { id: 'x402', label: 'x402', short: 'X402', color: '#FFB547', description: 'Payment authorization' },
  { id: 'algorand', label: 'ALGORAND', short: 'ALG', color: '#36E0A0', description: 'Settlement' },
  { id: 'outcome', label: 'OUTCOME', short: 'OUT', color: '#65E6FF', description: 'Result verification' },
  { id: 'memory', label: 'MEMORY', short: 'MEM', color: '#9B8CFF', description: 'Experience stored' },
];

export const NODE_DESCRIPTIONS: Record<StageId, string> = {
  groq: 'Reasoning Engine',
  intent: 'Intent Extraction',
  risk: 'Deterministic Safety',
  economics: 'Value Optimization',
  provider: 'Service Selection',
  x402: 'Payment Authorization',
  algorand: 'Settlement',
  outcome: 'Result Verification',
  memory: 'Experience Storage',
};

export const STAGE_BY_ID: Record<StageId, StageDef> = PIPELINE.reduce(
  (acc, s) => {
    acc[s.id] = s;
    return acc;
  },
  {} as Record<StageId, StageDef>,
);

// Application-level states. These map to the 3D scene + UI.
export type AppState =
  | 'IDLE'
  | 'ANALYZING'
  | 'RISK'
  | 'ECONOMICS'
  | 'PROVIDER'
  | 'PAYMENT'
  | 'SETTLEMENT'
  | 'OUTCOME'
  | 'MEMORY'
  | 'SUCCESS'
  | 'FAILED'
  | 'PAYMENT_REQUIRED';

// Timeline item labels (the human story of a transaction).
export const TIMELINE_STEPS = [
  'Intent extracted',
  'Risk evaluated',
  'Economics optimized',
  'Provider selected',
  'HTTP 402',
  'Payment authorized',
  'Algorand settlement',
  'Outcome verified',
  'Reputation updated',
  'Memory stored',
] as const;

export type TimelineStep = (typeof TIMELINE_STEPS)[number];

// Risk thresholds.
export const RISK_THRESHOLDS = {
  ALLOW_MAX: 50,
  ESCALATE_MAX: 75,
  DENY_MAX: 100,
} as const;

export type RiskVerdict = 'ALLOW' | 'ESCALATE' | 'DENY';

export function riskVerdictFromScore(score: number): RiskVerdict {
  if (score <= RISK_THRESHOLDS.ALLOW_MAX) return 'ALLOW';
  if (score <= RISK_THRESHOLDS.ESCALATE_MAX) return 'ESCALATE';
  return 'DENY';
}

// Navigation sections.
export type NavSection =
  | 'control'
  | 'execute'
  | 'risk'
  | 'providers'
  | 'settlement'
  | 'outcomes'
  | 'memory'
  | 'system';

export const NAV_ITEMS: { id: NavSection; label: string }[] = [
  { id: 'control', label: 'CONTROL' },
  { id: 'execute', label: 'EXECUTE' },
  { id: 'risk', label: 'RISK' },
  { id: 'providers', label: 'PROVIDERS' },
  { id: 'settlement', label: 'SETTLEMENT' },
  { id: 'outcomes', label: 'OUTCOMES' },
  { id: 'memory', label: 'MEMORY' },
  { id: 'system', label: 'SYSTEM' },
];
