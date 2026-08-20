/**
 * Decision Parser
 *
 * Safely parses and validates Groq JSON completions.
 * Falls back to deterministic defaults if Groq output is malformed.
 */
import { logAgent } from '../logger.js';

export interface AgentDecision {
  summary: string;
  decisionRationale: string;
  nextAction: string;
  confidenceLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  keyLearning: string;
}

export interface ExtractedIntent {
  goal: string;
  category: string;
  estimatedCost: number;
  priority: string;
  reasoning: string;
}

export function parseAgentDecision(raw: any, fallbackGoal: string): AgentDecision {
  if (raw && typeof raw === 'object') {
    return {
      summary: typeof raw.summary === 'string' ? raw.summary : `Agent processed: "${fallbackGoal}"`,
      decisionRationale: typeof raw.decisionRationale === 'string' ? raw.decisionRationale : 'Deterministic policy evaluation completed.',
      nextAction: typeof raw.nextAction === 'string' ? raw.nextAction : 'Review results and proceed if successful.',
      confidenceLevel: ['HIGH', 'MEDIUM', 'LOW'].includes(raw.confidenceLevel) ? raw.confidenceLevel : 'MEDIUM',
      keyLearning: typeof raw.keyLearning === 'string' ? raw.keyLearning : 'No specific learning captured.'
    };
  }

  logAgent(`Malformed decision payload, using defaults for goal: "${fallbackGoal}"`);
  return {
    summary: `Processed goal: "${fallbackGoal}"`,
    decisionRationale: 'Deterministic engines evaluated the request.',
    nextAction: 'Review the pipeline output.',
    confidenceLevel: 'MEDIUM',
    keyLearning: 'Continue monitoring provider performance.'
  };
}

export function parseExtractedIntent(raw: any, originalGoal: string, budget: number): ExtractedIntent {
  if (raw && typeof raw === 'object') {
    return {
      goal: typeof raw.goal === 'string' ? raw.goal : originalGoal,
      category: ['QUERY', 'ANALYSIS', 'EXECUTION', 'PAYMENT'].includes(raw.category) ? raw.category : 'QUERY',
      estimatedCost: typeof raw.estimatedCost === 'number' && raw.estimatedCost > 0 ? Math.min(raw.estimatedCost, budget) : budget,
      priority: ['normal', 'high', 'critical'].includes(raw.priority) ? raw.priority : 'normal',
      reasoning: typeof raw.reasoning === 'string' ? raw.reasoning : 'Classified by keyword analysis.'
    };
  }

  return {
    goal: originalGoal,
    category: 'QUERY',
    estimatedCost: budget,
    priority: 'normal',
    reasoning: 'Default classification (Groq unavailable or parsing failed).'
  };
}
