import { ProviderOption } from '../types.js';

export function validateSLA(provider: ProviderOption, requirements?: { minSLA?: number }): boolean {
  const minThreshold = requirements?.minSLA ?? 95.0;
  return provider.sla >= minThreshold;
}
