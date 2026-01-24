'use client';
import { useState } from 'react';
import Image from 'next/image';

interface Particle {
  id: number;
  left: string;
  duration: string;
  delay: string;
  size: string;
}

export function Background() {
  const [imageError, setImageError] = useState(false);
  const [particles] = useState<Particle[]>(() => {
    return Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      duration: `${10 + Math.random() * 20}s`,
      delay: `${Math.random() * 10}s`,
      size: `${Math.random() * 4 + 1}px`,
    }));
  });

  return (
    <div className="absolute inset-0 w-full h-full -z-20 overflow-hidden">
      {/* Fallback de fondo siempre presente */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#162B46] via-[#1a3450] to-[#162B46]" />

      {/* Imagen estática para optimización de recursos */}
      {!imageError && (
        <div className="absolute inset-0 w-full h-full">
          <Image
            src="/bkg.jpg"
            alt="Fondo Sunset Monalisa"
            fill
            priority
            className="object-cover"
            onError={() => setImageError(true)}
            onLoad={() => setImageError(false)}
          />
        </div>
      )}

      {/* Partículas de oro flotantes */}
      <div className="absolute inset-0 pointer-events-none">
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute bottom-0 rounded-full bg-monalisa-gold/30 blur-[1px] animate-float-particle"
            style={
              {
                left: p.left,
                width: p.size,
                height: p.size,
                '--duration': p.duration,
                '--delay': p.delay,
              } as React.CSSProperties
            }
          />
        ))}
      </div>

      {/* Overlays decorativos para mejorar legibilidad */}
      <div className="absolute inset-0 bg-[#162B46]/60 mix-blend-multiply" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#162B46] via-transparent to-[#162B46]/30" />
    </div>
  );
}
