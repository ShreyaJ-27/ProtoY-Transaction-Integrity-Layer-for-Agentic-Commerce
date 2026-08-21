import { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check, ExternalLink, Lock, Coins, ArrowRight } from 'lucide-react';
import { GlassPanel, PanelHeader } from './GlassPanel';
import type { PaymentInfo, SettlementInfo } from '@/lib/normalize';

interface SettlementPanelProps {
  payment?: PaymentInfo;
  settlement?: SettlementInfo;
  success?: boolean;
  failed?: boolean;
}

const PAYMENT_STAGES = [
  'HTTP 402',
  'PAYMENT REQUIRED',
  'PAYMENT SIGNED',
  'FACILITATOR',
  'ALGORAND TESTNET',
  'SETTLEMENT',
  'CONFIRMED',
];

function CopyableField({ label, value }: { label: string; value?: string }) {
  const [copied, setCopied] = useState(false);
  if (!value) return null;
  const copy = () => {
    navigator.clipboard?.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div className="flex items-center justify-between gap-2 bg-bg/40 border border-white/5 rounded-md px-2.5 py-2">
      <div className="min-w-0">
        <div className="text-[9px] tracking-[0.15em] text-muted uppercase">{label}</div>
        <div className="text-[11px] font-mono text-ink truncate">{value}</div>
      </div>
      <button
        onClick={copy}
        className="flex-shrink-0 text-muted hover:text-primary transition-colors"
        title="Copy"
      >
        {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
      </button>
    </div>
  );
}

export function SettlementPanel({ payment, settlement, success, failed }: SettlementPanelProps) {
  const txId = settlement?.transactionId ?? payment?.transactionId;
  const confirmed = settlement?.confirmed ?? success;

  return (
    <GlassPanel className="w-full overflow-hidden" glow={success ? 'success' : failed ? 'critical' : 'none'}>
      <PanelHeader
        title="x402 Payment & Settlement"
        subtitle="Algorand TestNet Settlement"
        accent={success ? '#36E0A0' : failed ? '#FF5C70' : '#FFB547'}
        right={
          confirmed ? (
            <span className="text-[10px] font-mono text-success">✓ SETTLED</span>
          ) : failed ? (
            <span className="text-[10px] font-mono text-critical">FAILED</span>
          ) : undefined
        }
      />
      <div className="p-4">
        {!payment && !settlement ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Lock className="w-6 h-6 text-muted/40 mb-2" strokeWidth={1.25} />
            <p className="text-xs text-muted/60 font-mono">No settlement data yet</p>
            <p className="text-[10px] text-muted/40 mt-1">Payment settles after execution</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Payment stages visualization */}
            <div className="flex items-center justify-between gap-1">
              {PAYMENT_STAGES.map((s, i) => {
                const reached =
                  confirmed ||
                  (i <= 3 && payment) ||
                  (i <= 5 && settlement?.network) ||
                  (i <= 4 && payment?.facilitator);
                const isFinal = i === PAYMENT_STAGES.length - 1;
                const active = reached && (confirmed || i < PAYMENT_STAGES.length - 1);
                const color = failed && i >= 4 ? '#FF5C70' : isFinal && confirmed ? '#36E0A0' : '#65E6FF';
                return (
                  <div key={s} className="flex items-center flex-1 last:flex-none">
                    <div className="flex flex-col items-center gap-1">
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0.5 }}
                        animate={{ scale: reached ? 1 : 0.8, opacity: reached ? 1 : 0.3 }}
                        className="w-2 h-2 rounded-full"
                        style={{
                          background: reached ? color : 'transparent',
                          border: `1px solid ${reached ? color : '#2A3640'}`,
                          boxShadow: reached ? `0 0 8px ${color}` : 'none',
                        }}
                      />
                      <span
                        className="text-[7px] font-mono tracking-wider uppercase whitespace-nowrap"
                        style={{ color: reached ? color : '#2A3640', opacity: active ? 1 : 0.6 }}
                      >
                        {s}
                      </span>
                    </div>
                    {i < PAYMENT_STAGES.length - 1 && (
                      <div
                        className="h-px flex-1 mx-1"
                        style={{ background: reached ? `${color}40` : '#2A3640' }}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Payment details */}
            {payment && (
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2 bg-bg/40 border border-white/5 rounded-md px-2.5 py-2">
                  <Coins className="w-3.5 h-3.5 text-warning" />
                  <div>
                    <div className="text-[9px] tracking-[0.15em] text-muted uppercase">Amount</div>
                    <div className="text-[11px] font-mono text-ink">
                      {payment.amount ?? '—'} {payment.asset ?? ''}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-bg/40 border border-white/5 rounded-md px-2.5 py-2">
                  <ArrowRight className="w-3.5 h-3.5 text-primary" />
                  <div className="min-w-0">
                    <div className="text-[9px] tracking-[0.15em] text-muted uppercase">Receiver</div>
                    <div className="text-[11px] font-mono text-ink truncate">
                      {payment.receiver ?? '—'}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Transaction ID - copyable */}
            {txId && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] tracking-[0.2em] uppercase text-muted">Transaction ID</span>
                  {settlement?.explorerUrl && (
                    <a
                      href={settlement.explorerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-[10px] text-primary hover:text-primary/80 transition-colors"
                    >
                      Explorer <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
                <CopyableField label="TX HASH" value={txId} />
                {settlement?.round !== undefined && (
                  <div className="mt-2 flex items-center gap-2 text-[10px] font-mono text-muted">
                    <span className="text-muted/60">Round:</span>
                    <span className="text-ink">{settlement.round}</span>
                    <span className="text-muted/60 ml-2">Network:</span>
                    <span className="text-ink">{settlement.network ?? 'Algorand TestNet'}</span>
                  </div>
                )}
              </div>
            )}

            {confirmed && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center justify-center gap-2 py-2 border border-success/20 bg-success/5 rounded-lg"
              >
                <Check className="w-4 h-4 text-success" />
                <span className="text-sm font-medium tracking-[0.2em] text-success uppercase">
                  Algorand TestNet · Settled
                </span>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </GlassPanel>
  );
}
