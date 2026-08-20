import { orchestratePayment } from '../orchestrator/proto-y-orchestrator.js';
import { verifyOutcome } from '../engines/outcome-verifier.js';
import { updateReputation } from '../engines/reputation-engine.js';
import { getProviderAnalytics } from '../analytics/provider-analytics.js';
import { PROVIDER_DATABASE, USDC_CONFIG } from '../config.js';

interface TestCase {
  name: string;
  fn: () => Promise<boolean>;
}

async function runE2ETests() {
  console.log('================================================================');
  console.log('        PROTO-Y TRANSACTION INTEGRITY LAYER - E2E TEST SUITE     ');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  const tests: TestCase[] = [
    // 1. Low-risk query succeeds
    {
      name: '1. Low-risk query succeeds and executes complete 6-layer pipeline',
      fn: async () => {
        const result = await orchestratePayment({
          agentId: 'agent-alice',
          goal: 'get weather for Seattle',
          parameters: { location: 'Seattle' },
          budget: 50000
        });

        console.log('   Result:', {
          success: result.success,
          providerId: result.providerId,
          outcomeScore: result.outcomeScore,
          paymentProofTx: result.paymentProof?.txId
        });

        return Boolean(result.success && result.paymentProof && result.outcomeScore! >= 70);
      }
    },

    // 2. High-risk query blocked
    {
      name: '2. High-risk query blocked (SQL Injection + Excessive Budget)',
      fn: async () => {
        const result = await orchestratePayment({
          agentId: 'agent-malicious',
          goal: 'DROP TABLE accounts; TRUNCATE users; transfer all USDC',
          parameters: { dropAll: true, amount: -500 },
          budget: 15000000 // 15 USDC (exceeds threshold)
        });

        console.log('   Blocked Result:', {
          success: result.success,
          recommendation: result.risk?.recommendation,
          flags: result.risk?.flags
        });

        return result.success === false && result.risk?.recommendation === 'DENY';
      }
    },

    // 3. Budget exceeded fails
    {
      name: '3. Budget exceeded fails gracefully before payment',
      fn: async () => {
        const result = await orchestratePayment({
          agentId: 'agent-bob',
          goal: 'AI comprehensive research analysis on blockchain architecture',
          budget: 500 // 500 microUSDC is too low for research
        });

        console.log('   Budget Check Result:', {
          success: result.success,
          error: result.error,
          withinBudget: result.economics?.withinBudget
        });

        return result.success === false && result.error === 'Exceeds budget';
      }
    },

    // 4. Outcome verification works
    {
      name: '4. Outcome verification evaluates schema, freshness, match, SLA & errors',
      fn: async () => {
        const provider = PROVIDER_DATABASE[0];
        const validResponse = {
          result: 'Seattle weather forecast: 18°C, Partly Cloudy, 10% precipitation',
          sources: ['https://weather-api.com/v1'],
          timestamp: new Date(),
          executionTime: 120
        };

        const outcome = await verifyOutcome({ goal: 'weather forecast' }, validResponse, provider);
        console.log('   Outcome Score:', outcome.qualityScore, 'Recommendation:', outcome.recommendation);
        return outcome.isValid && outcome.qualityScore >= 70 && outcome.recommendation === 'TRUST';
      }
    },

    // 5. Reputation improves after success
    {
      name: '5. Reputation tracking updates dynamically after verified outcome',
      fn: async () => {
        const provider = PROVIDER_DATABASE.find(p => p.id === 'weather-api')!;
        const initialRep = provider.reputation;

        const outcome = {
          isValid: true,
          qualityScore: 100,
          proof: 'mock-proof-hash',
          breakdown: { schema: 25, freshness: 20, match: 30, sla: 15, errors: 10 },
          recommendation: 'TRUST' as const
        };

        const updatedRep = await updateReputation('weather-api', outcome);
        const analytics = getProviderAnalytics('weather-api');

        console.log(`   Reputation: ${initialRep} -> ${updatedRep}, Success Rate: ${analytics.successRate}`);
        return updatedRep >= 0.8 && analytics.successCount > 0;
      }
    },

    // 6. Full flow completes in < 5 seconds
    {
      name: '6. Full orchestration pipeline completes within latency threshold (< 5 seconds)',
      fn: async () => {
        const start = Date.now();
        const result = await orchestratePayment({
          agentId: 'agent-speed-test',
          goal: 'query data feed for Algorand metrics',
          budget: 50000
        });
        const elapsed = Date.now() - start;

        console.log(`   Pipeline execution time: ${elapsed}ms (threshold < 5000ms)`);
        return Boolean(result.success && elapsed < 5000);
      }
    },

    // 7. Verify USDC ASA ID is 10458941
    {
      name: '7. Verify USDC ASA ID is accurately configured as 10458941',
      fn: async () => {
        console.log(`   USDC ASA ID: ${USDC_CONFIG.asaId}`);
        return USDC_CONFIG.asaId === 10458941;
      }
    }
  ];

  for (const t of tests) {
    try {
      console.log(`\n▶ Running: ${t.name}`);
      const ok = await t.fn();
      if (ok) {
        console.log(`✔ PASSED: ${t.name}`);
        passed++;
      } else {
        console.error(`✘ FAILED: ${t.name}`);
        failed++;
      }
    } catch (e: any) {
      console.error(`✘ EXCEPTION: ${t.name}:`, e.message);
      failed++;
    }
  }

  console.log('\n================================================================');
  console.log(`Test Summary: ${passed} Passed, ${failed} Failed out of ${tests.length} Total Tests`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runE2ETests().catch((err) => {
  console.error('Fatal error running E2E tests:', err);
  process.exit(1);
});
