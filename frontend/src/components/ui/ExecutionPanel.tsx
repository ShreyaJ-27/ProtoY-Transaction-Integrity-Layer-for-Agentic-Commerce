import { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Loader2, Target, Coins, CheckCircle2, RotateCcw } from 'lucide-react';
import { GlassPanel, PanelHeader } from './GlassPanel';

interface ExecutionPanelProps {
  onExecute: (goal: string, budget: string) => void;
  isRunning: boolean;
  isPaused: boolean;
  appState: string;
  onReset: () => void;
}

const EXAMPLE_GOALS = [
  'Find the latest blockchain research',
  'Fetch top AI agent frameworks',
  'Summarize Algorand DeFi protocols',
  'Get current ETH gas price analysis',
];

const DEFAULT_BUDGET = '50000';

export function ExecutionPanel({
  onExecute,
  isRunning,
  isPaused,
  appState,
  onReset,
}: ExecutionPanelProps) {
  const [goal, setGoal] = useState('');
  const [budget, setBudget] = useState(DEFAULT_BUDGET);

  const canExecute = goal.trim().length > 0 && !isRunning;
  const isComplete = appState === 'SUCCESS';
  const isFailed = appState === 'FAILED';
  const isPaymentRequired = appState === 'PAYMENT_REQUIRED';

  return (
    <GlassPanel strong className="w-full overflow-hidden" glow={isRunning && !isPaused ? 'primary' : 'none'}>
      <PanelHeader
        title="What should the agent do?"
        subtitle="LIVE BACKEND · x402 + ALGORAND TESTNET"
        accent="#65E6FF"
        right={
          <span className="text-[9px] font-mono text-success/80 tracking-wider border border-success/20 rounded px-1.5 py-0.5">
            LIVE
          </span>
        }
      />
      <div className="p-4 space-y-4">
        {/* Goal */}
        <div>
          <label className="flex items-center gap-1.5 text-[10px] tracking-[0.2em] text-muted uppercase mb-2">
            <Target className="w-3 h-3" /> Goal
          </label>
          <input
            type="text"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && canExecute) onExecute(goal, budget);
            }}
            placeholder="e.g. Find the latest blockchain research"
            className="w-full bg-bg/60 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-ink placeholder:text-muted/50 font-sans transition-all"
          />
          <div className="flex flex-wrap gap-1.5 mt-2">
            {EXAMPLE_GOALS.map((g) => (
              <button
                key={g}
                onClick={() => setGoal(g)}
                className="text-[10px] px-2 py-1 rounded-md bg-white/5 text-muted hover:text-primary hover:bg-primary/10 border border-white/5 transition-colors"
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* Budget */}
        <div>
          <label className="flex items-center gap-1.5 text-[10px] tracking-[0.2em] text-muted uppercase mb-2">
            <Coins className="w-3 h-3" /> Budget
          </label>
          <div className="flex items-stretch gap-2">
            <div className="relative flex-1">
              <input
                type="number"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full bg-bg/60 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-ink font-mono transition-all pr-16"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-muted tracking-wider">
                microUSDC
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <input
              type="range"
              min="1000"
              max="200000"
              step="1000"
              value={Math.min(Number(budget) || 0, 200000)}
              onChange={(e) => setBudget(e.target.value)}
              className="flex-1"
            />
            <span className="text-[10px] font-mono text-muted w-16 text-right">
              {Number(budget).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Execute button */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          disabled={!canExecute}
          onClick={() => onExecute(goal, budget)}
          className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg font-medium text-sm tracking-[0.18em] uppercase transition-all ${
            isComplete
              ? 'bg-success/15 text-success border border-success/40'
              : canExecute
                ? 'bg-primary/15 text-primary border border-primary/40 hover:bg-primary/25 shadow-[0_0_20px_rgba(101,230,255,0.15)]'
                : 'bg-white/5 text-muted/50 border border-white/5 cursor-not-allowed'
          }`}
        >
          {isComplete ? (
            <>
              <CheckCircle2 className="w-4 h-4" />
              Transaction Verified
            </>
          ) : isPaymentRequired ? (
            <>Payment Required</>
          ) : isFailed ? (
            <>Transaction Failed</>
          ) : isRunning ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {isPaused ? 'Paused' : 'Executing Through Proto-Y'}
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              Execute Through Proto-Y
            </>
          )}
        </motion.button>

        {/* Cancel the in-flight backend request. */}
        {isRunning && (
          <div className="flex items-center gap-2">
            <button
              onClick={onReset}
              className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-[10px] tracking-[0.15em] uppercase bg-white/5 text-muted hover:text-critical hover:bg-critical/10 border border-white/5 transition-colors"
            >
              <RotateCcw className="w-3 h-3" /> Restart
            </button>
          </div>
        )}

        <p className="text-[9px] text-muted/60 font-mono leading-relaxed text-center">
          Execution is authorized by the Proto-Y backend before any x402 settlement.
        </p>
      </div>
    </GlassPanel>
  );
}
