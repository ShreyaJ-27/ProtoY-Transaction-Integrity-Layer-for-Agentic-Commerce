import crypto from 'crypto';

export function hashResponse(response: any): string {
  const jsonString = typeof response === 'string' ? response : JSON.stringify(response);
  return crypto.createHash('sha256').update(jsonString).digest('hex');
}
