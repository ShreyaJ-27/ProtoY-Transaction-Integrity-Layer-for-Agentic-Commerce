export interface RequestLog {
  timestamp: Date;
}

class RequestHistoryTracker {
  private history = new Map<string, RequestLog[]>();

  public addRequest(agentId: string = 'default-agent'): void {
    this.cleanup(10);
    const logs = this.history.get(agentId) || [];
    logs.push({ timestamp: new Date() });
    this.history.set(agentId, logs);
  }

  public getRecentRequestCount(agentId: string = 'default-agent', minutes: number = 1): number {
    const logs = this.history.get(agentId) || [];
    const cutoff = Date.now() - minutes * 60 * 1000;
    return logs.filter((log) => log.timestamp.getTime() >= cutoff).length;
  }

  public cleanup(olderThanMinutes: number = 10): void {
    const cutoff = Date.now() - olderThanMinutes * 60 * 1000;
    for (const [agentId, logs] of this.history.entries()) {
      const filtered = logs.filter((log) => log.timestamp.getTime() >= cutoff);
      if (filtered.length === 0) {
        this.history.delete(agentId);
      } else {
        this.history.set(agentId, filtered);
      }
    }
  }

  public clear(): void {
    this.history.clear();
  }
}

export const requestHistory = new RequestHistoryTracker();

export function addRequest(agentId: string = 'default-agent'): void {
  requestHistory.addRequest(agentId);
}

export function getRecentRequestCount(agentId: string = 'default-agent', minutes: number = 1): number {
  return requestHistory.getRecentRequestCount(agentId, minutes);
}
