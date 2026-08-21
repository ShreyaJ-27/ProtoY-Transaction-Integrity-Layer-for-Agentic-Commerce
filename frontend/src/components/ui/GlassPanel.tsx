import type { ReactNode } from 'react';

interface GlassPanelProps {
  children: ReactNode;
  className?: string;
  strong?: boolean;
  glow?: 'primary' | 'success' | 'critical' | 'none';
}

export function GlassPanel({ children, className = '', strong = false, glow = 'none' }: GlassPanelProps) {
  const glowClass =
    glow === 'primary'
      ? 'glow-primary'
      : glow === 'success'
        ? 'glow-success'
        : glow === 'critical'
          ? 'glow-critical'
          : '';
  return (
    <div className={`${strong ? 'glass-strong' : 'glass'} ${glowClass} rounded-xl ${className}`}>
      {children}
    </div>
  );
}

interface PanelHeaderProps {
  title: string;
  subtitle?: string;
  right?: ReactNode;
  accent?: string;
}

export function PanelHeader({ title, subtitle, right, accent = '#65E6FF' }: PanelHeaderProps) {
  return (
    <div className="flex items-start justify-between px-4 pt-3 pb-2 border-b border-white/5">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span
            className="inline-block w-1.5 h-1.5 rounded-full"
            style={{ background: accent, boxShadow: `0 0 8px ${accent}` }}
          />
          <h3 className="text-[11px] font-medium tracking-[0.22em] text-ink/90 uppercase truncate">
            {title}
          </h3>
        </div>
        {subtitle && (
          <p className="text-[10px] text-muted mt-1 tracking-wider font-mono truncate">{subtitle}</p>
        )}
      </div>
      {right}
    </div>
  );
}
