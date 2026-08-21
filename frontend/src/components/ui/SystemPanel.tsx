import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Wifi, Database, Server, Cpu, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { GlassPanel, PanelHeader } from './GlassPanel';
import { apiBaseUrl, getHealth, getInfo, hasApiBase } from '@/lib/api';

interface SystemPanelProps {
  lastError: string | null;
  lastSuccess: boolean | null;
}

export function SystemPanel({ lastError, lastSuccess }: SystemPanelProps) {
  const [health, setHealth] = useState<Record<string, unknown> | null>(null);
  const [info, setInfo] = useState<Record<string, unknown> | null>(null);
  const [healthError, setHealthError] = useState<string | null>(null);

  useEffect(() => {
    if (!hasApiBase()) return;
    let cancelled = false;
    Promise.all([getHealth().catch((e) => e), getInfo().catch((e) => e)]).then(([h, i]) => {
      if (cancelled) return;
      if (h instanceof Error) setHealthError(h.message);
      else setHealth(h as Record<string, unknown>);
      if (i instanceof Error) setHealthError((p) => `${p ?? ''} ${i.message}`.trim());
      else setInfo(i as Record<string, unknown>);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const healthOk = health && (health.status === 'ok' || health.status === 'healthy');

  return (
    <GlassPanel className="w-full overflow-hidden">
      <PanelHeader title="System" subtitle="Backend · Health · Configuration" accent="#7F929F" />
      <div className="p-4 space-y-3">
        {/* Connection */}
        <div className="flex items-center justify-between bg-bg/40 border border-white/5 rounded-lg px-3 py-2.5">
          <div className="flex items-center gap-2">
            <Wifi className="w-3.5 h-3.5 text-muted" />
            <span className="text-[11px] text-muted uppercase tracking-wider">API Base</span>
          </div>
          <span className="text-[11px] font-mono text-ink truncate max-w-[180px]">
            {apiBaseUrl() || 'not configured'}
          </span>
        </div>

        {/* Health */}
        <div className="flex items-center justify-between bg-bg/40 border border-white/5 rounded-lg px-3 py-2.5">
          <div className="flex items-center gap-2">
            {healthOk ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-success" />
            ) : healthError ? (
              <AlertTriangle className="w-3.5 h-3.5 text-critical" />
            ) : (
              <div className="w-3.5 h-3.5 rounded-full border border-muted/30" />
            )}
            <span className="text-[11px] text-muted uppercase tracking-wider">Health</span>
          </div>
          <span
            className={`text-[11px] font-mono ${
              healthOk ? 'text-success' : healthError ? 'text-critical' : 'text-muted'
            }`}
          >
            {healthOk ? 'OK' : healthError ? 'UNREACHABLE' : hasApiBase() ? 'CHECKING' : 'N/A'}
          </span>
        </div>

        {/* Info / config dump */}
        {(info || health) && (
          <div className="bg-bg/40 border border-white/5 rounded-lg p-3">
            <div className="flex items-center gap-1.5 mb-2">
              <Terminal className="w-3 h-3 text-muted" />
              <span className="text-[9px] tracking-[0.2em] text-muted uppercase">Backend Response</span>
            </div>
            <pre className="text-[10px] font-mono text-muted/80 overflow-x-auto max-h-[160px] leading-relaxed">
              {JSON.stringify({ health, info }, null, 2)}
            </pre>
          </div>
        )}

        {healthError && (
          <div className="bg-critical/5 border border-critical/20 rounded-lg p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <AlertTriangle className="w-3 h-3 text-critical" />
              <span className="text-[9px] tracking-[0.2em] text-critical uppercase">Connection Error</span>
            </div>
            <p className="text-[10px] font-mono text-critical/80 break-words">{healthError}</p>
          </div>
        )}

        {/* Last transaction status */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-bg/40 border border-white/5 rounded-lg px-3 py-2.5">
            <div className="flex items-center gap-2 mb-1">
              <Database className="w-3 h-3 text-muted" />
              <span className="text-[9px] tracking-wider text-muted uppercase">Last Tx</span>
            </div>
            <span
              className={`text-[11px] font-mono ${
                lastSuccess === true ? 'text-success' : lastSuccess === false ? 'text-critical' : 'text-muted'
              }`}
            >
              {lastSuccess === true ? 'SUCCESS' : lastSuccess === false ? 'FAILED' : 'NONE'}
            </span>
          </div>
          <div className="bg-bg/40 border border-white/5 rounded-lg px-3 py-2.5">
            <div className="flex items-center gap-2 mb-1">
              <Server className="w-3 h-3 text-muted" />
              <span className="text-[9px] tracking-wider text-muted uppercase">Network</span>
            </div>
            <span className="text-[11px] font-mono text-ink">Algorand TestNet</span>
          </div>
        </div>

        {/* Stack */}
        <div className="flex flex-wrap gap-1.5">
          {['GROQ', 'x402', 'ALGORAND', 'RISK ENGINE', 'ECONOMICS'].map((s) => (
            <span
              key={s}
              className="text-[9px] font-mono tracking-wider px-2 py-1 rounded-md bg-white/5 text-muted border border-white/5"
            >
              {s}
            </span>
          ))}
        </div>

        {lastError && (
          <div className="bg-critical/5 border border-critical/20 rounded-lg p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <Cpu className="w-3 h-3 text-critical" />
              <span className="text-[9px] tracking-[0.2em] text-critical uppercase">Last Error</span>
            </div>
            <p className="text-[10px] font-mono text-critical/80 break-words">{lastError}</p>
          </div>
        )}
      </div>
    </GlassPanel>
  );
}

export { AnimatePresence, motion };
