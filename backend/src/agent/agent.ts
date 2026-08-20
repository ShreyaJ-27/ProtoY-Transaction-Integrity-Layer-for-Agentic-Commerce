/**
 * Proto-Y AI Agent
 *
 * Architecture:
 *   USER → Groq (intent extraction + reasoning)
 *        → Proto-Y deterministic engines (risk, economics, provider) — GUARDS PAYMENTS
 *        → x402 payment (real Algorand TestNet)
 *        → Service execution
 *        → Outcome verification
 *        → Reputation update
 *        → Agent memory
 *        → Groq (decision summary & next action)
 *
 * SAFETY CRITICAL:
 *   Groq PROPOSES. Proto-Y deterministic engines APPROVE or REJECT.
 *   Groq CANNOT bypass risk limits, budget limits, or payment authorization.
 */
import { groqJsonCompletion, isGroqAvailable } from './groq-client.js';
import { INTENT_EXTRACTION_SYSTEM, DECISION_SYSTEM } from './prompts.js';
import { parseExtractedIntent, parseAgentDecision, AgentDecision, ExtractedIntent } from './decision-parser.js';
import { analyzeIntent } from '../engines/intent-engine.js';
import { assessRisk } from '../engines/risk-engine.js';
import { analyzeEconomics } from '../engines/economics-engine.js';
import { selectProvider } from '../engines/provider-engine.js';
import { verifyOutcome } from '../engines/outcome-verifier.js';
import { updateReputation, extractLessons } from '../engines/reputation-engine.js';
import { storeAgentMemory, getAgentMemories } from '../models/agent-memory.js';
import { providerMemoryStore } from '../models/provider-memory.js';
import { PROVIDER_DATABASE } from '../config.js';
import { handleResearch } from '../handlers/research-handler.js';
import { executeX402Request } from '../utils/x402-client.js';
import { storeOutcomeProof } from '../models/outcome-storage.js';
import { PORT, ALGORAND_CONFIG, USDC_CONFIG, AVM_ADDRESS } from '../config.js';
import { logAgent, logX402, logAlgorand, logPayment, logOutcome, logMemory, logInfo } from '../logger.js';

export interface AgentExecuteRequest {
  agentId: string;
  goal: string;
  budget: number;
  parameters?: any;
  providerPreferences?: string[];
}

export interface AgentProposal {
  goal: string;
  category: string;
  estimatedCost: number;
  priority: string;
  reasoning: string;
}

export interface ProtoYDecision {
  riskScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  recommendation: 'ALLOW' | 'DENY' | 'ESCALATE';
  paymentAllowed: boolean;
  reasons: string[];
}

export interface AgentExecuteResult {
  success: boolean;

  agent: {
    id: string;
    goal: string;
    decision: 'ALLOW' | 'DENY' | 'ESCALATE' | 'ERROR';
    groqUsed: boolean;
    proposal?: AgentProposal;
  };

  intent?: any;
  risk?: any;
  economics?: any;
  provider?: any;

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

  service?: {
    status: 'SUCCESS' | 'FAILED' | 'SKIPPED';
    result?: any;
  };

  outcome?: {
    score: number;
    classification: 'TRUST' | 'CONDITIONAL' | 'DISTRUST';
    proof?: string;
    breakdown?: any;
  };

  reputation?: {
    providerId: string;
    newReputation: number;
    updated: boolean;
  };

  memory: {
    updated: boolean;
    lessonsStored: string[];
    previousTransactions?: number;
  };

  protoY?: ProtoYDecision;
  executionTimeMs?: number;

  agentDecision: AgentDecision;

  error?: string;
}

async function callProviderService(provider: any, goal: string, parameters?: any): Promise<any> {
  if (provider.id === 'weather-api' || goal.toLowerCase().includes('weather')) {
    return {
      result: `Weather: ${parameters?.location || 'requested location'}: 21°C, Partly Cloudy`,
      sources: ['https://testnet-api.algonode.cloud/v2/status'],
      timestamp: new Date(),
      executionTime: 115
    };
  }
  if (provider.id === 'data-feed' || goal.toLowerCase().includes('data') || goal.toLowerCase().includes('feed')) {
    return {
      result: `Data Feed: ALGO/USD 0.289, 24h Vol $14.1M, Algorand block height 35892847`,
      sources: ['https://testnet-api.algonode.cloud/v2/status'],
      timestamp: new Date(),
      executionTime: 90
    };
  }
  return handleResearch(goal, parameters?.detailLevel || 'standard');
}

