import { AgentIntent, EconomicsAnalysis, ProviderOption } from '../types.js';
import { calculateFinalPrice } from '../models/pricing-model.js';
import { logEconomics } from '../logger.js';

export async function analyzeEconomics(
  intent: AgentIntent,
  providers: ProviderOption[]
): Promise<EconomicsAnalysis> {
  if (!providers || providers.length === 0) {
    throw new Error('No providers supplied for economic analysis');
  }

  // Calculate pricing and value ratio for each provider
  const scoredProviders = providers.map((provider) => {
    const finalPrice = calculateFinalPrice(provider.price, provider.reputation, intent.budget);
    const valueRatio = finalPrice > 0 ? provider.reputation / finalPrice : 0;
    return {
      provider,
      finalPrice,
      valueRatio
    };
  });

  // Sort by value ratio descending (highest value ratio first)
  scoredProviders.sort((a, b) => b.valueRatio - a.valueRatio);

  const best = scoredProviders[0];
  const secondBest = scoredProviders.length > 1 ? scoredProviders[1] : null;

  const bestPrice = best.finalPrice;
  const savingsOpportunity = secondBest ? Math.max(0, secondBest.finalPrice - bestPrice) : 0;

  const alternatives: ProviderOption[] = scoredProviders.map((sp) => ({
    ...sp.provider,
    price: sp.finalPrice
  }));

  const analysis: EconomicsAnalysis = {
    totalCost: bestPrice,
    unitPrice: bestPrice,
    valueRatio: best.valueRatio,
    recommendedProvider: best.provider.id,
    alternatives,
    withinBudget: bestPrice <= intent.budget,
    savingsOpportunity
  };

  logEconomics(
    `Analyzed economics: bestProvider=${analysis.recommendedProvider}, cost=${analysis.totalCost}, withinBudget=${analysis.withinBudget}, savings=${analysis.savingsOpportunity}`
  );

  return analysis;
}
