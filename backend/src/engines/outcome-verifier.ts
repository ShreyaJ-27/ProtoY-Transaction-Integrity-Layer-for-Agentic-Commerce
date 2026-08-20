import { OutcomeVerification, ProviderOption } from '../types.js';
import { validateSchema, validateFreshness, validateRequestMatch } from '../utils/response-validator.js';
import { hashResponse } from '../utils/crypto-utils.js';
import { logInfo } from '../logger.js';

export async function verifyOutcome(
  request: any,
  response: any,
  provider: ProviderOption,
  responseTimeMs?: number
): Promise<OutcomeVerification> {
  const breakdown = {
    schema: 0,
    freshness: 0,
    match: 0,
    sla: 0,
    errors: 0
  };

  // a) Schema Validation (25 pts)
  const isSchemaValid = validateSchema(response);
  if (isSchemaValid) {
    breakdown.schema = 25;
  }

  // b) Freshness (20 pts)
  const timestamp = response?.timestamp;
  const isFresh = validateFreshness(timestamp);
  if (isFresh) {
    breakdown.freshness = 20;
  }

  // c) Request-Response Match (30 pts)
  const goalOrQuery = typeof request === 'string'
    ? request
    : request?.goal || request?.query || JSON.stringify(request || {});
  const resText = typeof response?.result === 'string'
    ? response.result
    : JSON.stringify(response || {});

  const isMatch = validateRequestMatch(goalOrQuery, resText);
  if (isMatch) {
    breakdown.match = 30;
  }

  // d) SLA Compliance (15 pts)
  // Check if responseTime is under SLA threshold (or provider SLA allows)
  const measuredTime = responseTimeMs ?? response?.executionTime ?? 100;
  const expectedMaxTime = 5000; // 5s SLA baseline
  if (measuredTime <= expectedMaxTime && (provider.sla >= 95.0)) {
    breakdown.sla = 15;
  } else if (measuredTime <= expectedMaxTime * 1.5) {
    breakdown.sla = 8;
  }

  // e) Error Detection (10 pts)
  const hasErrors = Boolean(
    response?.error ||
    response?.statusCode >= 400 ||
    (typeof resText === 'string' && /\b(error|exception|fail|failed|unauthorized)\b/i.test(resText) && resText.length < 50)
  );
  if (!hasErrors) {
    breakdown.errors = 10;
  }

  const qualityScore = breakdown.schema + breakdown.freshness + breakdown.match + breakdown.sla + breakdown.errors;
  const proof = hashResponse(response);

  let recommendation: 'TRUST' | 'CONDITIONAL' | 'DISTRUST';
  let isValid: boolean;

  if (qualityScore >= 70) {
    isValid = true;
    recommendation = 'TRUST';
  } else if (qualityScore >= 50) {
    isValid = true;
    recommendation = 'CONDITIONAL';
  } else {
    isValid = false;
    recommendation = 'DISTRUST';
  }

  logInfo(
    `[OUTCOME] Verification complete for provider "${provider.name}": score=${qualityScore}/100, rec=${recommendation}`
  );

  return {
    isValid,
    qualityScore,
    proof,
    breakdown,
    recommendation
  };
}
