// app/components/LanguageToggle.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { Language } from '@/lib/translations';

interface LanguageToggleProps {
  lang: Language;
  setLang: (lang: Language) => void;
}

export function LanguageToggle({ lang, setLang }: LanguageToggleProps) {
  return (
    <div className="absolute top-4 left-4 sm:top-8 sm:left-8 z-30 flex gap-1 sm:gap-2 p-1 bg-black/20 backdrop-blur-md rounded-full border border-white/5">
      {["es", "en"].map((l) => (
        <button
          key={l}
          onClick={() => setLang(l as Language)}
          className="relative px-3 sm:px-4 py-1 sm:py-1.5 text-[10px] sm:text-xs font-bold tracking-[0.2em] uppercase transition-colors z-10"
        >
          {lang === l && (
            <motion.div
              layoutId="active-lang"
              className="absolute inset-0 bg-monalisa-gold rounded-full -z-10 shadow-[0_0_15px_rgba(223,200,148,0.3)]"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          )}
          <span className={`relative transition-colors duration-200 ${lang === l ? 'text-monalisa-navy' : 'text-white/60 hover:text-white'}`}>
            {l}
          </span>
        </button>
      ))}
    </div>
  );
}