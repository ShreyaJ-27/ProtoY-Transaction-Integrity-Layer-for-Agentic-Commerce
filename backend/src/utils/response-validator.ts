export function validateSchema(response: any): boolean {
  if (!response || typeof response !== 'object') {
    return false;
  }
  const hasResult = typeof response.result === 'string' && response.result.length > 0;
  const hasTimestamp = Boolean(response.timestamp);
  const hasSources = Array.isArray(response.sources);
  return hasResult && hasTimestamp && hasSources;
}

export function validateFreshness(timestamp: Date | string | number): boolean {
  if (!timestamp) return false;
  const time = new Date(timestamp).getTime();
  if (isNaN(time)) return false;
  const ageSeconds = (Date.now() - time) / 1000;
  return ageSeconds >= -5 && ageSeconds <= 60; // within 60 seconds (with 5s skew tolerance)
}

export function validateRequestMatch(request: string, response: string): boolean {
  if (!request || !response) return false;
  const reqWords = request
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 3);

  if (reqWords.length === 0) return true; // generic request matches

  const resLower = response.toLowerCase();
  // Match at least one significant keyword or 30% of words
  const matchCount = reqWords.filter(w => resLower.includes(w)).length;
  return matchCount > 0;
}
