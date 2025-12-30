import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { TranslationType } from "@/lib/translations";

interface ThankYouScreenProps {
    text: TranslationType;
}

export function ThankYouScreen({ text }: ThankYouScreenProps) {
    return (
        <motion.div
            key="thanks"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center bg-[#162B46]/40 backdrop-blur-md p-6 sm:p-8 md:p-12 rounded-sm border border-white/5 shadow-2xl max-w-[95%] sm:max-w-none relative overflow-hidden"
        >
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="mb-6 sm:mb-8 relative"
            >
                <div className="relative inline-block">
                    <Star className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 mx-auto text-monalisa-gold fill-monalisa-gold/20 animate-pulse drop-shadow-[0_0_30px_rgba(223,200,148,0.6)]" />

                    {/* Progress Circle acting as a timer */}
                    <svg className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 -rotate-90 pointer-events-none">
                        <motion.circle
                            cx="50%"
                            cy="50%"
                            r="48%"
                            className="stroke-monalisa-gold/30"
                            strokeWidth="2"
                            fill="none"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 5, ease: "linear" }}
                        />
                    </svg>
                </div>
            </motion.div>

            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-7xl text-white mb-4 sm:mb-6 drop-shadow-xl leading-tight px-2">
                {text.thanks}
            </h1>
            <p className="text-monalisa-silver text-base sm:text-lg md:text-xl font-light tracking-wide px-2 mb-4">
                {text.bye}
            </p>

            <p className="text-[10px] text-monalisa-silver/30 uppercase tracking-widest animate-pulse">
                Reiniciando...
            </p>
        </motion.div>
    );
}
