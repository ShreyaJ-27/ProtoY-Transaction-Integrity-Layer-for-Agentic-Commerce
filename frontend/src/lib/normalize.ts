import { riskVerdictFromScore, type RiskVerdict } from './constants';
import type { AgentExecuteResponse } from './api';

// A normalized view of the backend response. Every field is optional because
// the backend shape is not guaranteed. The UI degrades gracefully when a field
// is absent rather than inventing values.
export interface ProviderInfo {
  name?: string;
  reputation?: number;
  successRate?: number;
  sla?: number | string;
  price?: number | string;
  adjustedPrice?: number | string;
  score?: number;
  selected?: boolean;
}

export interface RiskInfo {
  score?: number;
  level?: string;
  verdict?: RiskVerdict;
  budgetRisk?: number;
  frequencyRisk?: number;
  injectionRisk?: number;
  parameterRisk?: number;
  reasons?: string[];
}

export interface PaymentInfo {
  amount?: string | number;
  asset?: string;
  receiver?: string;
  network?: string;
  transactionId?: string;
  facilitator?: string;
  status?: string;
}

export interface SettlementInfo {
  network?: string;
  transactionId?: string;
  round?: number | string;
  confirmed?: boolean;
  explorerUrl?: string;
}

export interface OutcomeInfo {
  schemaValidity?: boolean | string;
  freshness?: boolean | string;
  queryMatch?: boolean | string;
  slaCompliance?: boolean | string;
  errors?: string[];
  score?: number;
  verified?: boolean;
  reputationDelta?: number;
}

export interface MemoryInfo {
  experience?: string;
  provider?: string;
  intent?: string;
  outcome?: string;
  quality?: number | string;
  latency?: number | string;
  lesson?: string;
  entries?: Array<{
    experience?: string;
    provider?: string;
    intent?: string;
    outcome?: string;
    quality?: number | string;
    latency?: number | string;
    lesson?: string;
  }>;
}

export interface IntentInfo {
  goal?: string;
  action?: string;
  target?: string;
  parameters?: Record<string, unknown>;
  budget?: string | number;
}

export interface EconomicsInfo {
  budget?: string | number;
  cost?: string | number;
  savings?: string | number;
  optimal?: boolean;
  rationale?: string;
}

export interface NormalizedResult {
  ok: boolean;
  raw: AgentExecuteResponse;
  intent?: IntentInfo;
  risk?: RiskInfo;
  economics?: EconomicsInfo;
  providers?: ProviderInfo[];
  selectedProvider?: ProviderInfo;
  payment?: PaymentInfo;
  settlement?: SettlementInfo;
  service?: { status?: string };
  outcome?: OutcomeInfo;
  memory?: MemoryInfo;
  error?: string;
  success?: boolean;
  reputation?: {
    providerId?: string;
    newReputation?: number;
    updated?: boolean;
  };
}

function num(v: unknown): number | undefined {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string') {
    const n = Number(v);
    if (Number.isFinite(n)) return n;
  }
  return undefined;
}

function str(v: unknown): string | undefined {
  if (typeof v === 'string' && v.length > 0) return v;
  return undefined;
}

function boolOrStr(v: unknown): boolean | string | undefined {
  if (typeof v === 'boolean') return v;
  if (typeof v === 'string') return v;
  return undefined;
}

function pick<T = unknown>(obj: Record<string, unknown>, keys: string[]): T | undefined {
  for (const k of keys) {
    if (k in obj && obj[k] !== undefined && obj[k] !== null) {
      return obj[k] as T;
    }
  }
  // case-insensitive fallback
  const lower = Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [k.toLowerCase(), v]),
  );
  for (const k of keys) {
    const lk = k.toLowerCase();
    if (lk in lower && lower[lk] !== undefined && lower[lk] !== null) {
      return lower[lk] as T;
    }
  }
  return undefined;
}

function asRecord(v: unknown): Record<string, unknown> | undefined {
  if (v && typeof v === 'object' && !Array.isArray(v)) return v as Record<string, unknown>;
  return undefined;
}

function asArray(v: unknown): unknown[] | undefined {
  if (Array.isArray(v)) return v;
  return undefined;
}

