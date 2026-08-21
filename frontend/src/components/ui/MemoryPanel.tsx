import { motion } from 'framer-motion';
import { Brain, Sparkles, Clock, TrendingUp } from 'lucide-react';
import { GlassPanel, PanelHeader } from './GlassPanel';
import type { MemoryInfo } from '@/lib/normalize';

interface MemoryPanelProps {
  memory?: MemoryInfo;
}

function MemoryEntry({ m, index }: { m: NonNullable<MemoryInfo['entries']>[number]; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="border-l border-primary/20 pl-3 py-2 space-y-1.5"
    >
      {m.experience && (
        <div className="flex items-start gap-1.5">
          <Sparkles className="w-3 h-3 text-primary mt-0.5 flex-shrink-0" />
          <span className="text-[11px] text-ink">{m.experience}</span>
        </div>
      )}
      <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] font-mono text-muted">
        {m.provider && <span>P: {m.provider}</span>}
        {m.intent && <span>I: {m.intent}</span>}
        {m.outcome && <span>O: {m.outcome}</span>}
        {m.quality !== undefined && (
          <span className="text-success">Q: {String(m.quality)}</span>
        )}
        {m.latency !== undefined && (
          <span className="flex items-center gap-0.5">
            <Clock className="w-2.5 h-2.5" /> {String(m.latency)}
          </span>
        )}
      </div>
      {m.lesson && (
        <p className="text-[10px] font-mono text-primary/70 italic">"{m.lesson}"</p>
      )}
    </motion.div>
  );
}

export function MemoryPanel({ memory }: MemoryPanelProps) {
  const hasData = memory && (memory.experience || memory.lesson || (memory.entries && memory.entries.length > 0));

  return (
    <GlassPanel className="w-full overflow-hidden">
      <PanelHeader title="Agent Memory" subtitle="Reputation & Experience Store" accent="#9B8CFF" />
      <div className="p-4">
        {!hasData ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Brain className="w-6 h-6 text-muted/40 mb-2" strokeWidth={1.25} />
            <p className="text-xs text-muted/60 font-mono">No memory data yet</p>
            <p className="text-[10px] text-muted/40 mt-1">Memory stored after execution</p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Single summary entry */}
            {(memory.experience || memory.lesson) && !memory.entries?.length && (
              <div className="border-l border-primary/20 pl-3 py-1 space-y-1.5">
                {memory.experience && (
                  <div className="flex items-start gap-1.5">
                    <Sparkles className="w-3 h-3 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-[11px] text-ink">{memory.experience}</span>
                  </div>
                )}
                <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] font-mono text-muted">
                  {memory.provider && <span>P: {memory.provider}</span>}
                  {memory.intent && <span>I: {memory.intent}</span>}
                  {memory.outcome && <span>O: {memory.outcome}</span>}
                  {memory.quality !== undefined && (
                    <span className="text-success">Q: {String(memory.quality)}</span>
                  )}
                  {memory.latency !== undefined && (
                    <span className="flex items-center gap-0.5">
                      <Clock className="w-2.5 h-2.5" /> {String(memory.latency)}
                    </span>
                  )}
                </div>
                {memory.lesson && (
                  <p className="text-[10px] font-mono text-primary/70 italic">"{memory.lesson}"</p>
                )}
              </div>
            )}

            {/* Multiple entries */}
            {memory.entries && memory.entries.length > 0 && (
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {memory.entries.map((m, i) => (
                  <MemoryEntry key={i} m={m} index={i} />
                ))}
              </div>
            )}

            {/* Manifesto */}
            <div className="flex items-center gap-2 pt-2 border-t border-white/5">
              <TrendingUp className="w-3 h-3 text-primary" />
              <p className="text-[10px] tracking-[0.12em] text-muted uppercase leading-relaxed">
                The agent didn't just complete the transaction.
                <br />
                <span className="text-primary/90">It learned from it.</span>
              </p>
            </div>
          </div>
        )}
      </div>
    </GlassPanel>
  );
}
