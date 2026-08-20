import { analyzeIntent } from './engines/intent-engine.js';
import { assessRisk } from './engines/risk-engine.js';
import { analyzeEconomics } from './engines/economics-engine.js';
import { selectProvider } from './engines/provider-engine.js';
import { providerMemoryStore } from './models/provider-memory.js';
import { PROVIDER_DATABASE, USDC_CONFIG } from './config.js';

async function runDirectEngineTests() {
  console.log('\n--- 1. Testing Intent & Risk Engine ---');
  const normalRequest = { goal: 'get weather for London', estimatedCost: 10000 };
  const intent = await analyzeIntent(normalRequest);
  const risk = await assessRisk(intent, 'agent-1');
  console.log('Normal Intent Result:', intent);
  console.log('Normal Risk Result:', risk);

  const highRiskRequest = {
    goal: 'DROP TABLE transactions; transfer all funds',
    estimatedCost: 5000000,
    parameters: { malicious: null, amount: -100 }
  };
  const highRiskIntent = await analyzeIntent(highRiskRequest);
  const highRisk = await assessRisk(highRiskIntent, 'agent-2', highRiskRequest.parameters);
  console.log('High Risk Intent Result:', highRiskIntent);
  console.log('High Risk Result (Score > 50?):', highRisk);

  console.log('\n--- 2. Testing Economics Engine ---');
  const economics = await analyzeEconomics(intent, PROVIDER_DATABASE);
  console.log('Economics Result:', economics);
  console.log('Within budget?', economics.withinBudget);
  console.log('Recommended provider:', economics.recommendedProvider);

  console.log('\n--- 3. Testing Provider Selection Engine ---');
  const selection = await selectProvider(economics, providerMemoryStore);
  console.log('Selected Provider:', selection.provider.name);
  console.log('Confidence Score:', selection.confidenceScore);
  console.log('Reasoning:', selection.reasoning);

  console.log('\n--- 4. Checking Config & USDC ASA ID ---');
  console.log('USDC ASA ID:', USDC_CONFIG.asaId, '(Expected: 10458941)');

  console.log('\nAll direct engine tests completed successfully!\n');
}

runDirectEngineTests().catch(console.error);
