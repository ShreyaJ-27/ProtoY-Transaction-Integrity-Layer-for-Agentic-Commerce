import { EconomicsAnalysis, ProviderOption } from '../types.js';
import { ProviderMemory } from '../models/provider-memory.js';
import { validateSLA } from '../utils/provider-validator.js';
import { logProvider } from '../logger.js';

export async function selectProvider(
  economics: EconomicsAnalysis,
  memory: Map<string, ProviderMemory>
): Promise<{
  provider: ProviderOption;
  confidenceScore: number;
  reasoning: string[];
}> {
  const candidateList = economics.alternatives && economics.alternatives.length > 0
    ? economics.alternatives
    : [];

  if (candidateList.length === 0) {
    throw new Error('No candidate providers available in economics analysis');
  }

  const evaluateCandidate = (candidate: ProviderOption) => {
    const reasoning: string[] = [];
    const mem = memory.get(candidate.id);
    let successRate = 1.0; // default assumption for new provider

    if (mem && (mem.successCount + mem.failureCount) > 0) {
      successRate = mem.successCount / (mem.successCount + mem.failureCount);
      reasoning.push(
        `Historical performance: ${mem.successCount} successes, ${mem.failureCount} failures (${(successRate * 100).toFixed(1)}% success rate)`
      );
    } else {
      reasoning.push('No prior history recorded; assuming baseline success rate');
    }

    // SLA validation
    const slaPasses = validateSLA(candidate);
    const slaCompliance = Math.min(1.0, candidate.sla / 100);
    if (!slaPasses) {
      reasoning.push(`Warning: SLA (${candidate.sla}%) below recommended threshold (95.0%)`);
    } else {
      reasoning.push(`SLA verified: ${candidate.sla}% SLA compliance`);
    }

    // Adjusted reputation
    const adjustedReputation = 0.5 * successRate + 0.5 * candidate.reputation;
    reasoning.push(
      `Adjusted reputation: ${(adjustedReputation * 100).toFixed(1)}% (stated: ${(candidate.reputation * 100).toFixed(1)}%)`
    );

    // Final score formula: (reputation * 0.6) + (successRate * 0.3) + (sla_compliance * 0.1)
    const score = (adjustedReputation * 0.6) + (successRate * 0.3) + (slaCompliance * 0.1);
    reasoning.push(`Calculated confidence score: ${(score * 100).toFixed(1)}`);

    return {
      provider: candidate,
      score,
      reasoning
    };
  };

  // Find top recommended provider from economics
  let recommended = candidateList.find(p => p.id === economics.recommendedProvider) || candidateList[0];
  let evaluation = evaluateCandidate(recommended);

  // If score < 0.7, evaluate alternatives to see if another provider scores higher
  if (evaluation.score < 0.7 && candidateList.length > 1) {
    evaluation.reasoning.push('Primary recommended provider score below 0.7 threshold; evaluating alternatives');
    for (const alt of candidateList) {
      if (alt.id === recommended.id) continue;
      const altEval = evaluateCandidate(alt);
      if (altEval.score > evaluation.score) {
        altEval.reasoning.push(`Alternative provider ${alt.name} selected due to higher reliability score`);
        evaluation = altEval;
      }
    }
  }

  const confidenceScore = Math.round(evaluation.score * 100);

  logProvider(
    `Selected provider "${evaluation.provider.name}" (${evaluation.provider.id}) with confidence score ${confidenceScore}`
  );

  return {
    provider: evaluation.provider,
    confidenceScore,
    reasoning: evaluation.reasoning
  };
}
