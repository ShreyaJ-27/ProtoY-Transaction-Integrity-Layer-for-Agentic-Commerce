import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TopBar } from '@/components/ui/TopBar';
import { NavRail } from '@/components/ui/NavRail';
import { ExecutionPanel } from '@/components/ui/ExecutionPanel';
import { Timeline } from '@/components/ui/Timeline';
import { RiskPanel } from '@/components/ui/RiskPanel';
import { ProviderPanel } from '@/components/ui/ProviderPanel';
import { SettlementPanel } from '@/components/ui/SettlementPanel';
import { OutcomePanel } from '@/components/ui/OutcomePanel';
import { MemoryPanel } from '@/components/ui/MemoryPanel';
import { MetricsBar } from '@/components/ui/MetricsBar';
import { SystemPanel } from '@/components/ui/SystemPanel';
import { StatusOverlay } from '@/components/ui/StatusOverlay';
import { TransactionScene } from '@/components/three/TransactionScene';
import { useTransaction } from '@/hooks/useTransaction';
import { NAV_ITEMS, PIPELINE, type NavSection } from '@/lib/constants';

export function ControlRoom() {
  const tx = useTransaction();
  const [section, setSection] = useState<NavSection>('control');
  const [hoveredStage, setHoveredStage] = useState<import('@/lib/constants').StageId | null>(null);
  const pulseRef = useRef(0);
  const [pulseTrigger, setPulseTrigger] = useState(0);

  // Trigger a core pulse on success.
  useEffect(() => {
    if (tx.appState === 'SUCCESS') {
      pulseRef.current += 1;
      setPulseTrigger(pulseRef.current);
    }
  }, [tx.appState]);

  const doneStages = tx.timeline.filter((e) => e.status === 'done').map((e) => e.stage);
  const failed = tx.appState === 'FAILED' || tx.appState === 'PAYMENT_REQUIRED';
  const success = tx.appState === 'SUCCESS';

  const handleExecute = (goal: string, budget: string) => {
    tx.run(goal, budget);
  };

  // Determine which panels to show in the right column based on nav section.
  const rightPanels = (() => {
    switch (section) {
      case 'control':
        return (
          <>
            <Timeline
              events={tx.timeline}
              activeStage={tx.activeStage}
              failed={failed}
              success={success}
            />
          </>
        );
      case 'execute':
        return (
          <Timeline
            events={tx.timeline}
            activeStage={tx.activeStage}
            failed={failed}
            success={success}
          />
        );
      case 'risk':
        return <RiskPanel risk={tx.result?.risk} failed={failed} />;
      case 'providers':
        return <ProviderPanel providers={tx.result?.providers} selected={tx.result?.selectedProvider} />;
      case 'settlement':
        return (
          <SettlementPanel
            payment={tx.result?.payment}
            settlement={tx.result?.settlement}
            success={success}
            failed={failed}
          />
        );
      case 'outcomes':
        return <OutcomePanel outcome={tx.result?.outcome} success={success} />;
      case 'memory':
        return <MemoryPanel memory={tx.result?.memory} />;
      case 'system':
        return <SystemPanel lastError={tx.error} lastSuccess={tx.result?.success ?? null} />;
      default:
        return null;
    }
  })();

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-bg text-ink">
      <TopBar />

      <div className="flex flex-1 min-h-0">
        {/* Left nav rail */}
        <NavRail active={section} onSelect={setSection} />

        {/* Center: 3D scene + floating execution panel */}
        <main className="relative flex-1 min-w-0 overflow-hidden">
          {/* Tech grid overlay */}
          <div className="absolute inset-0 tech-grid pointer-events-none opacity-40" />

          {/* 3D Scene */}
          <TransactionScene
            appState={tx.appState}
            activeStage={tx.activeStage}
            doneStages={doneStages}
            failed={failed}
            success={success}
            pulseTrigger={pulseTrigger}
            hoveredStage={hoveredStage}
            onHoverNode={setHoveredStage}
            autoPlay={false}
          />

          {/* Status overlay */}
          <StatusOverlay tx={tx} />

          {/* Floating execution panel - top left of center */}
          <div className="absolute top-4 left-4 w-[340px] max-w-[calc(100%-2rem)] z-10">
            <ExecutionPanel
              onExecute={handleExecute}
              isRunning={tx.isRunning}
              isPaused={tx.isPaused}
              appState={tx.appState}
              onReset={tx.reset}
            />
          </div>

          {/* Pipeline label - bottom center */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
            <div className="glass rounded-full px-4 py-1.5 flex items-center gap-2">
              <span className="text-[9px] tracking-[0.2em] text-muted uppercase">Pipeline</span>
              <div className="flex items-center gap-1">
                {PIPELINE.map((s, i) => (
                  <span key={s.id} className="flex items-center gap-1">
                    <span
                      className="text-[9px] font-mono tracking-wider"
                      style={{
                        color:
                          tx.activeStage === s.id
                            ? s.color
                            : doneStages.includes(s.id)
                              ? '#36E0A0'
                              : failed && tx.activeStage === s.id
                                ? '#FF5C70'
                                : '#3A4651',
                      }}
                    >
                      {s.short}
                    </span>
                    {i < PIPELINE.length - 1 && (
                      <span className="text-[8px] text-muted/30">↓</span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Section label - top right of center */}
          <div className="absolute top-4 right-4 z-10 pointer-events-none">
            <div className="glass rounded-lg px-3 py-1.5">
              <span className="text-[10px] tracking-[0.25em] text-muted uppercase font-mono">
                {NAV_ITEMS.find((n) => n.id === section)?.label}
              </span>
            </div>
          </div>
        </main>

        {/* Right: information panels */}
        <aside className="w-[340px] xl:w-[380px] flex-shrink-0 border-l border-white/5 bg-bg/40 backdrop-blur-sm overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={section}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.25 }}
              className="p-3 min-h-full"
            >
              {rightPanels}
            </motion.div>
          </AnimatePresence>
        </aside>
      </div>

      {/* Bottom metrics bar */}
      <MetricsBar tx={tx} />
    </div>
  );
}
