import { AgentIntent } from '../types.js';
import { logRisk } from '../logger.js';

export async function analyzeIntent(request: {
  goal: string;
  parameters?: any;
  estimatedCost?: number;
}): Promise<AgentIntent> {
  const goalLower = (request.goal || '').toLowerCase();
  
  // Keyword classification
  let category: string | undefined;
  if (goalLower.includes('payment') || goalLower.includes('transfer') || goalLower.includes('pay') || goalLower.includes('send')) {
    category = 'PAYMENT';
  } else if (goalLower.includes('execute') || goalLower.includes('run') || goalLower.includes('call') || goalLower.includes('action')) {
    category = 'EXECUTION';
  } else if (goalLower.includes('analyze') || goalLower.includes('research') || goalLower.includes('evaluate') || goalLower.includes('compute')) {
    category = 'ANALYSIS';
  } else if (goalLower.includes('weather') || goalLower.includes('query') || goalLower.includes('get') || goalLower.includes('fetch') || goalLower.includes('read')) {
    category = 'QUERY';
  } else {
    category = undefined; // Unknown intent category
  }

  // Budget estimation
  const budget = request.estimatedCost !== undefined && request.estimatedCost > 0
    ? request.estimatedCost
    : 50000; // default 50,000 microUSDC

  const intent: AgentIntent = {
    goal: request.goal,
    budget,
    priority: 'normal',
    category
  };

  logRisk(`Analyzed intent: goal="${intent.goal}", category="${category || 'UNKNOWN'}", budget=${budget}`);
  return intent;
}
