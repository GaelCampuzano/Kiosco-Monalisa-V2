/**
 * Componente AdminStats
 * Visualiza métricas clave (KPIs) del restaurante: Total de propinas, Porcentaje Promedio y Mesero Top.
 * Incluye animaciones fluidas para la transición de valores numéricos.
 */

'use client';
import { useEffect } from 'react';
import { Calendar, TrendingUp, Users } from 'lucide-react';
import { motion, useSpring, useTransform } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';

interface AdminStatsProps {
  /** Objeto que contiene las estadísticas agregadas calculadas por el servidor. */
  stats: {
    totalTips: number;
    avgPercentage: number;
    topWaiter: string;
  };
}

/**
 * Componente interno para animar la transición de un número de forma suave (Spring animation).
 */
function MotionNumber({ value, suffix = '' }: { value: number; suffix?: string }) {
  // Configuración de la física de la animación (masa, rigidez, amortiguación)
  const spring = useSpring(0, { mass: 0.8, stiffness: 75, damping: 15 });

  // Transforma el valor crudo en un string redondeado con sufijo (ej: "23%")
  const display = useTransform(spring, (current) => Math.round(current) + suffix);

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  return <motion.span>{display}</motion.span>;
}

export function AdminStats({ stats }: AdminStatsProps) {
  /** Variantes para la animación de entrada de las tarjetas estadísticas. */
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6">
      {/* Tarjeta: Total de Propinas */}
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.1 }}
      >
        <Card className="hover:border-monalisa-gold/50 transition-colors bg-monalisa-navy/40 backdrop-blur-sm border-monalisa-gold/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-monalisa-silver/70">
              Total Propinas
            </CardTitle>
            <Calendar className="h-4 w-4 text-monalisa-gold/50" />
          </CardHeader>
          <CardContent className="pt-0 sm:pt-6">
            <div className="text-xl sm:text-2xl font-bold text-white">
              <MotionNumber value={stats.totalTips} />
            </div>
            <p className="text-[10px] sm:text-xs text-monalisa-silver/40">Registros totales</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tarjeta: Porcentaje Promedio */}
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.2 }}
      >
        <Card className="hover:border-monalisa-gold/50 transition-colors bg-monalisa-navy/40 backdrop-blur-sm border-monalisa-gold/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-monalisa-silver/70">
              Promedio
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-monalisa-gold/50" />
          </CardHeader>
          <CardContent className="pt-0 sm:pt-6">
            <div className="text-xl sm:text-2xl font-bold text-monalisa-gold">
              <MotionNumber value={stats.avgPercentage} suffix="%" />
            </div>
            <p className="text-[10px] sm:text-xs text-monalisa-silver/40">
              Porcentaje promedio del mes
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tarjeta: Mesero Estrella (Top Waiter) */}
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.3 }}
        className="sm:col-span-2 md:col-span-1"
      >
        <Card className="hover:border-monalisa-gold/50 transition-colors bg-monalisa-navy/40 backdrop-blur-sm h-full border-monalisa-gold/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-monalisa-silver/70">
              Mesero Estrella
            </CardTitle>
            <Users className="h-4 w-4 text-monalisa-gold/50" />
          </CardHeader>
          <CardContent className="pt-0 sm:pt-6">
            <div className="text-lg sm:text-2xl font-bold truncate text-white uppercase tracking-tight">
              {stats.topWaiter || '-'}
            </div>
            <p className="text-[10px] sm:text-xs text-monalisa-silver/40">Colaborador más activo</p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
