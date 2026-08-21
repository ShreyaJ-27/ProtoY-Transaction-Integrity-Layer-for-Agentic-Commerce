import { PIPELINE, type StageId } from './constants';

const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '') ?? '';

export class ApiError extends Error {
  status: number;
  body: unknown;
  constructor(message: string, status: number, body: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

async function request<T>(path: string, init?: RequestInit, timeoutMs = 30000): Promise<T> {
  if (!API_BASE_URL) {
    throw new ApiError(
      'VITE_API_BASE_URL is not configured. Set it in your environment to connect the Proto-Y backend.',
      0,
      null,
    );
  }
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs);
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(init?.headers ?? {}),
      },
    });
  } catch (e) {
    if (e instanceof DOMException && e.name === 'AbortError') {
      throw new ApiError('Proto-Y backend request timed out.', 408, null);
    }
    throw new ApiError(
      `Network error reaching ${path}. The backend may be offline.`,
      0,
      String(e),
    );
  } finally {
    window.clearTimeout(timeout);
  }

  const text = await res.text();
  let body: unknown = null;
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
  }
  if (!res.ok) {
    const msg =
      (body && typeof body === 'object' && 'error' in body && typeof (body as Record<string, unknown>).error === 'string'
        ? ((body as Record<string, unknown>).error as string)
        : null) ?? `Request failed (${res.status})`;
    throw new ApiError(msg, res.status, body);
  }
  return body as T;
}

export interface HealthResponse {
  status?: string;
  service?: string;
  version?: string;
  [k: string]: unknown;
}

export interface InfoResponse {
  service?: string;
  network?: string;
  environment?: string;
  explorer_url?: string;
  explorerUrl?: string;
  [k: string]: unknown;
}

export interface ExecuteRequest {
  goal: string;
  agentId?: string;
  budget?: number;
  parameters?: Record<string, unknown>;
  providerPreferences?: string[];
}

export interface AgentExecuteResponse {
  success: boolean;
  agent: {
    id: string;
    goal: string;
    decision: 'ALLOW' | 'DENY' | 'ESCALATE' | 'ERROR';
    groqUsed: boolean;
    proposal?: {
      goal: string;
      category: string;
      estimatedCost: number;
      priority: string;
      reasoning: string;
    };
  };
  intent?: { goal: string; budget: number; priority: string; category?: string };
  risk?: { score: number; flags: string[]; recommendation: 'ALLOW' | 'DENY' | 'ESCALATE' };
  economics?: {
    totalCost: number;
    unitPrice: number;
    valueRatio: number;
    recommendedProvider?: string;
    alternatives?: Array<{ id: string; name: string; reputation: number; price: number; sla: number; healthStatus?: string }>;
    withinBudget: boolean;
    savingsOpportunity?: number;
  };
  provider?: {
    provider: { id: string; name: string; reputation: number; price: number; sla: number; healthStatus?: string };
    confidenceScore: number;
    reasoning: string[];
  };
  payment: {
    status: 'PENDING' | 'SETTLED' | 'FAILED' | 'SKIPPED';
    network: string;
    assetId: number;
    amount?: number;
    transactionId?: string;
    payerAddress?: string;
    receiverAddress?: string;
    facilitatorError?: string;
    note?: string;
  };
  service?: { status: 'SUCCESS' | 'FAILED' | 'SKIPPED'; result?: unknown };
  outcome?: {
    score: number;
    classification: 'TRUST' | 'CONDITIONAL' | 'DISTRUST';
    proof?: string;
    breakdown?: { schema?: number; freshness?: number; match?: number; sla?: number; errors?: number };
  };
  reputation?: { providerId: string; newReputation: number; updated: boolean };
  memory: { updated: boolean; lessonsStored: string[]; previousTransactions?: number };
  agentDecision: {
    summary: string;
    decisionRationale: string;
    nextAction: string;
    confidenceLevel: 'HIGH' | 'MEDIUM' | 'LOW';
    keyLearning: string;
  };
  protoY?: {
    riskScore: number;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    recommendation: 'ALLOW' | 'DENY' | 'ESCALATE';
    paymentAllowed: boolean;
    reasons: string[];
  };
  executionTimeMs?: number;
  error?: string;
}

export function getHealth() {
  return request<HealthResponse>('/health');
}

export function getInfo() {
  return request<InfoResponse>('/info');
}

export function executeTransaction(payload: ExecuteRequest) {
  return request<AgentExecuteResponse>('/api/agent/execute', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function getAgentStatus() {
  return request<Record<string, unknown>>('/api/agent/status');
}

export function getResearch() {
  return request<Record<string, unknown>>('/api/v1/research');
}

export function hasApiBase() {
  return Boolean(API_BASE_URL);
}

export function apiBaseUrl() {
  return API_BASE_URL;
}

// Convenience: ordered stage ids for the pipeline.
export const STAGE_IDS: StageId[] = PIPELINE.map((s) => s.id);
