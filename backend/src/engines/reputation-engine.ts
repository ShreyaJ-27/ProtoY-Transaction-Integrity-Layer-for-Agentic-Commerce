import { AgentIntent, OutcomeVerification, ProviderOption } from '../types.js';
import { PROVIDER_DATABASE } from '../config.js';
import { recordProviderSuccess, recordProviderFailure } from '../models/provider-memory.js';
import { logProvider } from '../logger.js';

export async function updateReputation(
  providerId: string,
  outcome: OutcomeVerification
): Promise<number> {
  const provider = PROVIDER_DATABASE.find(p => p.id === providerId);
  if (!provider) {
    return 0.5;
  }

  const oldReputation = provider.reputation;
  const outcomeScoreNormalized = Math.min(1.0, Math.max(0, outcome.qualityScore / 100));

  // Reputation update formula: (0.7 * oldReputation) + (0.3 * outcomeScore/100)
  const newReputation = Math.round(((0.7 * oldReputation) + (0.3 * outcomeScoreNormalized)) * 100) / 100;
  provider.reputation = newReputation;

  if (outcome.isValid) {
    recordProviderSuccess(providerId);
  } else {
    recordProviderFailure(providerId);
  }

  logProvider(
    `[REPUTATION] Provider ${providerId} score updated: ${oldReputation} → ${newReputation}`
  );

  return newReputation;
}

export async function extractLessons(
  intent: AgentIntent,
  outcome: OutcomeVerification,
  provider: ProviderOption
): Promise<string[]> {
  const lessons: string[] = [];
  const categoryStr = intent.category || 'general';

  if (outcome.isValid && outcome.qualityScore > 80) {
    lessons.push(`This provider excels at ${categoryStr} queries`);
    lessons.push(`Provider ${provider.name} delivered high value: ${outcome.qualityScore}% quality rating`);
  } else if (!outcome.isValid) {
    lessons.push(`Consider avoiding ${provider.name} for this type of request`);
    lessons.push(`Encountered low quality or non-compliant output (Score: ${outcome.qualityScore}%)`);
  } else if (outcome.qualityScore >= 50 && outcome.qualityScore <= 70) {
    lessons.push(`Provider ${provider.name} needs improvement for ${categoryStr} workloads`);
    lessons.push(`Conditional outcome acceptance; monitor SLA closely next time`);
  } else {
    lessons.push(`Standard performance observed for ${provider.name} on ${categoryStr}`);
  }

  return lessons;
}
