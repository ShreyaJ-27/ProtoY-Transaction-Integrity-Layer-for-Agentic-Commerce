import { motion } from 'framer-motion';
import { PIPELINE } from '@/lib/constants';
import type { UseTransaction } from '@/hooks/useTransaction';

interface MetricsBarProps {
  tx: UseTransaction;
}

export function MetricsBar({ tx }: MetricsBarProps) {
  const stages = PIPELINE;
  const doneCount = tx.timeline.filter((e) => e.status === 'done').length;
  const activeIndex = tx.activeStage
    ? stages.findIndex((s) => s.id === tx.activeStage)
    : -1;
  const failed = tx.appState === 'FAILED';
  const success = tx.appState === 'SUCCESS';
  const progress = success ? 100 : failed ? (activeIndex / stages.length) * 100 : (doneCount / stages.length) * 100;

  return (
    <div className="relative z-20 h-14 border-t border-white/5 bg-bg/60 backdrop-blur-md flex items-center px-4 gap-4 overflow-x-auto no-scrollbar">
      {/* Pipeline progress */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="text-[9px] tracking-[0.2em] text-muted uppercase">Pipeline</span>
        <div className="w-24 h-1 rounded-full bg-white/5 overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{
              background: failed ? '#FF5C70' : success ? '#36E0A0' : '#65E6FF',
              boxShadow: `0 0 6px ${failed ? '#FF5C70' : success ? '#36E0A0' : '#65E6FF'}`,
            }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
        <span className="text-[10px] font-mono text-muted w-8">
          {Math.round(progress)}%
        </span>
      </div>

      <div className="h-6 w-px bg-white/5 flex-shrink-0" />

      {/* Stage chips */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        {stages.map((s, i) => {
          const isActive = tx.activeStage === s.id;
          const isDone = tx.timeline.find((e) => e.stage === s.id)?.status === 'done';
          const isFailed = failed && tx.activeStage === s.id;
          const color = isFailed ? '#FF5C70' : success ? '#36E0A0' : isActive ? s.color : isDone ? s.color : '#2A3640';
          return (
            <div key={s.id} className="flex items-center gap-1.5">
              <div className="flex items-center gap-1">
                <span
                  className="w-1.5 h-1.5 rounded-full transition-all"
                  style={{
                    background: isActive || isDone || isFailed ? color : 'transparent',
                    border: `1px solid ${color}`,
                    boxShadow: isActive || isFailed ? `0 0 6px ${color}` : 'none',
                  }}
                />
                <span
                  className="text-[9px] font-mono tracking-wider uppercase transition-colors"
                  style={{ color: isActive || isDone || isFailed ? color : '#3A4651' }}
                >
                  {s.short}
                </span>
              </div>
              {i < stages.length - 1 && (
                <span className="text-[8px] text-muted/30">›</span>
              )}
            </div>
          );
        })}
      </div>

      <div className="h-6 w-px bg-white/5 flex-shrink-0 hidden lg:block" />

      {/* State indicator */}
      <div className="hidden lg:flex items-center gap-2 flex-shrink-0 ml-auto">
        <span className="text-[9px] tracking-[0.2em] text-muted uppercase">State</span>
        <span
          className="text-[10px] font-mono tracking-wider"
          style={{
            color: failed ? '#FF5C70' : success ? '#36E0A0' : tx.isRunning ? '#65E6FF' : '#7F929F',
          }}
        >
          {tx.appState}
        </span>
      </div>
    </div>
  );
}
