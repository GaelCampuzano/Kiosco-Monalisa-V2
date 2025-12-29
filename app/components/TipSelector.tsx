import { motion } from "framer-motion";
import { useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { TipPercentage } from "@/types";
import { translations, TranslationType } from "@/lib/translations";

interface TipSelectorProps {
    waiterName: string;
    onTipSelect: (percentage: TipPercentage) => void;
    onBack?: () => void;
    text: TranslationType;
}

export function TipSelector({ waiterName, onTipSelect, onBack, text }: TipSelectorProps) {
    const [selectedPct, setSelectedPct] = useState<TipPercentage | null>(null);

    const handleSelect = (pct: TipPercentage) => {
        if (selectedPct !== null) return; // Prevenir doble click
        setSelectedPct(pct);
        onTipSelect(pct);
    };

    return (
        <motion.div
            key="client"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="w-full text-center relative"
        >
            {/* BACK BUTTON */}
            {onBack && (
                <motion.button
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={onBack}
                    className="absolute top-16 left-4 sm:top-20 sm:left-8 p-0 text-monalisa-silver hover:text-white transition-colors flex items-center gap-2 group z-50 md:fixed md:top-28 md:left-8"
                >
                    <div className="bg-white/5 p-2 rounded-full group-hover:bg-white/10 transition-colors backdrop-blur-sm shadow-lg border border-white/5">
                        <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest hidden sm:inline-block opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-2 group-hover:translate-x-0 bg-black/40 px-3 py-1 rounded-sm backdrop-blur-md border border-white/5">
                        Volver
                    </span>
                </motion.button>
            )}

            <div className="inline-block bg-[#162B46]/30 backdrop-blur-sm px-6 sm:px-10 py-4 sm:py-6 rounded-3xl mb-8 sm:mb-12 border border-white/5 max-w-[90%] mt-16 sm:mt-10 md:mt-0">
                <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white drop-shadow-md mb-3 leading-tight">
                    {text.clientTitle}
                </h2>
                <p className="text-monalisa-gold text-base sm:text-lg md:text-xl font-light tracking-wide">
                    {text.selectTip} <span className="font-serif italic font-medium text-white border-b border-monalisa-gold/50 px-2">{waiterName}</span>
                </p>
            </div>

            {/* MEJORA RESPONSIVA: grid-cols-1 en móvil, grid-cols-3 en md (horizontal) */}
            <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-3 md:gap-8 lg:gap-12 px-4 max-w-6xl mx-auto w-full">
                {[20, 23, 25].map((pct) => (
                    <motion.button
                        key={pct}
                        onClick={() => handleSelect(pct as TipPercentage)}
                        disabled={selectedPct !== null}
                        whileTap={{ scale: 0.95 }}
                        whileHover={{ scale: selectedPct === null ? 1.05 : 1 }}
                        className={`group relative flex flex-col items-center justify-center py-10 sm:py-12 md:py-16 lg:py-24 rounded-sm border transition-all duration-500 cursor-pointer min-h-[140px] sm:min-h-[160px]
                            ${selectedPct === pct
                                ? 'bg-monalisa-gold border-monalisa-gold scale-105 shadow-[0_0_30px_rgba(223,200,148,0.4)] z-10'
                                : selectedPct !== null
                                    ? 'bg-[#162B46]/40 border-white/5 opacity-50 grayscale'
                                    : 'bg-[#162B46]/60 border-white/10 hover:border-monalisa-gold backdrop-blur-md hover:shadow-[0_15px_40px_rgba(0,0,0,0.4)]'
                            }
                        `}
                    >
                        {selectedPct === pct ? (
                            <div className="flex flex-col items-center animate-in fade-in duration-300">
                                <Loader2 className="w-12 h-12 sm:w-16 sm:h-16 text-monalisa-navy animate-spin mb-2" />
                                <span className="text-monalisa-navy font-bold uppercase tracking-widest text-xs">Procesando...</span>
                            </div>
                        ) : (
                            <>
                                <div className="absolute inset-0 bg-gradient-to-b from-monalisa-gold/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                <span className={`font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl transition-colors duration-300 drop-shadow-lg
                                    ${selectedPct === pct ? 'text-monalisa-navy' : 'text-white group-hover:text-monalisa-gold'}
                                `}>
                                    {pct}<span className="text-3xl sm:text-4xl align-top opacity-60">%</span>
                                </span>

                                <div className={`flex items-center gap-2 mt-3 sm:mt-4 text-[10px] sm:text-xs font-bold uppercase tracking-[0.25em] transition-colors drop-shadow-md
                                    ${selectedPct === pct ? 'text-monalisa-navy' : 'text-monalisa-bronze group-hover:text-monalisa-gold'}
                                `}>
                                    <div className="h-[1px] w-4 sm:w-6 bg-current opacity-60" />
                                    {text.tipLabel}
                                    <div className="h-[1px] w-4 sm:w-6 bg-current opacity-60" />
                                </div>
                            </>
                        )}
                    </motion.button>
                ))}
            </div>
        </motion.div>
    );
}
