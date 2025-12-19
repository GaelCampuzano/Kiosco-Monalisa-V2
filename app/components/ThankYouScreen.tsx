import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { translations, TranslationType } from "@/lib/translations";

interface ThankYouScreenProps {
    text: TranslationType;
}

export function ThankYouScreen({ text }: ThankYouScreenProps) {
    return (
        <motion.div
            key="thanks"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center bg-[#162B46]/40 backdrop-blur-md p-6 sm:p-8 md:p-12 rounded-sm border border-white/5 shadow-2xl max-w-[95%] sm:max-w-none"
        >
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="mb-6 sm:mb-8 relative"
            >
                <Star className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 mx-auto text-monalisa-gold fill-monalisa-gold/20 animate-pulse drop-shadow-[0_0_30px_rgba(223,200,148,0.6)]" />
            </motion.div>

            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-7xl text-white mb-4 sm:mb-6 drop-shadow-xl leading-tight px-2">
                {text.thanks}
            </h1>
            <p className="text-monalisa-silver text-base sm:text-lg md:text-xl font-light tracking-wide px-2">
                {text.bye}
            </p>
        </motion.div>
    );
}
