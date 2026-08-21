import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ShieldAlert, HelpCircle } from 'lucide-react';
import { GlassPanel, PanelHeader } from './GlassPanel';
import { riskVerdictFromScore, type RiskVerdict } from '@/lib/constants';
import type { RiskInfo } from '@/lib/normalize';

interface RiskPanelProps {
  risk?: RiskInfo;
  failed?: boolean;
}

const VERDICT_COLOR: Record<RiskVerdict, string> = {
  ALLOW: '#36E0A0',
  ESCALATE: '#FFB547',
  DENY: '#FF5C70',
};

function RadialGauge({ score, verdict }: { score?: number; verdict?: RiskVerdict }) {
  const displayScore = score ?? 0;
  const color = VERDICT_COLOR[verdict ?? riskVerdictFromScore(displayScore)];
  const radius = 52;
  const circ = 2 * Math.PI * radius;
  const pct = Math.min(Math.max(displayScore, 0), 100) / 100;
  const offset = circ * (1 - pct);

  return (
    <div className="relative w-[140px] h-[140px] flex items-center justify-center">
      <svg width="140" height="140" className="-rotate-90">
        <circle cx="70" cy="70" r={radius} fill="none" stroke="rgba(127,146,159,0.12)" strokeWidth="6" />
        <motion.circle
          cx="70"
          cy="70"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
          style={{ filter: `drop-shadow(0 0 6px ${color})` }}
        />
        {/* Threshold ticks */}
        {[50, 75].map((t) => {
          const angle = (t / 100) * 360 - 90;
          const x1 = 70 + Math.cos((angle * Math.PI) / 180) * (radius - 10);
          const y1 = 70 + Math.sin((angle * Math.PI) / 180) * (radius - 10);
          const x2 = 70 + Math.cos((angle * Math.PI) / 180) * (radius + 4);
          const y2 = 70 + Math.sin((angle * Math.PI) / 180) * (radius + 4);
          return (
            <line
              key={t}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="rgba(234,242,247,0.25)"
              strokeWidth="1"
            />
          );
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-mono font-medium" style={{ color }}>
          {score !== undefined ? Math.round(displayScore) : '--'}
        </span>
        <span className="text-[9px] tracking-[0.2em] text-muted uppercase mt-1">
          {verdict ?? (score !== undefined ? riskVerdictFromScore(score) : 'Pending')}
        </span>
      </div>
    </div>
  );
}

function RiskBar({ label, value, max = 100 }: { label: string; value?: number; max?: number }) {
  const v = value ?? 0;
  const pct = Math.min(Math.max(v, 0), max) / max;
  const color = v <= 50 ? '#36E0A0' : v <= 75 ? '#FFB547' : '#FF5C70';
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] tracking-wider text-muted uppercase">{label}</span>
        <span className="text-[10px] font-mono" style={{ color }}>
          {value !== undefined ? value : '--'}
        </span>
      </div>
      <div className="h-1 rounded-full bg-white/5 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: color, boxShadow: `0 0 6px ${color}` }}
          initial={{ width: 0 }}
          animate={{ width: `${pct * 100}%` }}
          transition={{ duration: 0.6 }}
        />
      </div>
    </div>
  );
}

export function RiskPanel({ risk, failed }: RiskPanelProps) {
  const [showWhy, setShowWhy] = useState(false);
  const verdict = risk?.verdict ?? (risk?.score !== undefined ? riskVerdictFromScore(risk.score) : undefined);
  const color = verdict ? VERDICT_COLOR[verdict] : '#7F929F';

  return (
    <GlassPanel className="w-full overflow-hidden" glow={failed ? 'critical' : 'none'}>
      <PanelHeader
        title="Risk Engine"
        subtitle="Deterministic Risk Assessment"
        accent={color}
        right={
          risk?.score !== undefined ? (
            <span className="text-[10px] font-mono" style={{ color }}>
              {verdict}
            </span>
          ) : undefined
        }
      />
      <div className="p-4">
        {!risk || risk.score === undefined ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <ShieldAlert className="w-6 h-6 text-muted/40 mb-2" strokeWidth={1.25} />
            <p className="text-xs text-muted/60 font-mono">No risk data yet</p>
            <p className="text-[10px] text-muted/40 mt-1">Risk evaluated after execution</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <RadialGauge score={risk.score} verdict={verdict} />

            <div className="w-full grid grid-cols-2 gap-3">
              <RiskBar label="Budget" value={risk.budgetRisk} />
              <RiskBar label="Frequency" value={risk.frequencyRisk} />
              <RiskBar label="Injection" value={risk.injectionRisk} />
              <RiskBar label="Parameter" value={risk.parameterRisk} />
            </div>

            <button
              onClick={() => setShowWhy((s) => !s)}
              className="flex items-center gap-1.5 text-[10px] tracking-[0.2em] uppercase text-muted hover:text-primary transition-colors"
            >
              <HelpCircle className="w-3 h-3" />
              Why?
              <ChevronDown className={`w-3 h-3 transition-transform ${showWhy ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {showWhy && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="w-full overflow-hidden"
                >
                  <div className="w-full text-[11px] font-mono text-muted/80 leading-relaxed bg-bg/40 border border-white/5 rounded-lg p-3 space-y-1">
                    {risk.reasons && risk.reasons.length > 0 ? (
                      risk.reasons.map((r, i) => (
                        <div key={i} className="flex gap-2">
                          <span style={{ color }}>›</span>
                          <span>{r}</span>
                        </div>
                      ))
                    ) : (
                      <p>
                        Score {risk.score} → {verdict}. Thresholds: 0–50 ALLOW, 51–75 ESCALATE,
                        76–100 DENY.
                      </p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </GlassPanel>
  );
}
