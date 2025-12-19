import { motion } from "framer-motion";
import { TipPercentage } from "@/types";
import { translations, TranslationType } from "@/lib/translations";

interface TipSelectorProps {
    waiterName: string;
    onTipSelect: (percentage: TipPercentage) => void;
    text: TranslationType;
}

export function TipSelector({ waiterName, onTipSelect, text }: TipSelectorProps) {
    return (
        <motion.div
            key="client"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="w-full text-center"
        >
            <div className="inline-block bg-[#162B46]/30 backdrop-blur-sm px-4 sm:px-6 md:px-8 py-3 sm:py-4 rounded-full mb-6 sm:mb-8 md:mb-10 border border-white/5 max-w-[95%] sm:max-w-none">
                <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-6xl text-white drop-shadow-md mb-2 leading-tight">
                    {text.clientTitle}
                </h2>
                <p className="text-monalisa-gold text-sm sm:text-base md:text-lg font-light tracking-wide px-2">
                    {text.selectTip} <span className="font-serif italic font-medium text-white border-b border-monalisa-gold/50 px-1 break-words">{waiterName}</span>
                </p>
            </div>

            {/* MEJORA RESPONSIVA: grid-cols-1 en móvil, grid-cols-3 en md (horizontal) */}
            <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-3 md:gap-10 px-2 sm:px-4 max-w-5xl mx-auto">
                {[20, 23, 25].map((pct) => (
                    <motion.button
                        key={pct}
                        onClick={() => onTipSelect(pct as TipPercentage)}
                        whileTap={{ scale: 0.95 }}
                        whileHover={{ scale: 1.05 }}
                        className="group relative flex flex-col items-center justify-center py-10 sm:py-12 md:py-16 lg:py-24 rounded-sm border border-white/10 hover:border-monalisa-gold bg-[#162B46]/60 backdrop-blur-md transition-all duration-500 hover:shadow-[0_15px_40px_rgba(0,0,0,0.4)] cursor-pointer min-h-[140px] sm:min-h-[160px]"
                    >
                        <div className="absolute inset-0 bg-gradient-to-b from-monalisa-gold/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        <span className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-white group-hover:text-monalisa-gold transition-colors duration-300 drop-shadow-lg">
                            {pct}<span className="text-3xl sm:text-4xl align-top opacity-60">%</span>
                        </span>

                        <div className="flex items-center gap-2 mt-3 sm:mt-4 text-[10px] sm:text-xs font-bold uppercase tracking-[0.25em] text-monalisa-bronze group-hover:text-monalisa-gold transition-colors drop-shadow-md">
                            <div className="h-[1px] w-4 sm:w-6 bg-current opacity-60" />
                            {text.tipLabel}
                            <div className="h-[1px] w-4 sm:w-6 bg-current opacity-60" />
                        </div>
                    </motion.button>
                ))}
            </div>
        </motion.div>
    );
}
