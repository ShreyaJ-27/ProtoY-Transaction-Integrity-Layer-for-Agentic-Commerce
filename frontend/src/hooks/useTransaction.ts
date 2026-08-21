import { useCallback, useRef, useState } from 'react';
import { PIPELINE, type AppState, type StageId, type TimelineStep } from '@/lib/constants';
import { ApiError, executeTransaction } from '@/lib/api';
import { normalizeResult, type NormalizedResult } from '@/lib/normalize';

export interface TimelineEvent {
  step: TimelineStep;
  stage: StageId;
  status: 'pending' | 'active' | 'done' | 'failed';
  detail?: string;
  timestamp?: number;
}

interface RunHandle {
  cancelled: boolean;
  controller: AbortController;
}

export interface UseTransaction {
  appState: AppState;
  activeStage: StageId | null;
  timeline: TimelineEvent[];
  result: NormalizedResult | null;
  error: string | null;
  isRunning: boolean;
  isPaused: boolean;
  isDemo: false;
  run: (goal: string, budget: string) => Promise<void>;
  reset: () => void;
  pause: () => void;
  resume: () => void;
  togglePause: () => void;
}

export function useTransaction(): UseTransaction {
  const [appState, setAppState] = useState<AppState>('IDLE');
  const [activeStage, setActiveStage] = useState<StageId | null>(null);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [result, setResult] = useState<NormalizedResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const handleRef = useRef<RunHandle | null>(null);

  const buildInitialTimeline = useCallback((): TimelineEvent[] => {
    return PIPELINE.map((s) => {
      const step =
        s.id === 'groq' || s.id === 'intent'
          ? ('Intent extracted' as TimelineStep)
          : s.id === 'risk'
            ? ('Risk evaluated' as TimelineStep)
            : s.id === 'economics'
              ? ('Economics optimized' as TimelineStep)
              : s.id === 'provider'
                ? ('Provider selected' as TimelineStep)
                : s.id === 'x402'
                  ? ('HTTP 402' as TimelineStep)
                  : s.id === 'algorand'
                    ? ('Algorand settlement' as TimelineStep)
                    : s.id === 'outcome'
                      ? ('Outcome verified' as TimelineStep)
                      : ('Memory stored' as TimelineStep);
      return { step, stage: s.id, status: 'pending' as const };
    });
  }, []);

  const reset = useCallback(() => {
    if (handleRef.current) {
      handleRef.current.cancelled = true;
      handleRef.current.controller.abort();
    }
    setAppState('IDLE');
    setActiveStage(null);
    setTimeline([]);
    setResult(null);
    setError(null);
    setIsRunning(false);
    setIsPaused(false);
  }, []);

  const pause = useCallback(() => {
    setIsPaused(false);
  }, []);

  const resume = useCallback(() => {
    setIsPaused(false);
  }, []);

  const togglePause = useCallback(() => {
    setIsPaused(false);
  }, []);

  const run = useCallback(
    async (goal: string, budget: string) => {
      if (isRunning) return;
      if (handleRef.current) handleRef.current.cancelled = true;
      const handle: RunHandle = { cancelled: false, controller: new AbortController() };
      handleRef.current = handle;
      setIsPaused(false);

      setIsRunning(true);
      setError(null);
      setResult(null);
      setTimeline(buildInitialTimeline().map((event, index) =>
        index === 0 ? { ...event, status: 'active' as const, timestamp: Date.now() } : event,
      ));
      setActiveStage('groq');
      setAppState('ANALYZING');

      try {
        const parsedBudget = Number(budget);
        if (!goal.trim()) throw new ApiError('Enter a goal before executing.', 400, null);
        if (!Number.isFinite(parsedBudget) || parsedBudget <= 0) {
          throw new ApiError('Budget must be a positive number.', 400, null);
        }

        const response = await executeTransaction({ goal: goal.trim(), budget: parsedBudget });
        if (handle.cancelled) return;
        const normalized = normalizeResult(response);
        setResult(normalized);
        const stageState = buildTimelineFromResult(normalized);
        setTimeline(stageState.timeline);
        setActiveStage(stageState.failedStage ?? (normalized.success ? 'memory' : stageState.lastStage));
        setAppState(
          normalized.success
            ? 'SUCCESS'
            : response.agent.decision === 'ESCALATE'
              ? 'PAYMENT_REQUIRED'
              : 'FAILED',
        );
      } catch (e) {
        if (handle.cancelled) return;
        const msg = e instanceof Error ? e.message : 'Unexpected error.';
        const failedStage = e instanceof ApiError && e.status === 403 ? 'risk' : e instanceof ApiError && e.status === 402 ? 'x402' : 'groq';
        setAppState(e instanceof ApiError && e.status === 402 ? 'PAYMENT_REQUIRED' : 'FAILED');
        setActiveStage(failedStage);
        setTimeline((prev) => {
          const failedIndex = PIPELINE.findIndex((stage) => stage.id === failedStage);
          return prev.map((event) => {
            const eventIndex = PIPELINE.findIndex((stage) => stage.id === event.stage);
            return event.stage === failedStage
              ? { ...event, status: 'failed' as const, detail: msg, timestamp: Date.now() }
              : eventIndex >= 0 && eventIndex < failedIndex
                ? { ...event, status: 'done' as const, timestamp: Date.now() }
                : event;
          });
        });
        setError(msg);
      } finally {
        if (!handle.cancelled) setIsRunning(false);
      }
    },
    [isRunning, buildInitialTimeline],
  );

  return {
    appState,
    activeStage,
    timeline,
    result,
    error,
    isRunning,
    isPaused,
    isDemo: false,
    run,
    reset,
    pause,
    resume,
    togglePause,
  };
}

