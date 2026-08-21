import { motion, AnimatePresence } from 'framer-motion';
import { PIPELINE, type StageId } from '@/lib/constants';
import type { TimelineEvent } from '@/hooks/useTransaction';

interface TimelineProps {
  events: TimelineEvent[];
  activeStage: StageId | null;
  failed: boolean;
  success: boolean;
}

const STATUS_COLOR: Record<TimelineEvent['status'], string> = {
  pending: '#2A3640',
  active: '#65E6FF',
  done: '#36E0A0',
  failed: '#FF5C70',
};

export function Timeline({ events, activeStage, failed, success }: TimelineProps) {
  const displaySteps = PIPELINE.map((stage) => {
    const ev = events.find((e) => e.stage === stage.id);
    let status: TimelineEvent['status'] = 'pending';
    if (ev) status = ev.status;
    if (failed && ev?.status === 'failed') status = 'failed';
    return { stage, status, detail: ev?.detail };
  });

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_#65E6FF]" />
          <h3 className="text-[11px] font-medium tracking-[0.22em] text-ink/90 uppercase">
            Live Integrity Timeline
          </h3>
        </div>
        <span className="text-[10px] font-mono text-muted">
          {success ? 'COMPLETE' : failed ? 'FAILED' : activeStage ? activeStage.toUpperCase() : 'IDLE'}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1">
        {displaySteps.length === 0 && (
          <div className="text-center text-muted/60 text-xs font-mono py-8">
            Awaiting execution…
          </div>
        )}
        <AnimatePresence>
          {displaySteps.map(({ stage, status, detail }, i) => {
            const color = STATUS_COLOR[status];
            const isActive = status === 'active';
            const isDone = status === 'done';
            const isFailed = status === 'failed';
            return (
              <motion.div
                key={stage.id}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03, duration: 0.3 }}
                className="relative flex items-start gap-3 py-2"
              >
                {i < displaySteps.length - 1 && (
                  <div
                    className="absolute left-[5px] top-7 bottom-0 w-px"
                    style={{
                      background: isDone ? 'rgba(54,224,160,0.3)' : 'rgba(127,146,159,0.12)',
                    }}
                  />
                )}

                <div className="relative flex-shrink-0 mt-1">
                  <span
                    className={`block w-[11px] h-[11px] rounded-full border-2 transition-all duration-300 ${
                      isActive ? 'pulse-ring' : ''
                    }`}
                    style={{
                      borderColor: color,
                      background: isDone || isFailed ? color : 'transparent',
                      boxShadow: isActive || isDone || isFailed ? `0 0 10px ${color}` : 'none',
                      color: color,
                    }}
                  />
                </div>

                <div className="flex-1 min-w-0 pb-1">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-xs font-medium transition-colors ${
                        status === 'pending' ? 'text-muted/70' : 'text-ink'
                      }`}
                    >
                      {stage.label}
                    </span>
                    <span
                      className="text-[9px] font-mono tracking-wider uppercase"
                      style={{ color }}
                    >
                      {status === 'pending'
                        ? ''
                        : status === 'active'
                          ? 'processing'
                          : status === 'done'
                            ? 'done'
                            : 'failed'}
                    </span>
                  </div>
                  <p className="text-[10px] text-muted/70 mt-0.5">{stage.description}</p>
                  {detail && (
                    <p className="text-[10px] font-mono text-muted mt-0.5 truncate">{detail}</p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