export async function runAgent(req: AgentExecuteRequest): Promise<AgentExecuteResult> {
  const { agentId, goal, budget, parameters, providerPreferences } = req;
  const startedAt = Date.now();
  const groqAvailable = isGroqAvailable();

  logAgent(`[AGENT] Starting execution — id="${agentId}" goal="${goal}" budget=${budget} groq=${groqAvailable}`);

  // Load past memory for context
  const pastMemories = getAgentMemories(agentId);
  logMemory(`[MEMORY] Agent "${agentId}" has ${pastMemories.length} past transaction(s)`);

  // ─── PHASE 1: GROQ INTENT EXTRACTION ────────────────────────────────────────
  let extractedIntent: ExtractedIntent;
  if (groqAvailable) {
    try {
      logAgent(`[AGENT] Invoking Groq for intent extraction...`);
      const recentLessons = pastMemories.slice(-3).flatMap(m => m.lessonsLearned || []).join('; ');
      const raw = await groqJsonCompletion<any>(
        INTENT_EXTRACTION_SYSTEM,
        `Goal: "${goal}"\nBudget: ${budget} microUSDC\nPast lessons: ${recentLessons || 'None yet'}`
      );
      extractedIntent = parseExtractedIntent(raw, goal, budget);
      logAgent(`[AGENT] Groq proposal generated: category=${extractedIntent.category}, cost=${extractedIntent.estimatedCost}`);
    } catch (err: any) {
      logAgent(`[AGENT] Groq intent extraction failed (${err.message}), using keyword fallback`);
      extractedIntent = parseExtractedIntent(null, goal, budget);
    }
  } else {
    logAgent(`[AGENT] Groq not available, using keyword-based intent extraction`);
    extractedIntent = parseExtractedIntent(null, goal, budget);
  }

  // ─── PHASE 2: PROTO-Y DETERMINISTIC INTENT ENGINE ───────────────────────────
  const intent = await analyzeIntent({
    goal: extractedIntent.goal,
    parameters,
    estimatedCost: extractedIntent.estimatedCost
  });
  // Keep deterministic classification authoritative; Groq remains a proposal.
  intent.priority = extractedIntent.priority;
  // SECURITY: Always use the RAW budget from the HTTP request for risk assessment.
  // Never let Groq's parsed `estimatedCost` override budget for risk checks.
  // The risk engine must see the actual amount the caller intends to spend.
  intent.budget = budget;

  const proposal: AgentProposal = { ...extractedIntent };
  logAgent(`[AGENT] Intent validated: ${proposal.category}`);

  // ─── PHASE 3: RISK ENGINE (DETERMINISTIC GUARD) ──────────────────────────────
  logInfo(`[RISK] Evaluating request... (raw budget: ${budget} microUSDC)`);
  const risk = await assessRisk(intent, agentId, parameters);
  logInfo(`[RISK] Score: ${risk.score} → ${risk.recommendation}`);

  const defaultDecision: AgentDecision = {
    summary: '',
    decisionRationale: '',
    nextAction: '',
    confidenceLevel: 'HIGH',
    keyLearning: ''
  };

  const protoY = buildProtoYDecision(risk);
  if (!protoY.paymentAllowed) {
    logAgent(`[AGENT] Proto-Y decision: ${risk.recommendation} (score=${risk.score})`);
    const agentDecision = groqAvailable
      ? await getGroqDecision(goal, intent, risk, null, null, null, null, null, `BLOCKED: ${risk.recommendation}`)
      : { ...defaultDecision, summary: `Request blocked by Proto-Y (${risk.recommendation}).`, decisionRationale: `Risk score ${risk.score}. Flags: ${risk.flags.join(', ') || 'none'}`, nextAction: 'Review the request and retry only after the policy concern is resolved.', keyLearning: 'Deterministic Proto-Y policy controls payment authorization.' };

    return buildResult(agentId, goal, risk.recommendation, groqAvailable, proposal, intent, risk, null, null, 'SKIPPED', undefined, 'SKIPPED', null, null, null, null, { updated: false, lessonsStored: [], previousTransactions: pastMemories.length }, agentDecision, `Proto-Y blocked execution: ${risk.recommendation}`, startedAt, protoY);
  }

  // ─── PHASE 4: ECONOMICS ENGINE ──────────────────────────────────────────────
  const providers = PROVIDER_DATABASE;
  const economics = await analyzeEconomics(intent, providers);
  logInfo(`[ECONOMICS] Best provider: ${economics.recommendedProvider}, cost: ${economics.totalCost}, withinBudget: ${economics.withinBudget}`);

  if (!economics.withinBudget) {
    logAgent(`[AGENT] Budget exceeded: ${economics.totalCost} > ${budget}`);
    const agentDecision = groqAvailable
      ? await getGroqDecision(goal, intent, risk, economics, null, null, null, null, 'BLOCKED: Budget exceeded')
      : { ...defaultDecision, summary: `Request blocked: cost ${economics.totalCost} microUSDC exceeds budget ${budget}.`, decisionRationale: 'The cheapest available provider still exceeds the specified budget.', nextAction: 'Increase budget or select a cheaper service tier.', keyLearning: 'Adjust budget expectations for this type of query.' };

    return buildResult(agentId, goal, 'DENY', groqAvailable, proposal, intent, risk, economics, null, 'SKIPPED', undefined, 'SKIPPED', null, null, null, null, { updated: false, lessonsStored: [], previousTransactions: pastMemories.length }, agentDecision, 'Exceeds budget', startedAt, { ...protoY, recommendation: 'DENY', paymentAllowed: false, reasons: ['Budget exceeded'] });
  }

  // ─── PHASE 5: PROVIDER SELECTION ────────────────────────────────────────────
  const preferredProviderId = providerPreferences?.find(id => providers.some(provider => provider.id === id))
    || (intent.category === 'ANALYSIS' || /research|analy[sz]e/i.test(goal) ? 'ai-research' : undefined);
  const selected = preferredProviderId
    ? await selectProvider({ ...economics, recommendedProvider: preferredProviderId }, providerMemoryStore)
    : await selectProvider(economics, providerMemoryStore);
  logInfo(`[PROVIDER] Selected: ${selected.provider.name} (confidence: ${selected.confidenceScore}%)`);

  // ─── PHASE 6: REAL X402 PAYMENT + SERVICE EXECUTION ─────────────────────────
  const serviceUrl = process.env.PROTOY_RESEARCH_URL || `http://localhost:${PORT}/api/v1/research`;
  const serviceParams: Record<string, string> = {
    query: proposal.goal,
    ...(parameters?.detailLevel ? { detailLevel: String(parameters.detailLevel) } : {})
  };
  logX402(`[X402] Calling protected service: ${serviceUrl}`);
  const paymentResult = await executeX402Request(serviceUrl, serviceParams);
  const accepted = paymentResult.paymentRequired?.accepts?.[0];
  const paymentAmount = accepted?.amount ? Number(accepted.amount) : undefined;
  const paymentReceiver = accepted?.payTo;

  if (!paymentResult.success || !paymentResult.paymentTxId) {
    logPayment(`[PAYMENT] Settlement failed; execution stopped before outcome verification`);
    const paymentError = paymentResult.error || 'Settlement did not return a transaction ID';
    return buildResult(agentId, goal, 'ERROR', groqAvailable, proposal, intent, risk, economics, selected, 'FAILED', paymentAmount, 'SKIPPED', null, null, null, { facilitatorError: paymentError, receiverAddress: paymentReceiver }, { updated: false, lessonsStored: [], previousTransactions: pastMemories.length }, { ...defaultDecision, summary: 'Payment settlement failed; no service execution was credited.', decisionRationale: paymentError, nextAction: 'Retry only after the facilitator or wallet issue is resolved.', keyLearning: 'A missing settlement proof is never treated as payment success.' }, paymentError, startedAt, protoY);
  }

  logAlgorand(`[ALGORAND] Settlement confirmed: ${paymentResult.paymentTxId}`);
  const serviceResponse = paymentResult.data?.data || paymentResult.data;
  logInfo(`[SERVICE] Protected service response received from ${selected.provider.name}`);

  if (!serviceResponse || serviceResponse.error) {
    const failedResponse = serviceResponse || {
      result: '',
      sources: [],
      timestamp: new Date(),
      executionTime: Date.now() - startedAt,
      error: 'Protected service returned no response'
    };
    const failedOutcome = await verifyOutcome(intent, failedResponse, selected.provider, failedResponse.executionTime);
    const failedReputation = await updateReputation(selected.provider.id, failedOutcome);
    const failedLessons = await extractLessons(intent, failedOutcome, selected.provider);
    storeAgentMemory(agentId, {
      providerId: selected.provider.id,
      paymentTxId: paymentResult.paymentTxId,
      intent,
      outcome: failedOutcome,
      lessonsLearned: failedLessons
    });
    return buildResult(agentId, goal, 'ERROR', groqAvailable, proposal, intent, risk, economics, selected, 'SETTLED', paymentAmount, 'FAILED', failedResponse, failedOutcome, { providerId: selected.provider.id, newReputation: failedReputation, updated: true }, { transactionId: paymentResult.paymentTxId, payerAddress: paymentResult.payerAddress, receiverAddress: paymentReceiver }, { updated: true, lessonsStored: failedLessons, previousTransactions: pastMemories.length }, { ...defaultDecision, summary: 'Payment settled but the protected service failed.', decisionRationale: 'Service failure occurred after settlement.', nextAction: 'Record the failure and evaluate another provider.', keyLearning: failedLessons[0] || 'Settlement does not imply a successful service outcome.' }, 'Protected service failed after settlement', startedAt, protoY);
  }

  // ─── PHASE 8: OUTCOME VERIFICATION ──────────────────────────────────────────
  const outcome = await verifyOutcome(intent, serviceResponse, selected.provider, serviceResponse.executionTime);
  logOutcome(`[OUTCOME] Score: ${outcome.qualityScore}/100 → ${outcome.recommendation}`);

  // ─── PHASE 9: REPUTATION UPDATE ─────────────────────────────────────────────
  const newReputation = await updateReputation(selected.provider.id, outcome);
  logInfo(`[REPUTATION] Provider ${selected.provider.id} updated to ${newReputation}`);

  // ─── PHASE 10: LESSON EXTRACTION ────────────────────────────────────────────
  const lessons = await extractLessons(intent, outcome, selected.provider);

  // ─── PHASE 11: AGENT MEMORY STORAGE ─────────────────────────────────────────
  storeAgentMemory(agentId, {
    providerId: selected.provider.id,
    paymentTxId: paymentResult.paymentTxId,
    intent,
    outcome,
    lessonsLearned: lessons
  });
  storeOutcomeProof({
    paymentTxId: paymentResult.paymentTxId,
    responseHash: outcome.proof,
    timestamp: new Date(),
    verificationScore: outcome.qualityScore,
    verified: outcome.isValid,
    outcome
  });
  logMemory(`[MEMORY] Stored memory for agent "${agentId}". Lessons: ${lessons.length}`);

  // ─── PHASE 12: GROQ DECISION SUMMARY ────────────────────────────────────────
  const agentDecision = groqAvailable
    ? await getGroqDecision(goal, intent, risk, economics, selected, outcome, newReputation, lessons, null)
    : {
        summary: `Successfully completed "${goal}" via ${selected.provider.name} with quality score ${outcome.qualityScore}/100.`,
        decisionRationale: `Risk: ${risk.score}/100 (${risk.recommendation}). Provider confidence: ${selected.confidenceScore}%.`,
        nextAction: outcome.qualityScore >= 70 ? 'Continue using this provider for similar tasks.' : 'Consider alternative providers for next request.',
        confidenceLevel: 'HIGH' as const,
        keyLearning: lessons[0] || 'No specific learning captured.'
      };

  return buildResult(
    agentId, goal, 'ALLOW', groqAvailable, proposal,
    intent, risk, economics, selected,
    'SETTLED', paymentAmount,
    'SUCCESS', serviceResponse, outcome,
    { providerId: selected.provider.id, newReputation, updated: true, previousReputation: selected.provider.reputation },
    { transactionId: paymentResult.paymentTxId, payerAddress: paymentResult.payerAddress, receiverAddress: paymentReceiver },
    { updated: true, lessonsStored: lessons, previousTransactions: pastMemories.length },
    agentDecision, undefined, startedAt, protoY
  );
}

