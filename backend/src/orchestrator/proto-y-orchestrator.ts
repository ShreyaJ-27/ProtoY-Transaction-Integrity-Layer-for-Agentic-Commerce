import { analyzeIntent } from '../engines/intent-engine.js';
import { assessRisk } from '../engines/risk-engine.js';
import { analyzeEconomics } from '../engines/economics-engine.js';
import { selectProvider } from '../engines/provider-engine.js';
import { processX402Payment } from '../utils/payment-processor.js';
import { verifyOutcome } from '../engines/outcome-verifier.js';
import { updateReputation, extractLessons } from '../engines/reputation-engine.js';
import { storeAgentMemory } from '../models/agent-memory.js';
import { providerMemoryStore } from '../models/provider-memory.js';
import { PROVIDER_DATABASE } from '../config.js';
import { handleResearch } from '../handlers/research-handler.js';
import { logInfo } from '../logger.js';

export interface AgentRequest {
  agentId: string;
  goal: string;
  parameters?: any;
  budget: number;
}

export interface OrchestratorResult {
  success: boolean;
  agentId: string;
  providerId?: string;
  selectedProvider?: any;
  paymentProof?: any;
  outcomeScore?: number;
  wasSuccessful?: boolean;
  lessonsForNextTime?: string[];
  response?: any;
  outcome?: any;
  risk?: any;
  economics?: any;
  error?: string;
}

// Helper to simulate calling the selected provider's service
async function callExternalService(provider: any, goal: string, parameters?: any) {
  if (provider.id === 'weather-api' || goal.toLowerCase().includes('weather')) {
    return {
      result: `Weather data for ${parameters?.location || 'requested location'}: 22°C, Sunny, Humidity 45%`,
      sources: ['https://api.openweathermap.org/v2.5/weather'],
      timestamp: new Date(),
      executionTime: 120
    };
  }

  if (provider.id === 'data-feed' || goal.toLowerCase().includes('data') || goal.toLowerCase().includes('feed')) {
    return {
      result: `Data feed payload: Live USD/ALGO price index 0.284, 24h Vol $12.4M, Algorand block latency 3.3s`,
      sources: ['https://testnet-api.algonode.cloud/v2/status'],
      timestamp: new Date(),
      executionTime: 95
    };
  }

  // Default AI/Research handler
  return handleResearch(goal, parameters?.detailLevel || 'standard');
}

export async function orchestratePayment(agentRequest: {
  agentId: string;
  goal: string;
  parameters?: any;
  budget: number;
  paymentSignature?: string;
}): Promise<OrchestratorResult> {
  const { agentId, goal, parameters, budget, paymentSignature } = agentRequest;
  logInfo(`[ORCHESTRATOR] Starting pipeline for agent "${agentId}" (Goal: "${goal}")`);

  // a) Intent Analysis
  const intent = await analyzeIntent({
    goal,
    parameters,
    estimatedCost: budget
  });

  // b) Risk Assessment
  const risk = await assessRisk(intent, agentId, parameters);

  // c) If high risk, block request
  if (risk.recommendation === 'DENY') {
    logInfo(`[ORCHESTRATOR] High risk request blocked for agent "${agentId}"`);
    return {
      success: false,
      agentId,
      error: 'High risk request blocked by Proto-Y Integrity Layer',
      risk
    };
  }

  // d) Load available providers
  const providers = PROVIDER_DATABASE;

  // e) Economics Analysis
  const economics = await analyzeEconomics(intent, providers);

  // f) Provider Selection
  const selected = await selectProvider(economics, providerMemoryStore);

  // g) Validate budget
  if (!economics.withinBudget) {
    logInfo(`[ORCHESTRATOR] Budget exceeded for agent "${agentId}": cost ${economics.totalCost} > budget ${budget}`);
    return {
      success: false,
      agentId,
      error: 'Exceeds budget',
      economics,
      risk
    };
  }

  // h) Log selection
  logInfo(`[ORCHESTRATOR] Selected ${selected.provider.name} (confidence: ${selected.confidenceScore})`);

  // i) Process x402 payment
  const paymentSig = paymentSignature || 'SIMULATED_PAYMENT';
  const payment = await processX402Payment(paymentSig, {
    from: agentId,
    amount: economics.totalCost
  });

  // j) Call selected provider's service
  const response = await callExternalService(selected.provider, goal, parameters);

  // k) Outcome Verification & Quality Scoring
  const outcome = await verifyOutcome(intent, response, selected.provider, response.executionTime);

  // l) Update Provider Reputation
  await updateReputation(selected.provider.id, outcome);

  // m) Extract Lessons Learned
  const lessons = await extractLessons(intent, outcome, selected.provider);

  // n) Store in Agent Memory
  storeAgentMemory(agentId, {
    providerId: selected.provider.id,
    paymentTxId: payment.txId,
    intent,
    outcome,
    lessonsLearned: lessons
  });

  logInfo(`[ORCHESTRATOR] Full pipeline successfully finished for agent "${agentId}". Outcome: ${outcome.qualityScore}%`);

  // o) Return final orchestration response
  return {
    success: outcome.isValid,
    agentId,
    paymentProof: payment,
    selectedProvider: selected,
    outcomeScore: outcome.qualityScore,
    wasSuccessful: outcome.isValid,
    lessonsForNextTime: lessons,
    providerId: selected.provider.id,
    response,
    outcome,
    risk,
    economics
  };
}
