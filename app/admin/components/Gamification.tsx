'use client';
import { useState, useEffect } from 'react';
import { Trophy, Flame, Quote, Sparkles, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { getWaiterMotivations, getSmartRanking } from '@/app/actions/ai-analyst';

interface SmartRankingItem {
  rank: string;
  name: string;
  reason: string;
}

export function Gamification() {
  const [motivations, setMotivations] = useState<Record<string, string>>({});
  const [ranking, setRanking] = useState<SmartRankingItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [m, r] = await Promise.all([getWaiterMotivations(), getSmartRanking()]);
        setMotivations(m);
        setRanking(r);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 text-monalisa-gold animate-spin" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
      {/* Ranking Inteligente */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-monalisa-navy/40 border-2 border-monalisa-gold/20 rounded-2xl p-6 backdrop-blur-sm"
      >
        <h3 className="text-monalisa-gold font-bold flex items-center gap-2 mb-6 text-lg">
          <Trophy className="h-5 w-5" />
          Ranking Inteligente
        </h3>
        <div className="space-y-4">
          {ranking.map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/5 hover:border-monalisa-gold/30 transition-colors"
            >
              <div className="text-2xl">
                {item.rank === 'Oro' ? '🥇' : item.rank === 'Plata' ? '🥈' : '🥉'}
              </div>
              <div className="flex-1">
                <p className="text-white font-bold">{item.name}</p>
                <p className="text-xs text-monalisa-silver/60">{item.reason}</p>
              </div>
              <div className="text-monalisa-gold/40">
                <Sparkles className="h-4 w-4" />
              </div>
            </div>
          ))}
          {ranking.length === 0 && (
            <p className="text-center text-monalisa-silver/40 py-4">
              No hay datos suficientes para el ranking.
            </p>
          )}
        </div>
      </motion.div>

      {/* Mensajes Motivacionales */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-monalisa-navy/40 border-2 border-monalisa-gold/20 rounded-2xl p-6 backdrop-blur-sm"
      >
        <h3 className="text-monalisa-gold font-bold flex items-center gap-2 mb-6 text-lg">
          <Flame className="h-5 w-5" />
          Motivación del Día
        </h3>
        <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-monalisa-gold/20">
          {Object.entries(motivations).map(([name, message], i) => (
            <div
              key={i}
              className="relative bg-white/5 p-4 rounded-xl border-l-4 border-monalisa-gold"
            >
              <Quote className="absolute -top-2 -left-2 h-4 w-4 text-monalisa-gold opacity-30" />
              <p className="text-xs font-bold text-monalisa-gold mb-1">{name}</p>
              <p className="text-sm text-monalisa-silver italic leading-tight">
                &quot;{message}&quot;
              </p>
            </div>
          ))}
          {Object.keys(motivations).length === 0 && (
            <p className="text-center text-monalisa-silver/40 py-4">
              Agregando meseros para motivar...
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
