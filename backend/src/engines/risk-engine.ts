import { AgentIntent, RiskAssessment } from '../types.js';
import { getRecentRequestCount, addRequest } from '../models/request-history.js';
import { logRisk } from '../logger.js';

export async function assessRisk(
  intent: AgentIntent,
  agentId: string = 'default-agent',
  parameters?: any
): Promise<RiskAssessment> {
  let score = 0;
  const flags: string[] = [];

  // Track request
  addRequest(agentId);

  // a) Check budget against threshold (> 1,000,000 microUSDC = 1 USDC)
  if (intent.budget > 1000000) {
    score += 30;
    flags.push(`Excessive budget requested: ${intent.budget} microUSDC exceeds 1,000,000 threshold (+30)`);
  }

  // b) Check request history (rapid requests in last minute > 5)
  const recentCount = getRecentRequestCount(agentId, 1);
  if (recentCount > 5) {
    score += 20;
    flags.push(`High request frequency: ${recentCount} requests in last minute (+20)`);
  }

  // c) Check for SQL injection / hazardous command patterns in goal and parameters
  const payloadStr = `${intent.goal || ''} ${JSON.stringify(parameters || {})}`.toUpperCase();
  if (/\b(DROP|DELETE|TRUNCATE|ALTER|EXEC|UNION SELECT)\b/.test(payloadStr)) {
    score += 40;
    flags.push('Detected potential injection or destructive command pattern (DROP/DELETE/TRUNCATE) (+40)');
  }

  // d) Check for suspicious parameters (negative numbers, null, undefined values)
  if (parameters !== undefined) {
    let hasSuspiciousParam = false;
    const checkObj = (obj: any): boolean => {
      if (obj === null || obj === undefined) return true;
      if (typeof obj === 'number' && obj < 0) return true;
      if (typeof obj === 'object') {
        return Object.values(obj).some(val => checkObj(val));
      }
      return false;
    };

    if (checkObj(parameters)) {
      hasSuspiciousParam = true;
    }

    if (hasSuspiciousParam) {
      score += 10;
      flags.push('Suspicious parameters detected (negative value, null or undefined) (+10)');
    }
  }

  // e) Unknown intent category (+15 points)
  if (!intent.category) {
    score += 15;
    flags.push('Unclassified or unknown intent category (+15)');
  }

  // Cap score at 100
  score = Math.min(100, score);

  let recommendation: 'ALLOW' | 'DENY' | 'ESCALATE';
  if (score <= 20) {
    recommendation = 'ALLOW';
  } else if (score <= 50) {
    recommendation = 'ALLOW'; // Medium risk (ALLOW with monitoring)
  } else if (score <= 75) {
    recommendation = 'ESCALATE';
  } else {
    recommendation = 'DENY';
  }

  logRisk(`Risk assessed: score=${score}, recommendation=${recommendation}, flags=[${flags.join('; ')}]`);

  return {
    score,
    flags,
    recommendation
  };
}
