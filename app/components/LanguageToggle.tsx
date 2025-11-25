// app/components/LanguageToggle.tsx
import React from 'react';

type Language = "es" | "en";

interface LanguageToggleProps {
  lang: Language;
  setLang: (lang: Language) => void;
}

export function LanguageToggle({ lang, setLang }: LanguageToggleProps) {
  return (
    <div className="absolute top-8 left-8 z-30 flex gap-4">
      {["es", "en"].map((l) => (
        <button 
          key={l}
          onClick={() => setLang(l as Language)} 
          className={`text-xs font-bold tracking-[0.2em] uppercase transition-all duration-300 ${
            lang === l 
              ? 'text-monalisa-gold border-b border-monalisa-gold pb-1' 
              : 'text-white/60 hover:text-white'
          }`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}