export function normalizeResult(raw: AgentExecuteResponse): NormalizedResult {
  const root = asRecord(raw) ?? {};
  const ok = !pick(root, ['error', 'failed']);
  const error = str(pick(root, ['error', 'message', 'failure', 'reason']));

  const selectedBackend = raw.provider?.provider;
  const backendSelectedProvider = selectedBackend
    ? {
        name: selectedBackend.name,
        reputation: selectedBackend.reputation,
        sla: selectedBackend.sla,
        price: selectedBackend.price,
        score: raw.provider?.confidenceScore,
        selected: true,
      }
    : undefined;
  const backendProviders = raw.economics?.alternatives?.map((provider) => ({
    name: provider.name,
    reputation: provider.reputation,
    sla: provider.sla,
    price: provider.price,
    selected: provider.id === selectedBackend?.id,
  }));

  if (raw.agent && raw.payment && raw.memory) {
    return {
      ok,
      raw,
      intent: raw.intent
        ? { goal: raw.intent.goal, action: raw.intent.category, budget: raw.intent.budget }
        : undefined,
      risk: raw.risk
        ? {
            score: raw.risk.score,
            verdict: raw.risk.recommendation,
            reasons: raw.risk.flags,
          }
        : undefined,
      economics: raw.economics
        ? {
            budget: raw.intent?.budget,
            cost: raw.economics.totalCost,
            savings: raw.economics.savingsOpportunity,
            optimal: raw.economics.withinBudget,
            rationale: raw.economics.recommendedProvider,
          }
        : undefined,
      providers: backendProviders,
      selectedProvider: backendSelectedProvider,
      payment: {
        amount: raw.payment.amount,
        asset: raw.payment.assetId.toString(),
        receiver: raw.payment.receiverAddress,
        network: raw.payment.network,
        transactionId: raw.payment.transactionId,
        status: raw.payment.status,
        facilitator: raw.payment.note,
      },
      settlement:
        raw.payment.status === 'SETTLED' || raw.payment.transactionId
          ? {
              network: raw.payment.network,
              transactionId: raw.payment.transactionId,
              confirmed: raw.payment.status === 'SETTLED',
            }
          : undefined,
          service: raw.service ? { status: raw.service.status } : undefined,
      outcome: raw.outcome
        ? {
            schemaValidity: raw.outcome.breakdown?.schema !== undefined ? raw.outcome.breakdown.schema > 0 : undefined,
            freshness: raw.outcome.breakdown?.freshness !== undefined ? raw.outcome.breakdown.freshness > 0 : undefined,
            queryMatch: raw.outcome.breakdown?.match !== undefined ? raw.outcome.breakdown.match > 0 : undefined,
            slaCompliance: raw.outcome.breakdown?.sla !== undefined ? raw.outcome.breakdown.sla > 0 : undefined,
            score: raw.outcome.score,
            verified: raw.outcome.classification !== 'DISTRUST',
          }
        : undefined,
      reputation: raw.reputation,
      memory: {
        experience: raw.memory.updated ? `${raw.memory.lessonsStored.length} lesson(s) stored` : undefined,
        provider: selectedBackend?.name,
        intent: raw.intent?.category,
        outcome: raw.outcome?.classification,
        quality: raw.outcome?.score,
        lesson: raw.memory.lessonsStored[0],
      },
      success: raw.success,
      error: raw.error,
    };
  }

  // Intent
  const intentRaw = asRecord(pick(root, ['intent', 'intent_analysis', 'intentAnalysis'])) ?? root;
  const intent: IntentInfo | undefined = (() => {
    if (!intentRaw || Object.keys(intentRaw).length === 0) return undefined;
    return {
      goal: str(pick(intentRaw, ['goal', 'query', 'request', 'task', 'objective'])),
      action: str(pick(intentRaw, ['action', 'type', 'operation'])),
      target: str(pick(intentRaw, ['target', 'provider', 'endpoint'])),
      parameters: asRecord(pick(intentRaw, ['parameters', 'params', 'args'])) as
        | Record<string, unknown>
        | undefined,
      budget: pick(intentRaw, ['budget', 'max_budget', 'maxBudget']),
    };
  })();

  // Risk
  const riskRaw = asRecord(pick(root, ['risk', 'risk_assessment', 'riskAssessment', 'risk_engine', 'riskEngine']));
  const riskScore = riskRaw ? num(pick(riskRaw, ['score', 'risk_score', 'riskScore', 'total', 'risk'])) : undefined;
  const risk: RiskInfo | undefined = (() => {
    if (!riskRaw && riskScore === undefined) return undefined;
    const reasonsArr = asArray(pick(riskRaw ?? {}, ['reasons', 'factors', 'details', 'explanations']));
    return {
      score: riskScore,
      level: str(pick(riskRaw ?? {}, ['level', 'risk_level', 'riskLevel', 'rating'])),
      verdict: riskScore !== undefined ? riskVerdictFromScore(riskScore) : undefined,
      budgetRisk: num(pick(riskRaw ?? {}, ['budget_risk', 'budgetRisk', 'budget'])),
      frequencyRisk: num(pick(riskRaw ?? {}, ['frequency_risk', 'frequencyRisk', 'frequency'])),
      injectionRisk: num(pick(riskRaw ?? {}, ['injection_risk', 'injectionRisk', 'injection'])),
      parameterRisk: num(pick(riskRaw ?? {}, ['parameter_risk', 'parameterRisk', 'parameter'])),
      reasons: reasonsArr?.map((r) => str(r) ?? String(r)).filter(Boolean) as string[] | undefined,
    };
  })();

  // Economics
  const econRaw = asRecord(pick(root, ['economics', 'economic_engine', 'economicEngine', 'economics_engine']));
  const economics: EconomicsInfo | undefined = (() => {
    if (!econRaw) return undefined;
    return {
      budget: pick(econRaw, ['budget', 'max_budget', 'maxBudget']),
      cost: pick(econRaw, ['cost', 'price', 'total_cost', 'totalCost']),
      savings: pick(econRaw, ['savings', 'saved', 'discount']),
      optimal: pick(econRaw, ['optimal', 'optimized', 'is_optimal', 'isOptimal']) as boolean | undefined,
      rationale: str(pick(econRaw, ['rationale', 'reason', 'explanation', 'note'])),
    };
  })();

  // Providers
  const providersRaw = pick(root, ['providers', 'provider', 'provider_selection', 'providerSelection']);
  let providers: ProviderInfo[] = [];
  let selectedProvider: ProviderInfo | undefined;
  const providerList = (() => {
    if (Array.isArray(providersRaw)) return providersRaw;
    const rec = asRecord(providersRaw);
    if (rec) {
      for (const k of ['list', 'candidates', 'options', 'providers']) {
        if (Array.isArray(rec[k])) return rec[k] as unknown[];
      }
    }
    return undefined;
  })();
  if (providerList) {
    providers = providerList
      .map((p, i) => {
        const rec = asRecord(p) ?? {};
        const selected =
          pick(rec, ['selected', 'is_selected', 'isSelected']) === true ||
          str(pick(rec, ['selected'])) === 'true';
        return {
          name: str(pick(rec, ['name', 'provider', 'id', 'label'])) ?? `Provider ${i + 1}`,
          reputation: num(pick(rec, ['reputation', 'rep', 'reputation_score', 'reputationScore'])),
          successRate: num(pick(rec, ['success_rate', 'successRate', 'success', 'reliability'])),
          sla: pick(rec, ['sla', 'sla_ms', 'slaMs', 'latency']) as string | number | undefined,
          price: pick(rec, ['price', 'cost', 'base_price', 'basePrice']) as string | number | undefined,
          adjustedPrice: pick(rec, ['adjusted_price', 'adjustedPrice', 'final_price', 'finalPrice', 'quote']) as string | number | undefined,
          score: num(pick(rec, ['score', 'provider_score', 'providerScore', 'ranking'])),
          selected,
        };
      })
      .filter((p) => p.name);
    selectedProvider = providers.find((p) => p.selected) ?? providers[0];
  } else if (providersRaw) {
    const rec = asRecord(providersRaw) ?? {};
    const name = str(pick(rec, ['name', 'provider', 'id']));
    if (name) {
      selectedProvider = {
        name,
        reputation: num(pick(rec, ['reputation', 'rep'])),
        successRate: num(pick(rec, ['success_rate', 'successRate'])),
        sla: pick(rec, ['sla']) as string | number | undefined,
        price: pick(rec, ['price', 'cost']) as string | number | undefined,
        adjustedPrice: pick(rec, ['adjusted_price', 'adjustedPrice', 'quote']) as string | number | undefined,
        score: num(pick(rec, ['score'])),
        selected: true,
      };
      providers = [selectedProvider];
    }
  }

  // Payment
  const payRaw =
    asRecord(pick(root, ['payment', 'x402', 'x_402', 'payment_protocol', 'paymentProtocol'])) ?? {};
  const payment: PaymentInfo | undefined = (() => {
    if (Object.keys(payRaw).length === 0) return undefined;
    return {
      amount: pick(payRaw, ['amount', 'price', 'cost', 'value']),
      asset: str(pick(payRaw, ['asset', 'token', 'currency', 'unit'])) ?? 'USDC',
      receiver: str(pick(payRaw, ['receiver', 'to', 'payee', 'address', 'recipient'])),
      network: str(pick(payRaw, ['network', 'chain', 'blockchain'])) ?? 'Algorand TestNet',
      transactionId: str(
        pick(payRaw, ['transaction_id', 'transactionId', 'tx_id', 'txId', 'tx', 'hash', 'transaction_hash', 'transactionHash']),
      ),
      facilitator: str(pick(payRaw, ['facilitator', 'facilitator_url', 'facilitatorUrl'])),
      status: str(pick(payRaw, ['status', 'state'])),
    };
  })();

  // Settlement
  const settleRaw =
    asRecord(pick(root, ['settlement', 'algorand', 'blockchain', 'chain'])) ?? {};
  const settlementTxId =
    str(pick(settleRaw, ['transaction_id', 'transactionId', 'tx_id', 'txId', 'tx', 'hash'])) ??
    payment?.transactionId;
  const settlement: SettlementInfo | undefined = (() => {
    if (Object.keys(settleRaw).length === 0 && !settlementTxId) return undefined;
    return {
      network: str(pick(settleRaw, ['network', 'chain', 'blockchain'])) ?? 'Algorand TestNet',
      transactionId: settlementTxId,
      round: pick(settleRaw, ['round', 'block', 'round_number', 'roundNumber']),
      confirmed: pick(settleRaw, ['confirmed', 'settled', 'success', 'status']) === true ||
        str(pick(settleRaw, ['confirmed', 'settled', 'success', 'status'])) === 'confirmed' ||
        str(pick(settleRaw, ['confirmed', 'settled', 'success', 'status'])) === 'settled' ||
        str(pick(settleRaw, ['confirmed', 'settled', 'success', 'status'])) === 'success',
      explorerUrl: str(pick(settleRaw, ['explorer_url', 'explorerUrl', 'explorer', 'url'])),
    };
  })();

  // Outcome
  const outRaw = asRecord(pick(root, ['outcome', 'result', 'verification', 'outcome_verification', 'outcomeVerification'])) ?? {};
  const outcome: OutcomeInfo | undefined = (() => {
    if (Object.keys(outRaw).length === 0) return undefined;
    const errs = asArray(pick(outRaw, ['errors', 'error', 'issues']));
    return {
      schemaValidity: boolOrStr(pick(outRaw, ['schema_validity', 'schemaValidity', 'schema'])),
      freshness: boolOrStr(pick(outRaw, ['freshness', 'is_fresh', 'isFresh'])),
      queryMatch: boolOrStr(pick(outRaw, ['query_match', 'queryMatch', 'match', 'relevance'])),
      slaCompliance: boolOrStr(pick(outRaw, ['sla_compliance', 'slaCompliance', 'sla'])),
      errors: errs?.map((e) => str(e) ?? String(e)).filter(Boolean) as string[] | undefined,
      score: num(pick(outRaw, ['score', 'outcome_score', 'outcomeScore', 'quality'])),
      verified: pick(outRaw, ['verified', 'success', 'valid']) === true ||
        str(pick(outRaw, ['verified', 'success', 'valid', 'status'])) === 'verified' ||
        str(pick(outRaw, ['verified', 'success', 'valid', 'status'])) === 'success',
      reputationDelta: num(pick(outRaw, ['reputation_delta', 'reputationDelta', 'reputation_update', 'reputationUpdate'])),
    };
  })();

  // Memory
  const memRaw = asRecord(pick(root, ['memory', 'agent_memory', 'agentMemory', 'experience'])) ?? {};
  const memory: MemoryInfo | undefined = (() => {
    if (Object.keys(memRaw).length === 0) return undefined;
    const entriesArr = asArray(pick(memRaw, ['entries', 'experiences', 'lessons', 'history']));
    const entries = entriesArr
      ?.map((e) => {
        const r = asRecord(e) ?? {};
        return {
          experience: str(pick(r, ['experience', 'event', 'description'])),
          provider: str(pick(r, ['provider', 'provider_name', 'providerName'])),
          intent: str(pick(r, ['intent', 'goal', 'action'])),
          outcome: str(pick(r, ['outcome', 'result', 'status'])),
          quality: pick(r, ['quality', 'score', 'rating']) as string | number | undefined,
          latency: pick(r, ['latency', 'duration', 'time']) as string | number | undefined,
          lesson: str(pick(r, ['lesson', 'learning', 'takeaway'])),
        };
      })
      .filter((e) => e.experience || e.lesson || e.provider);
    return {
      experience: str(pick(memRaw, ['experience', 'event', 'description', 'summary'])),
      provider: str(pick(memRaw, ['provider', 'provider_name', 'providerName'])),
      intent: str(pick(memRaw, ['intent', 'goal', 'action'])),
      outcome: str(pick(memRaw, ['outcome', 'result', 'status'])),
      quality: pick(memRaw, ['quality', 'score', 'rating']),
      latency: pick(memRaw, ['latency', 'duration', 'time']),
      lesson: str(pick(memRaw, ['lesson', 'learning', 'takeaway'])),
      entries,
    };
  })();

  const success =
    pick(root, ['success', 'succeeded', 'ok']) === true ||
    str(pick(root, ['success', 'status', 'state'])) === 'success' ||
    str(pick(root, ['success', 'status', 'state'])) === 'completed' ||
    str(pick(root, ['success', 'status', 'state'])) === 'settled' ||
    (settlement?.confirmed && !error);

  return {
    ok: ok && !error,
    raw,
    intent,
    risk,
    economics,
    providers,
    selectedProvider,
    payment,
    settlement,
    outcome,
    memory,
    error,
    success,
  };
}
