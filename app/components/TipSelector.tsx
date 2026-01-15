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
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      className="w-full text-center relative flex flex-col items-center"
    >
      {isCustomMode ? (
        // CUSTOM INPUT MODE
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-[#162B46]/80 backdrop-blur-xl p-8 rounded-3xl border border-white/10 shadow-2xl"
        >
          <div className="flex justify-start mb-6">
            <button
              onClick={() => setIsCustomMode(false)}
              className="text-monalisa-silver hover:text-white flex items-center gap-2 text-sm uppercase tracking-widest font-bold"
            >
              <ArrowLeft className="w-4 h-4" /> Volver
            </button>
          </div>

          <h2 className="text-2xl font-serif text-white mb-6">{text.customTip}</h2>

          <form onSubmit={handleCustomSubmit} className="space-y-6">
            <div className="relative">
              <input
                type="number"
                autoFocus
                value={customValue}
                onChange={(e) => setCustomValue(e.target.value)}
                placeholder="0"
                min="0"
                max="100"
                className="w-full bg-monalisa-navy/50 border border-monalisa-gold/30 rounded-xl py-6 text-center text-4xl sm:text-5xl font-serif text-white focus:ring-2 focus:ring-monalisa-gold focus:outline-none placeholder:text-gray-600 outline-none transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <span className="absolute right-8 top-1/2 -translate-y-1/2 text-monalisa-gold/50 text-2xl font-serif">
                %
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[10, 15, 18, 20, 25, 30].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setCustomValue(val.toString())}
                  className="py-3 bg-white/5 hover:bg-white/10 rounded-lg text-monalisa-silver font-medium transition-colors"
                >
                  {val}%
                </button>
              ))}
            </div>

            <button
              type="submit"
              disabled={!customValue}
              className="w-full bg-monalisa-gold text-monalisa-navy font-bold py-4 rounded-xl uppercase tracking-widest hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Check className="w-5 h-5" />
              {text.confirm}
            </button>
          </form>
        </motion.div>
      ) : (
        // STANDARD SELECTION MODE
        <>
          <div className="flex flex-col items-center mb-10 sm:mb-14 px-4 text-center mt-24 sm:mt-32 md:mt-32">
            <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)] mb-4 leading-tight mx-auto max-w-4xl">
              {text.clientTitle}
            </h2>
            <div className="inline-flex items-center gap-3 bg-[#162B46]/60 backdrop-blur-md px-6 py-2 rounded-full border border-white/10 shadow-lg">
              <span className="text-monalisa-gold text-sm sm:text-base font-light tracking-widest uppercase">
                {text.selectTip}
              </span>
              <span className="font-serif italic text-lg sm:text-xl text-white font-medium">
                {waiterName}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:gap-6 md:gap-8 max-w-4xl mx-auto w-full px-6">
            {percentages.map((pct) => (
              <motion.button
                key={pct}
                onClick={() => handleSelect(pct as TipPercentage)}
                disabled={selectedPct !== null}
                whileTap={{ scale: 0.98 }}
                whileHover={{ scale: selectedPct === null ? 1.03 : 1 }}
                className={`group relative flex flex-col items-center justify-center py-8 sm:py-12 md:py-14 rounded-2xl border transition-all duration-300 shadow-xl
                                    ${
                                      selectedPct === pct
                                        ? 'bg-monalisa-gold border-monalisa-gold scale-105 z-10'
                                        : selectedPct !== null
                                          ? 'bg-[#162B46]/40 border-white/5 opacity-40 grayscale'
                                          : 'bg-[#162B46]/70 border-white/10 hover:bg-[#162B46]/90 hover:border-monalisa-gold/50 backdrop-blur-md'
                                    }
                                `}
              >
                {selectedPct === pct ? (
                  <Loader2 className="w-10 h-10 text-monalisa-navy animate-spin" />
                ) : (
                  <>
                    <span
                      className={`font-serif text-6xl sm:text-7xl md:text-8xl transition-colors duration-300 drop-shadow-lg
                                            ${selectedPct === pct ? 'text-monalisa-navy' : 'text-white group-hover:text-monalisa-gold'}
                                        `}
                    >
                      {pct}
                      <span className="text-3xl sm:text-4xl align-top opacity-60 ml-1">%</span>
                    </span>
                  </>
                )}
              </motion.button>
            ))}

            {/* CUSTOM BUTTON */}
            <motion.button
              onClick={() => setIsCustomMode(true)}
              disabled={selectedPct !== null}
              whileTap={{ scale: 0.98 }}
              whileHover={{ scale: 1.03 }}
              className={`group relative flex flex-col items-center justify-center py-8 sm:py-12 md:py-14 rounded-2xl border transition-all duration-300 shadow-xl
                                ${
                                  selectedPct !== null
                                    ? 'bg-[#162B46]/40 border-white/5 opacity-40 grayscale'
                                    : 'bg-[#162B46]/70 border-white/10 hover:bg-[#162B46]/90 hover:border-monalisa-gold/50 backdrop-blur-md'
                                }
                            `}
            >
              <div className="bg-white/5 p-4 rounded-full mb-3 group-hover:bg-monalisa-gold/10 transition-colors">
                <PenLine className="w-8 h-8 sm:w-10 sm:h-10 text-monalisa-silver/70 group-hover:text-monalisa-gold transition-colors" />
              </div>
              <span className="text-white/90 group-hover:text-white font-serif text-xl sm:text-2xl transition-colors tracking-wide">
                {text.customTip}
              </span>
            </motion.button>
          </div>

          {/* DISCLAIMER IMPROVED */}
          <div className="mt-10 sm:mt-16 max-w-3xl px-6 relative z-10 pb-8">
            <div className="bg-black/40 backdrop-blur-md border border-white/5 px-6 py-4 rounded-xl text-center shadow-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="h-[1px] w-8 bg-monalisa-gold/50"></span>
                <span className="text-monalisa-gold text-[10px] uppercase tracking-[0.2em] font-bold">
                  {text.disclaimerTitle}
                </span>
                <span className="h-[1px] w-8 bg-monalisa-gold/50"></span>
              </div>
              <p className="text-white/90 text-xs sm:text-sm font-light leading-relaxed tracking-wide">
                {text.disclaimer}
              </p>
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
}
