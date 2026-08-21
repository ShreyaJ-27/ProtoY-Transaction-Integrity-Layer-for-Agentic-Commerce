import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import type { UseTransaction } from '@/hooks/useTransaction';

interface StatusOverlayProps {
  tx: UseTransaction;
}

export function StatusOverlay({ tx }: StatusOverlayProps) {
  const show = tx.appState === 'SUCCESS' || tx.appState === 'FAILED' || tx.appState === 'PAYMENT_REQUIRED';

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.4 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none"
        >
          {tx.appState === 'SUCCESS' ? (
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="flex flex-col items-center gap-2"
            >
              <div className="relative">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                  className="w-16 h-16 rounded-full border-2 border-success/40 bg-success/10 flex items-center justify-center"
                >
                  <CheckCircle2 className="w-8 h-8 text-success" strokeWidth={1.5} />
                </motion.div>
                <motion.div
                  initial={{ scale: 1, opacity: 0.5 }}
                  animate={{ scale: 1.8, opacity: 0 }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="absolute inset-0 rounded-full border border-success/30"
                />
              </div>
              <div className="text-center">
                <p className="text-lg font-medium tracking-[0.25em] text-success uppercase">
                  Transaction Complete
                </p>
                <p className="text-[11px] font-mono text-muted mt-1">
                  Integrity verified · Settled on Algorand TestNet
                </p>
              </div>
            </motion.div>
          ) : tx.appState === 'PAYMENT_REQUIRED' ? (
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="flex flex-col items-center gap-2"
            >
              <div className="w-16 h-16 rounded-full border-2 border-warning/40 bg-warning/10 flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-warning" strokeWidth={1.5} />
              </div>
              <div className="text-center max-w-md">
                <p className="text-lg font-medium tracking-[0.25em] text-warning uppercase">
                  Payment Required
                </p>
                <p className="text-[11px] font-mono text-muted mt-1 break-words">
                  {tx.error ?? 'Proto-Y requires payment authorization before execution.'}
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="flex flex-col items-center gap-2"
            >
              <div className="w-16 h-16 rounded-full border-2 border-critical/40 bg-critical/10 flex items-center justify-center">
                <XCircle className="w-8 h-8 text-critical" strokeWidth={1.5} />
              </div>
              <div className="text-center max-w-md">
                <p className="text-lg font-medium tracking-[0.25em] text-critical uppercase">
                  Transaction Failed
                </p>
                <p className="text-[11px] font-mono text-muted mt-1 break-words">
                  {tx.error ?? 'The transaction could not be completed.'}
                </p>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export { AlertTriangle };
