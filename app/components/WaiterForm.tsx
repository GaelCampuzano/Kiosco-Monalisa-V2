/**
 * Componente WaiterForm
 * Primer paso del Kiosco: Configuración de la mesa y el mesero.
 * Incluye validación de número de mesa (solo numérico) y autocompletado de meseros.
 */

'use client';
import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { TranslationType } from '@/lib/translations';
import { WaiterAutocomplete } from './WaiterAutocomplete';
import { Waiter } from '@/app/actions/waiters';

interface WaiterFormProps {
  /** Número de mesa actual. */
  tableNumber: string;
  /** Función para actualizar el número de mesa. */
  setTableNumber: (value: string) => void;
  /** Nombre del mesero seleccionado. */
  waiterName: string;
  /** Función para actualizar el nombre del mesero. */
  setWaiterName: (value: string) => void;
  /** Función para avanzar al siguiente paso del Kiosco. */
  onSubmit: () => void;
  /** Traducciones activas. */
  text: TranslationType;
  /** Lista de meseros para el autocompletado. */
  waiters: Waiter[];
  /** Estado de carga de los datos iniciales. */
  isDataLoading?: boolean;
}

export function WaiterForm({
  tableNumber,
  setTableNumber,
  waiterName,
  setWaiterName,
  onSubmit,
  text,
  waiters,
  isDataLoading,
}: WaiterFormProps) {
  const [logoError, setLogoError] = useState(false);
  const [isWaiterValid, setIsWaiterValid] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  /**
   * Efecto de auto-enfoque al montar el componente.
   * Se añade un pequeño retraso para asegurar que la animación de entrada haya comenzado.
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  /**
   * Maneja el envío del formulario validando que todos los campos sean correctos.
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (waiterName && tableNumber && isWaiterValid) {
      onSubmit();
    }
  };

  return (
    <motion.div
      key="waiter"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-md glass-card p-6 sm:p-8 md:p-12 rounded-2xl relative landscape:p-4 landscape:sm:p-8"
    >
      <div className="text-center mb-6 sm:mb-8">
        {/* LOGO CON EFECTO SPOTLIGHT (LUZ RADIAL) */}
        <div className="relative w-full h-24 sm:h-32 landscape:h-16 landscape:sm:h-32 mx-auto mb-4 sm:mb-6 landscape:mb-2 flex items-center justify-center">
          {/* Capa de luz de fondo difusa */}
          <div className="absolute inset-0 bg-[radial-gradient(closest-side,rgba(223,200,148,0.2)_20%,transparent_100%)] blur-2xl" />

          {/* Logo principal */}
          <div className="relative w-48 h-20 sm:w-64 sm:h-28 transition-transform duration-700 hover:scale-105">
            {!logoError ? (
              <Image
                src="/logo-monalisa.svg"
                alt="Logo Sunset Monalisa"
                fill
                className="object-contain"
                onError={() => setLogoError(true)}
                onLoad={() => setLogoError(false)}
              />
            ) : null}
            {logoError && (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-monalisa-gold text-xl sm:text-2xl font-serif">
                  Sunset Monalisa
                </span>
              </div>
            )}
          </div>
        </div>

        <h1 className="font-serif text-2xl sm:text-3xl landscape:text-xl text-white tracking-widest drop-shadow-sm border-t border-white/10 pt-4 sm:pt-6 landscape:pt-2 uppercase">
          {text.waiterTitle}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
        {/* Campo: Número de Mesa */}
        <div className="group">
          <label className="block text-[10px] font-bold text-monalisa-gold/60 uppercase tracking-[0.3em] mb-3 ml-1">
            {text.table}
          </label>
          <div className="relative overflow-hidden rounded-full">
            <input
              type="text"
              required
              value={tableNumber}
              maxLength={3}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9]/g, '');
                if (value.length <= 3) {
                  setTableNumber(value);
                }
              }}
              ref={inputRef}
              className="w-full bg-white/5 border border-white/10 focus:border-monalisa-gold/50 rounded-full text-white text-2xl sm:text-3xl py-3 sm:py-4 px-4 outline-none transition-all font-serif placeholder:text-white/10 text-center focus:bg-white/10 focus:ring-1 focus:ring-monalisa-gold/20"
              placeholder="00"
            />
          </div>
        </div>

        {/* Campo: Selección de Mesero (Autocomplete) */}
        <div className="group relative">
          <label className="block text-[10px] font-bold text-monalisa-gold/60 uppercase tracking-[0.3em] mb-3 ml-1">
            {text.waiter}
          </label>
          <WaiterAutocomplete
            value={waiterName}
            onChange={setWaiterName}
            waiters={waiters}
            isLoading={isDataLoading}
            onValidityChange={setIsWaiterValid}
            placeholder={text.waiterPlaceholder}
          />
        </div>

        {/* Botón de envío con animaciones de éxito */}
        <motion.button
          type="submit"
          disabled={!waiterName || !tableNumber || !isWaiterValid}
          whileTap={{ scale: 0.97 }}
          whileHover={{ scale: 1.02 }}
          className={`w-full mt-4 sm:mt-6 landscape:mt-2 py-4 sm:py-5 landscape:py-3 px-6 rounded-full font-bold tracking-[0.25em] uppercase text-[10px] transition-all duration-500 shadow-2xl relative overflow-hidden group ${
            !waiterName || !tableNumber || !isWaiterValid
              ? 'bg-white/5 text-white/20 border border-white/5 cursor-not-allowed'
              : 'bg-monalisa-bronze text-white hover:bg-monalisa-gold hover:text-monalisa-navy border border-monalisa-gold/30'
          }`}
        >
          <span className="relative z-10">{text.btnDeliver}</span>

          {/* Capa de brillo hover */}
          <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-500" />

          {/* Efecto de Brillo animado (solo si es válido e ingresar datos) */}
          {waiterName && tableNumber && isWaiterValid && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-20"
              animate={{ x: ['-200%', '200%'] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', repeatDelay: 0.5 }}
            />
          )}
        </motion.button>
      </form>
    </motion.div>
  );
}
