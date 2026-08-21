import {
  Gauge,
  Play,
  ShieldAlert,
  Server,
  Lock,
  CheckCircle2,
  Brain,
  Settings,
} from 'lucide-react';
import { NAV_ITEMS, type NavSection } from '@/lib/constants';

const ICONS: Record<NavSection, typeof Gauge> = {
  control: Gauge,
  execute: Play,
  risk: ShieldAlert,
  providers: Server,
  settlement: Lock,
  outcomes: CheckCircle2,
  memory: Brain,
  system: Settings,
};

interface NavRailProps {
  active: NavSection;
  onSelect: (id: NavSection) => void;
}

export function NavRail({ active, onSelect }: NavRailProps) {
  return (
    <nav className="relative z-20 flex md:flex-col items-center gap-1 md:gap-2 md:w-16 lg:w-[68px] md:h-full border-b md:border-b-0 md:border-r border-white/5 bg-bg/40 backdrop-blur-md py-2 md:py-4 px-2 md:px-0 overflow-x-auto no-scrollbar">
      {/* Logo mark on desktop */}
      <div className="hidden md:flex items-center justify-center mb-4">
        <div className="relative w-8 h-8 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border border-primary/30" />
          <div className="absolute inset-1.5 rounded-full border border-primary/15" />
          <div className="w-2.5 h-2.5 rounded-full bg-primary shadow-[0_0_12px_#65E6FF]" />
        </div>
      </div>

      {NAV_ITEMS.map((item) => {
        const Icon = ICONS[item.id];
        const isActive = active === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onSelect(item.id)}
            className={`group relative flex flex-col md:flex-col items-center justify-center gap-1 md:w-12 lg:w-14 h-10 md:h-14 rounded-lg transition-all duration-200 ${
              isActive
                ? 'bg-primary/10 text-primary'
                : 'text-muted hover:text-ink hover:bg-white/5'
            }`}
            title={item.label}
          >
            {isActive && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-6 bg-primary rounded-full shadow-[0_0_8px_#65E6FF]" />
            )}
            <Icon className="w-4 h-4 md:w-[18px] md:h-[18px]" strokeWidth={1.25} />
            <span className="hidden md:block text-[8px] tracking-[0.1em] font-mono">{item.label}</span>
          </button>
        );
      })}

      <div className="hidden md:block mt-auto" />
    </nav>
  );
}
