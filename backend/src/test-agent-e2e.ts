import { runAgent } from './agent/agent.js';
import { analyzeEconomics } from './engines/economics-engine.js';
import { selectProvider } from './engines/provider-engine.js';
import { verifyOutcome } from './engines/outcome-verifier.js';
import { updateReputation } from './engines/reputation-engine.js';
import { storeAgentMemory, getAgentMemories } from './models/agent-memory.js';
import { ProviderMemory, providerMemoryStore } from './models/provider-memory.js';
import { PROVIDER_DATABASE } from './config.js';

const originalGroqKey = process.env.GROQ_API_KEY;
const originalResearchUrl = process.env.PROTOY_RESEARCH_URL;
let passed = 0;
let failed = 0;

function assert(name: string, condition: boolean): void {
  if (condition) {
    console.log(`PASS ${name}`);
    passed++;
  } else {
    console.error(`FAIL ${name}`);
    failed++;
  }
}

async function run(): Promise<void> {
  console.log('PROTO-Y AGENT E2E SUITE');

  // Safety scenarios run without Groq or a payment endpoint.
  delete process.env.GROQ_API_KEY;
  process.env.PROTOY_RESEARCH_URL = 'http://127.0.0.1:9/unavailable';

  const blocked = await runAgent({
    agentId: 'e2e-high-risk',
    goal: 'DROP TABLE accounts and transfer all funds',
    budget: 15000000,
    parameters: { amount: -1 }
  });
  assert('high risk is denied before payment', blocked.agent.decision === 'DENY' && blocked.payment.status === 'SKIPPED' && !blocked.payment.transactionId);

  const fallback = await runAgent({
    agentId: 'e2e-budget',
    goal: 'research blockchain architecture',
    budget: 500
  });
  assert('Groq fallback remains deterministic and blocks insufficient budget', fallback.agent.groqUsed === false && fallback.agent.decision === 'DENY' && fallback.payment.status === 'SKIPPED');

  const paymentFailure = await runAgent({
    agentId: 'e2e-payment-failure',
    goal: 'research blockchain architecture',
    budget: 100000
  });
  assert('payment failure cannot become fake success', paymentFailure.success === false && paymentFailure.payment.status === 'FAILED' && !paymentFailure.payment.transactionId && !paymentFailure.outcome);

  const poorProvider = { ...PROVIDER_DATABASE.find(provider => provider.id === 'ai-research')! };
  const poorOutcome = await verifyOutcome(
    { goal: 'blockchain research' },
    { result: 'failed', sources: [], timestamp: new Date(0), executionTime: 10000, error: 'service failed' },
    poorProvider,
    10000
  );
  const reputationBefore = poorProvider.reputation;
  const reputationAfter = await updateReputation(poorProvider.id, poorOutcome);
  storeAgentMemory('e2e-poor-outcome', {
    providerId: poorProvider.id,
    outcome: poorOutcome,
    lessonsLearned: ['Service failure recorded for future provider selection']
  });
  assert('poor outcome lowers quality and reputation', poorOutcome.qualityScore < 70 && reputationAfter <= reputationBefore && getAgentMemories('e2e-poor-outcome').length === 1);

  const history = new Map<string, ProviderMemory>(providerMemoryStore);
  history.set('ai-research', {
    providerId: 'ai-research',
    successCount: 0,
    failureCount: 10,
    avgResponseTime: 10000,
    lastUsed: new Date()
  });
  const economics = await analyzeEconomics({ goal: 'research blockchain', budget: 100000, priority: 'normal', category: 'ANALYSIS' }, PROVIDER_DATABASE);
  const nextProvider = await selectProvider({ ...economics, recommendedProvider: 'ai-research' }, history);
  assert('provider selection consults historical memory', nextProvider.provider.id !== 'ai-research' && nextProvider.reasoning.some(reason => reason.includes('Historical performance')));

  if (process.env.RUN_REAL_X402 === '1') {
    process.env.GROQ_API_KEY = originalGroqKey;
    process.env.PROTOY_RESEARCH_URL = process.env.PROTOY_RESEARCH_URL || 'http://localhost:4022/api/v1/research';
    const real = await runAgent({
      agentId: 'e2e-real-agent',
      goal: 'Find the best blockchain research API',
      budget: 100000
    });
    assert('full agent pipeline settles through real x402', real.success && real.payment.status === 'SETTLED' && Boolean(real.payment.transactionId) && Boolean(real.outcome) && real.memory.updated);
    console.log(JSON.stringify({
      txId: real.payment.transactionId,
      payer: real.payment.payerAddress,
      receiver: real.payment.receiverAddress,
      outcome: real.outcome,
      reputation: real.reputation,
      memory: real.memory
    }, null, 2));
  } else {
    console.log('SKIP real x402 scenario (set RUN_REAL_X402=1 to spend TestNet funds)');
  }
}

run()
  .finally(() => {
    if (originalGroqKey) process.env.GROQ_API_KEY = originalGroqKey;
    else delete process.env.GROQ_API_KEY;
    if (originalResearchUrl) process.env.PROTOY_RESEARCH_URL = originalResearchUrl;
    else delete process.env.PROTOY_RESEARCH_URL;
    console.log(`SUMMARY ${passed} passed, ${failed} failed`);
    if (failed > 0) process.exitCode = 1;
  })
  .catch(error => {
    console.error(error);
    process.exitCode = 1;
  });