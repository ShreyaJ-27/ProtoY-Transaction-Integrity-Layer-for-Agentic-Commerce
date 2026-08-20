export function calculateFinalPrice(
  basePrice: number,
  reputation: number,
  budget: number
): number {
  // Reputation multiplier: basePrice * (0.8 + (reputation * 0.2))
  const reputationFactor = 0.8 + (reputation * 0.2);
  let price = basePrice * reputationFactor;

  // Volume discount: if budget > 100,000 microUSDC, apply 5% discount
  if (budget > 100000) {
    price *= 0.95;
  }

  return Math.round(price);
}
