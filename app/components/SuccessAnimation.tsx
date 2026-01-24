'use client';
import { motion } from 'framer-motion';
import { useState } from 'react';

interface SuccessParticle {
  id: number;
  angle: number;
  distance: number;
  scale: number;
  duration: number;
}

export function SuccessAnimation() {
  const [particles] = useState<SuccessParticle[]>(() => {
    // Inicializador perezoso: solo se ejecuta una vez en el cliente
    return [...Array(20)].map((_, i) => ({
      id: i,
      angle: Math.random() * Math.PI * 2,
      distance: 200 + Math.random() * 400,
      scale: Math.random() * 2,
      duration: 1 + Math.random(),
    }));
  });

  if (!particles.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center overflow-hidden"
    >
      {/* Resplandor de fondo inmersivo */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: [0, 0.4, 0], scale: [0.5, 1.5, 2] }}
        transition={{ duration: 1.5, ease: 'easeOut' }}
        className="absolute inset-0 bg-[radial-gradient(circle,rgba(223,200,148,0.15)_0%,transparent_70%)]"
      />

      {/* Ondas de choque doradas */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          initial={{ scale: 0.5, opacity: 0.8 }}
          animate={{
            scale: [0.5, 3],
            opacity: [0.8, 0],
          }}
          transition={{
            duration: 2,
            delay: i * 0.3,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="absolute w-40 h-40 rounded-full border border-monalisa-gold/20"
          style={{
            background: 'radial-gradient(circle, rgba(223,200,148,0.05) 0%, transparent 80%)',
          }}
        />
      ))}

      {/* Explosión de luz central */}
      <motion.div
        initial={{ scale: 0, rotate: 0 }}
        animate={{
          scale: [0, 1.5, 1.2],
          rotate: [0, 90, 180],
          opacity: [0, 1, 0],
        }}
        transition={{ duration: 1, ease: 'easeOut' }}
        className="relative"
      >
        <div className="w-1 h-32 bg-gradient-to-t from-transparent via-monalisa-gold/40 to-transparent absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        <div className="w-32 h-1 bg-gradient-to-r from-transparent via-monalisa-gold/40 to-transparent absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
      </motion.div>

      {/* Partículas de polvo de oro */}
      {particles.map((p, i) => (
        <motion.div
          key={i}
          initial={{
            x: 0,
            y: 0,
            opacity: 1,
            scale: p.scale,
          }}
          animate={{
            x: Math.cos(p.angle) * p.distance,
            y: Math.sin(p.angle) * p.distance,
            opacity: 0,
            scale: 0,
          }}
          transition={{
            duration: p.duration,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="absolute w-1 h-1 rounded-full bg-monalisa-gold/80 blur-[0.5px]"
        />
      ))}
    </motion.div>
  );
}
