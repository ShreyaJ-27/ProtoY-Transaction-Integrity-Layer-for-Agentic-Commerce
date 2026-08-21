import { motion } from 'framer-motion';
import { Server, Award, TrendingUp } from 'lucide-react';
import { GlassPanel, PanelHeader } from './GlassPanel';
import type { ProviderInfo } from '@/lib/normalize';

interface ProviderPanelProps {
  providers?: ProviderInfo[];
  selected?: ProviderInfo;
}

function Stat({ label, value, mono = true }: { label: string; value?: string | number; mono?: boolean }) {
  return (
    <div className="flex flex-col">
      <span className="text-[9px] tracking-[0.15em] text-muted uppercase">{label}</span>
      <span className={`text-xs text-ink ${mono ? 'font-mono' : ''}`}>
        {value !== undefined && value !== null && value !== '' ? value : '—'}
      </span>
    </div>
  );
}

function ProviderRow({ p, index, isSelected }: { p: ProviderInfo; index: number; isSelected: boolean }) {
  const score = p.score ?? 0;
  const rep = p.reputation ?? 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className={`relative rounded-lg border p-3 transition-all ${
        isSelected
          ? 'border-primary/40 bg-primary/8 shadow-[0_0_16px_rgba(101,230,255,0.1)]'
          : 'border-white/5 bg-white/[0.02]'
      }`}
    >
      {isSelected && (
        <span className="absolute -left-px top-3 bottom-3 w-[2px] bg-primary rounded-full shadow-[0_0_8px_#65E6FF]" />
      )}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-muted w-4">{String(index + 1).padStart(2, '0')}</span>
          <span className="text-sm font-medium text-ink">{p.name}</span>
          {isSelected && (
            <span className="text-[9px] font-mono tracking-wider text-primary bg-primary/10 px-1.5 py-0.5 rounded">
              SELECTED
            </span>
          )}
        </div>
        <span className="text-[10px] font-mono text-muted">#{index + 1}</span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Stat label="Rep" value={rep !== undefined ? rep.toFixed(1) : undefined} />
        <Stat label="Success" value={p.successRate !== undefined ? `${p.successRate}%` : undefined} />
        <Stat label="SLA" value={p.sla} />
        <Stat label="Price" value={p.price} />
        <Stat label="Adj." value={p.adjustedPrice} />
        <Stat label="Score" value={score !== undefined ? score.toFixed(2) : undefined} />
      </div>
    </motion.div>
  );
}

export function ProviderPanel({ providers, selected }: ProviderPanelProps) {
  const list = providers ?? (selected ? [selected] : []);
  const sorted = [...list].sort((a, b) => (b.score ?? 0) - (a.score ?? 0));

  return (
    <GlassPanel className="w-full overflow-hidden">
      <PanelHeader
        title="Provider Selection"
        subtitle="Economics Engine · Provider Ranking"
        accent="#9B8CFF"
        right={
          selected ? (
            <span className="text-[10px] font-mono text-primary">{selected.name}</span>
          ) : undefined
        }
      />
      <div className="p-4">
        {list.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Server className="w-6 h-6 text-muted/40 mb-2" strokeWidth={1.25} />
            <p className="text-xs text-muted/60 font-mono">No provider data yet</p>
            <p className="text-[10px] text-muted/40 mt-1">Provider selected after execution</p>
          </div>
        ) : (
          <div className="space-y-2">
            {sorted.map((p, i) => (
              <ProviderRow
                key={(p.name ?? 'provider') + i}
                p={p}
                index={i}
                isSelected={p.selected || (selected && p.name === selected.name) || (i === 0 && !selected)}
              />
            ))}

            {selected && (
              <div className="mt-3 pt-3 border-t border-white/5">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="w-3.5 h-3.5 text-primary" />
                  <span className="text-[10px] tracking-[0.2em] uppercase text-primary">
                    Why Selected?
                  </span>
                </div>
                <p className="text-[11px] font-mono text-muted/80 leading-relaxed">
                  {selected.name} achieved the highest composite score
                  {selected.score !== undefined ? ` (${selected.score.toFixed(2)})` : ''} balancing
                  reputation, success rate, SLA, and adjusted price against the transaction budget.
                </p>
                {selected.adjustedPrice !== undefined && (
                  <div className="flex items-center gap-1.5 mt-2 text-[10px] text-success">
                    <TrendingUp className="w-3 h-3" />
                    <span className="font-mono">
                      Adjusted price: {selected.adjustedPrice}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </GlassPanel>
  );
}