function buildTimelineFromResult(result: NormalizedResult): {
  timeline: TimelineEvent[];
  failedStage?: StageId;
  lastStage: StageId;
} {
  const completed = new Set<StageId>();
  if (result.raw.agent) completed.add('groq');
  if (result.intent) completed.add('intent');
  if (result.risk) completed.add('risk');
  if (result.economics) completed.add('economics');
  if (result.selectedProvider) completed.add('provider');
  if (result.payment) completed.add('x402');
  if (result.payment?.status === 'SETTLED') completed.add('algorand');
  if (result.outcome) completed.add('outcome');
  if (result.memory) completed.add('memory');

  let failedStage: StageId | undefined;
  if (result.risk?.verdict === 'DENY') failedStage = 'risk';
  else if (result.economics?.optimal === false) failedStage = 'economics';
  else if (result.payment?.status === 'FAILED') failedStage = 'x402';
  else if (result.service && result.service.status === 'FAILED') failedStage = 'outcome';
  else if (!result.success && !result.outcome && result.payment?.status === 'SKIPPED') failedStage = 'risk';

  const lastStage = failedStage ?? [...completed].pop() ?? 'groq';
  const timeline = PIPELINE.map((stage) => {
    const status = failedStage === stage.id
      ? 'failed'
      : completed.has(stage.id)
        ? 'done'
        : 'pending';
    return {
      step: timelineStep(stage.id),
      stage: stage.id,
      status,
      detail: detailForStage(stage.id, result),
      timestamp: Date.now(),
    } as TimelineEvent;
  });
  return { timeline, failedStage, lastStage };
}

function timelineStep(stage: StageId): TimelineStep {
  switch (stage) {
    case 'groq':
    case 'intent': return 'Intent extracted';
    case 'risk': return 'Risk evaluated';
    case 'economics': return 'Economics optimized';
    case 'provider': return 'Provider selected';
    case 'x402': return 'HTTP 402';
    case 'algorand': return 'Algorand settlement';
    case 'outcome': return 'Outcome verified';
    case 'memory': return 'Memory stored';
  }
}

function detailForStage(stage: StageId, d: NormalizedResult): string | undefined {
  switch (stage) {
    case 'groq':
    case 'intent':
      return d.intent?.action ? `Action: ${d.intent.action}` : undefined;
    case 'risk':
      return d.risk?.score !== undefined ? `Score ${d.risk.score} · ${d.risk.verdict ?? ''}` : undefined;
    case 'economics':
      return d.economics?.cost !== undefined ? `Cost: ${d.economics.cost}` : undefined;
    case 'provider':
      return d.selectedProvider?.name ? `Selected: ${d.selectedProvider.name}` : undefined;
    case 'x402':
      return d.payment?.status ? `${d.payment.status}${d.payment.amount !== undefined ? ` · ${d.payment.amount}` : ''}` : undefined;
    case 'algorand':
      return d.settlement?.confirmed ? 'Settled' : undefined;
    case 'outcome':
      return d.outcome?.verified ? 'Verified' : d.outcome?.score !== undefined ? `Score ${d.outcome.score}` : undefined;
    case 'memory':
      return d.memory?.lesson ? 'Learned' : 'Stored';
    default:
      return undefined;
  }
}
