import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { TranslationType } from '@/lib/translations';

interface ThankYouScreenProps {
  text: TranslationType;
  tipPercentage?: number | null;
}

export function ThankYouScreen({ text, tipPercentage }: ThankYouScreenProps) {
  return (
    <motion.div
      key="thanks"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-center bg-[#162B46]/40 backdrop-blur-md p-6 sm:p-8 md:p-12 rounded-[2rem] border border-white/5 shadow-2xl max-w-[95%] sm:max-w-none relative overflow-hidden"
    >
      {/* Círculos decorativos de fondo */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-monalisa-gold/5 rounded-full blur-3xl" />
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-monalisa-gold/5 rounded-full blur-3xl" />

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="mb-6 sm:mb-8 relative"
      >
        <div className="relative inline-block">
          <Star className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 mx-auto text-monalisa-gold fill-monalisa-gold/20 animate-pulse drop-shadow-[0_0_30px_rgba(223,200,148,0.6)]" />

          {/*Círculo de progreso actuando como temporizador */}
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
              transition={{ duration: 5, ease: 'linear' }}
            />
          </svg>
        </div>
      </motion.div>

      <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-7xl text-white mb-2 sm:mb-4 drop-shadow-xl leading-tight px-2">
        {text.thanks}
      </h1>

      {tipPercentage !== undefined && tipPercentage !== null && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-6"
        >
          <p className="text-monalisa-gold/60 text-[10px] uppercase tracking-[0.3em] font-bold mb-1">
            {text.selectedTip}
          </p>
          <div className="font-serif text-4xl sm:text-5xl text-monalisa-gold">{tipPercentage}%</div>
        </motion.div>
      )}

      <p className="text-monalisa-silver text-base sm:text-lg md:text-xl font-light tracking-wide px-2 mb-4">
        {text.bye}
      </p>

      <p className="text-[10px] text-monalisa-silver/30 uppercase tracking-widest animate-pulse">
        Reiniciando...
      </p>
    </motion.div>
  );
}
