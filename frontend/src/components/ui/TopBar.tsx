import { Activity, Cpu, Radio, Eye } from 'lucide-react';

export function TopBar() {
  const now = new Date();
  const time = now.toISOString().slice(11, 19) + 'Z';
  return (
    <header className="relative z-20 flex items-center justify-between h-12 px-4 border-b border-white/5 bg-bg/60 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="relative w-6 h-6 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border border-primary/40" />
            <div className="absolute inset-1 rounded-full border border-primary/20" />
            <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_10px_#65E6FF]" />
          </div>
          <span className="font-mono text-sm font-semibold tracking-[0.3em] text-ink">PROTO-Y</span>
        </div>
        <span className="hidden md:inline text-[10px] tracking-[0.25em] text-muted uppercase border-l border-white/10 pl-3">
          Transaction Integrity Layer
        </span>
      </div>

      <div className="flex items-center gap-4 text-[10px] font-mono tracking-wider">
        <div className="hidden sm:flex items-center gap-1.5 text-warning">
          <span className="relative flex w-1.5 h-1.5">
            <span className="absolute inset-0 rounded-full bg-warning soft-blink" />
          </span>
          <span className="text-success/90">LIVE API</span>
        </div>
        <div className="hidden md:flex items-center gap-1.5 text-success/80">
          <Radio className="w-3 h-3" />
          <span>ALG TESTNET</span>
        </div>
        <div className="hidden md:flex items-center gap-1.5 text-warning/80">
          <span className="w-1.5 h-1.5 rounded-full bg-warning/60" />
          <span>x402 READY</span>
        </div>
        <div className="hidden lg:flex items-center gap-1.5 text-muted">
          <Cpu className="w-3 h-3" />
          <span>GROQ</span>
        </div>
        <div className="flex items-center gap-1.5 text-muted">
          <Activity className="w-3 h-3" />
          <span>{time}</span>
        </div>
        <div className="hidden lg:flex items-center gap-1.5 text-muted/70">
          <Eye className="w-3 h-3" />
          <span>FRONTEND VISUALIZATION</span>
        </div>
      </div>
    </header>
  );
}