async function getGroqDecision(
  goal: string,
  intent: any, risk: any, economics: any, selected: any,
  outcome: any, newReputation: any, lessons: any, blockReason: string | null
): Promise<AgentDecision> {
  try {
    const raw = await groqJsonCompletion<any>(
      DECISION_SYSTEM,
      JSON.stringify({
        goal,
        intent: { category: intent.category, budget: intent.budget },
        risk: { score: risk.score, recommendation: risk.recommendation, flags: risk.flags },
        economics: economics ? { totalCost: economics.totalCost, withinBudget: economics.withinBudget, recommendedProvider: economics.recommendedProvider } : null,
        provider: selected ? { name: selected.provider?.name, confidence: selected.confidenceScore } : null,
        outcome: outcome ? { score: outcome.qualityScore, recommendation: outcome.recommendation } : null,
        newProviderReputation: newReputation,
        lessonsExtracted: lessons || [],
        blocked: blockReason
      }, null, 2)
    );
    return parseAgentDecision(raw, goal);
  } catch (err: any) {
    logAgent(`Groq decision summary failed: ${err.message}`);
    return parseAgentDecision(null, goal);
  }
}

function buildResult(
  agentId: string, goal: string, decision: string, groqUsed: boolean,
  proposal: AgentProposal, intent: any, risk: any, economics: any, selected: any,
  paymentStatus: string, paymentAmount: number | undefined,
  serviceStatus: string, serviceResponse: any, outcome: any,
  reputationInfo: any, paymentInfo: any,
  memoryInfo: any, agentDecision: AgentDecision,
  error?: string, startedAt: number = Date.now(), protoY?: ProtoYDecision
): AgentExecuteResult {
  const paymentRequired = serviceResponse?.paymentRequired?.accepts?.[0];
  return {
    success: decision === 'ALLOW' && serviceStatus === 'SUCCESS',
    agent: {
      id: agentId,
      goal,
      decision: decision as any,
      groqUsed,
      proposal
    },
    intent,
    risk,
    economics,
    provider: selected,
    payment: {
      status: paymentStatus as any,
      network: 'algorand-testnet',
      assetId: paymentRequired?.asset ? Number(paymentRequired.asset) : USDC_CONFIG.asaId,
      amount: paymentAmount,
      transactionId: paymentInfo?.transactionId,
      payerAddress: paymentInfo?.payerAddress,
      receiverAddress: paymentInfo?.receiverAddress || AVM_ADDRESS,
      facilitatorError: paymentInfo?.facilitatorError,
      note: paymentInfo?.facilitatorError || (paymentInfo?.transactionId ? 'Settled by GoPlausible facilitator' : 'No payment attempted')
    },
    service: serviceResponse ? {
      status: serviceStatus as any,
      result: serviceResponse
    } : { status: 'SKIPPED' },
    outcome: outcome ? {
      score: outcome.qualityScore,
      classification: outcome.recommendation,
      proof: outcome.proof,
      breakdown: outcome.breakdown
    } : undefined,
    reputation: reputationInfo,
    memory: memoryInfo,
    agentDecision,
    protoY,
    executionTimeMs: Date.now() - startedAt,
    error
  };
}

function buildProtoYDecision(risk: { score: number; recommendation: 'ALLOW' | 'DENY' | 'ESCALATE'; flags: string[] }): ProtoYDecision {
  return {
    riskScore: risk.score,
    riskLevel: risk.score <= 20 ? 'LOW' : risk.score <= 50 ? 'MEDIUM' : 'HIGH',
    recommendation: risk.recommendation,
    paymentAllowed: risk.recommendation === 'ALLOW',
    reasons: risk.flags
  };
}
