'use client';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { ArrowLeft, Loader2, PenLine, Check } from 'lucide-react';
import { TipPercentage } from '@/types';
import { TranslationType } from '@/lib/translations';

interface TipSelectorProps {
  waiterName: string;
  onTipSelect: (percentage: TipPercentage) => void;
  text: TranslationType;
  percentages: number[];
}

export function TipSelector({ waiterName, onTipSelect, text, percentages }: TipSelectorProps) {
  const [selectedPct, setSelectedPct] = useState<TipPercentage | null>(null);
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customValue, setCustomValue] = useState('');

  const handleSelect = (pct: TipPercentage) => {
    if (selectedPct !== null) return; // Prevent double click
    setSelectedPct(pct);
    onTipSelect(pct);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(customValue);
    if (!isNaN(val) && val >= 0 && val <= 100) {
      handleSelect(val);
    }
  };

  return (
    <motion.div
      key="client"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="w-full text-center relative flex flex-col items-center"
    >
      {isCustomMode ? (
        // CUSTOM INPUT MODE
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md glass-card p-8 rounded-3xl relative"
        >
          <div className="flex justify-start mb-6">
            <button
              onClick={() => setIsCustomMode(false)}
              className="text-monalisa-silver/60 hover:text-monalisa-gold flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-bold transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> {text.back || 'Volver'}
            </button>
          </div>

          <h2 className="text-2xl font-serif text-white mb-8 tracking-wide uppercase">
            {text.customTip}
          </h2>

          <form onSubmit={handleCustomSubmit} className="space-y-8">
            <div className="relative group">
              <input
                type="number"
                autoFocus
                value={customValue}
                onChange={(e) => setCustomValue(e.target.value)}
                placeholder="0"
                min="0"
                max="100"
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-8 text-center text-5xl sm:text-6xl font-serif text-white focus:ring-2 focus:ring-monalisa-gold/30 focus:outline-none placeholder:text-white/5 outline-none transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none focus:bg-white/10"
              />
              <span className="absolute right-8 top-1/2 -translate-y-1/2 text-monalisa-gold/30 text-3xl font-serif">
                %
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[10, 15, 18, 20, 25, 30].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setCustomValue(val.toString())}
                  className="py-3 bg-white/5 hover:bg-monalisa-gold hover:text-monalisa-navy rounded-xl text-monalisa-silver font-medium transition-all text-sm border border-white/5"
                >
                  {val}%
                </button>
              ))}
            </div>

            <button
              type="submit"
              disabled={!customValue}
              className="w-full bg-monalisa-gold text-monalisa-navy font-bold py-5 rounded-2xl uppercase tracking-[0.2em] text-xs hover:bg-white transition-all disabled:opacity-20 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-xl"
            >
              <Check className="w-5 h-5" />
              {text.confirm}
            </button>
          </form>
        </motion.div>
      ) : (
        // STANDARD SELECTION MODE
        <>
          <div className="flex flex-col items-center mb-4 md:mb-6 px-4 text-center mt-2 md:mt-4">
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="font-serif text-xl md:text-3xl lg:text-4xl text-white drop-shadow-2xl mb-2 md:mb-4 leading-tight mx-auto max-w-4xl uppercase tracking-wider"
            >
              {text.clientTitle}
            </motion.h2>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="inline-flex items-center gap-4 bg-white/5 backdrop-blur-md px-6 py-2 rounded-full border border-white/10 shadow-2xl"
            >
              <span className="text-monalisa-gold text-[9px] font-bold tracking-[0.3em] uppercase opacity-80">
                {text.selectTip}
              </span>
              <div className="h-4 w-[1px] bg-white/10" />
              <span className="font-serif italic text-lg md:text-2xl text-white font-light">
                {waiterName}
              </span>
            </motion.div>
          </div>

          <div className="grid grid-cols-2 gap-3 md:gap-4 max-w-4xl mx-auto w-full px-6">
            {percentages.map((pct, index) => (
              <motion.button
                key={pct}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                onClick={() => handleSelect(pct as TipPercentage)}
                disabled={selectedPct !== null}
                whileTap={{ scale: 0.96 }}
                whileHover={{ scale: selectedPct === null ? 1.04 : 1 }}
                className={`group relative flex flex-col items-center justify-center py-4 md:py-8 lg:py-10 rounded-2xl md:rounded-3xl border transition-all duration-500 shadow-2xl overflow-hidden
                                    ${
                                      selectedPct === pct
                                        ? 'bg-monalisa-gold border-monalisa-gold scale-105 z-10 shadow-monalisa-gold/20'
                                        : selectedPct !== null
                                          ? 'bg-white/5 border-white/5 opacity-20 grayscale'
                                          : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-monalisa-gold/50 backdrop-blur-md'
                                    }
                                 `}
              >
                {/* Reflejo de cristal */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />

                {selectedPct === pct ? (
                  <Loader2 className="w-12 h-12 text-monalisa-navy animate-spin" />
                ) : (
                  <>
                    <span
                      className={`font-serif text-4xl md:text-6xl lg:text-7xl transition-all duration-500 drop-shadow-2xl
                                            ${selectedPct === pct ? 'text-monalisa-navy' : 'text-white group-hover:text-monalisa-gold group-hover:scale-110'}
                                        `}
                    >
                      {pct}
                      <span className="text-2xl md:text-3xl align-top opacity-40 ml-1">%</span>
                    </span>
                  </>
                )}
              </motion.button>
            ))}

            {/* CUSTOM BUTTON */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.4 + percentages.length * 0.1,
                duration: 0.6,
                ease: [0.22, 1, 0.36, 1],
              }}
              onClick={() => setIsCustomMode(true)}
              disabled={selectedPct !== null}
              whileTap={{ scale: 0.96 }}
              whileHover={{ scale: 1.04 }}
              className={`group relative flex flex-col items-center justify-center py-4 md:py-8 lg:py-10 rounded-2xl md:rounded-3xl border transition-all duration-500 shadow-2xl overflow-hidden
                                ${
                                  selectedPct !== null
                                    ? 'bg-white/5 border-white/5 opacity-20 grayscale'
                                    : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-monalisa-gold/50 backdrop-blur-md'
                                }
                            `}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
              <div className="bg-white/5 p-2 md:p-3 rounded-full mb-2 md:mb-3 group-hover:bg-monalisa-gold/10 transition-colors border border-white/10">
                <PenLine className="w-5 h-5 md:w-6 md:h-6 text-monalisa-silver/50 group-hover:text-monalisa-gold transition-all" />
              </div>
              <span className="text-white/80 group-hover:text-white font-serif text-base md:text-xl transition-all tracking-widest uppercase">
                {text.customTip}
              </span>
            </motion.button>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className="mt-4 md:mt-6 max-w-xl px-4 relative z-10 pb-6"
          >
            <div className="bg-black/20 backdrop-blur-sm border border-white/5 px-4 py-2 md:px-6 md:py-3 rounded-xl md:rounded-2xl text-center shadow-2xl">
              <div className="flex items-center justify-center gap-3 mb-1 md:mb-2">
                <span className="h-[1px] w-8 md:w-12 bg-monalisa-gold/30"></span>
                <span className="text-monalisa-gold text-[7px] md:text-[8px] uppercase tracking-[0.4em] font-bold opacity-70">
                  {text.disclaimerTitle}
                </span>
                <span className="h-[1px] w-8 md:w-12 bg-monalisa-gold/30"></span>
              </div>
              <p className="text-white/50 text-[8px] md:text-[9px] lg:text-[10px] font-light leading-relaxed tracking-wider italic">
                {text.disclaimer}
              </p>
            </div>
          </motion.div>
        </>
      )}
    </motion.div>
  );
}
