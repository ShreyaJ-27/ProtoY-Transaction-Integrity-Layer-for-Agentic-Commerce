import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { GlassPanel, PanelHeader } from './GlassPanel';
import type { OutcomeInfo } from '@/lib/normalize';

interface OutcomePanelProps {
  outcome?: OutcomeInfo;
  success?: boolean;
}

function Check({ value, label }: { value?: boolean | string; label: string }) {
  const isBool = typeof value === 'boolean';
  const isTrue = value === true || value === 'true' || value === 'pass' || value === 'passed';
  const isFalse = value === false || value === 'false' || value === 'fail' || value === 'failed';
  const Icon = isTrue ? CheckCircle2 : isFalse ? XCircle : AlertCircle;
  const color = isTrue ? '#36E0A0' : isFalse ? '#FF5C70' : '#7F929F';
  return (
    <div className="flex items-center gap-2">
      <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color }} strokeWidth={1.5} />
      <span className="text-[11px] text-muted uppercase tracking-wider">{label}</span>
      <span className="text-[11px] font-mono ml-auto" style={{ color }}>
        {isBool ? (isTrue ? 'PASS' : 'FAIL') : value ? String(value) : '—'}
      </span>
    </div>
  );
}

export function OutcomePanel({ outcome, success }: OutcomePanelProps) {
  return (
    <GlassPanel className="w-full overflow-hidden" glow={success ? 'success' : 'none'}>
      <PanelHeader
        title="Outcome Verification"
        subtitle="Schema · Freshness · Query Match · SLA"
        accent="#65E6FF"
        right={
          outcome?.verified ? (
            <span className="text-[10px] font-mono text-success">VERIFIED</span>
          ) : undefined
        }
      />
      <div className="p-4">
        {!outcome ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CheckCircle2 className="w-6 h-6 text-muted/40 mb-2" strokeWidth={1.25} />
            <p className="text-xs text-muted/60 font-mono">No outcome data yet</p>
            <p className="text-[10px] text-muted/40 mt-1">Outcome verified after settlement</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <Check label="Schema" value={outcome.schemaValidity} />
              <Check label="Freshness" value={outcome.freshness} />
              <Check label="Query Match" value={outcome.queryMatch} />
              <Check label="SLA" value={outcome.slaCompliance} />
            </div>

            {outcome.errors && outcome.errors.length > 0 && (
              <div className="bg-critical/5 border border-critical/20 rounded-lg p-2.5">
                <div className="text-[9px] tracking-[0.15em] text-critical uppercase mb-1">Errors</div>
                {outcome.errors.map((e, i) => (
                  <p key={i} className="text-[10px] font-mono text-critical/80">
                    {e}
                  </p>
                ))}
              </div>
            )}

            {outcome.score !== undefined && (
              <div className="flex items-center justify-between bg-bg/40 border border-white/5 rounded-lg px-3 py-2">
                <span className="text-[10px] tracking-[0.2em] uppercase text-muted">Outcome Score</span>
                <span className="text-lg font-mono text-primary">
                  {outcome.score.toFixed(2)}
                </span>
              </div>
            )}

            {outcome.verified && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center justify-center gap-2 py-2 border border-success/20 bg-success/5 rounded-lg"
              >
                <CheckCircle2 className="w-4 h-4 text-success" />
                <span className="text-sm font-medium tracking-[0.2em] text-success uppercase">
                  Outcome Verified
                </span>
              </motion.div>
            )}

            {outcome.reputationDelta !== undefined && (
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-muted">Reputation Update</span>
                <span className={outcome.reputationDelta >= 0 ? 'text-success' : 'text-critical'}>
                  {outcome.reputationDelta >= 0 ? '+' : ''}
                  {outcome.reputationDelta.toFixed(2)}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </GlassPanel>
  );
}
