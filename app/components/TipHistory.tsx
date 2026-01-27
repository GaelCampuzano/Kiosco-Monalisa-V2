'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, History, Clock, User, Hash } from 'lucide-react';
import { TipRecord } from '@/types';
import { TranslationType } from '@/lib/translations';

interface TipHistoryProps {
  isOpen: boolean;
  onClose: () => void;
  history: TipRecord[];
  text: TranslationType;
}

export function TipHistory({ isOpen, onClose, history, text }: TipHistoryProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-[#0A1628] border-l border-white/10 z-[101] shadow-2xl flex flex-col"
          >
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <History className="w-5 h-5 text-monalisa-gold" />
                <h2 className="text-lg font-serif text-white tracking-wide uppercase">
                  {text.recentTips}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/5 rounded-full transition-colors text-monalisa-silver"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {history.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-monalisa-silver/40 gap-4">
                  <History className="w-12 h-12 opacity-20" />
                  <p className="font-light italic">{text.noRecentTips}</p>
                </div>
              ) : (
                history.map((tip, index) => (
                  <motion.div
                    key={tip.idempotencyKey || index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white/5 border border-white/5 rounded-2xl p-4 hover:border-monalisa-gold/30 transition-all group"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2 px-3 py-1 bg-monalisa-gold/10 rounded-full border border-monalisa-gold/20">
                        <span className="text-monalisa-gold font-serif text-xl">
                          {tip.tipPercentage}%
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-monalisa-silver/40 text-[10px] uppercase font-bold">
                        <Clock className="w-3 h-3" />
                        {new Date(tip.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-monalisa-silver/30 text-[9px] uppercase tracking-wider font-bold">
                          <User className="w-3 h-3" />
                          {text.waiter}
                        </div>
                        <p className="text-white text-sm font-serif truncate">{tip.waiterName}</p>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-monalisa-silver/30 text-[9px] uppercase tracking-wider font-bold">
                          <Hash className="w-3 h-3" />
                          {text.table}
                        </div>
                        <p className="text-white text-sm font-serif">{tip.tableNumber}</p>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
