'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Search, User } from 'lucide-react'; // Removed Plus
import { Waiter } from '@/app/actions/waiters'; // Removed createWaiter

interface WaiterAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  waiters: Waiter[];
  isLoading?: boolean;
  onValidityChange?: (isValid: boolean) => void;
  placeholder?: string;
  className?: string;
}

export function WaiterAutocomplete({
  value,
  onChange,
  waiters,
  isLoading = false,
  onValidityChange,
  placeholder,
}: WaiterAutocompleteProps) {
  const [query, setQuery] = useState(value);
  const [isOpen, setIsOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Ya no cargamos meseros internamente, los recibimos de useKioskData
  // vía props desde page.tsx para asegurar soporte offline.

  // Actualizar query si el valor externo cambia
  useEffect(() => {
    setQuery(value);
  }, [value]);

  const exactMatch = waiters.some((w) => w.name.toLowerCase() === query.toLowerCase());

  // Notificar validez al padre
  useEffect(() => {
    onValidityChange?.(exactMatch);
  }, [exactMatch, onValidityChange]);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [value]);

  const filteredWaiters =
    query === ''
      ? waiters
      : waiters.filter((person) => person.name.toLowerCase().includes(query.toLowerCase()));

  const handleSelect = (name: string) => {
    setQuery(name);
    onChange(name);
    setIsOpen(false);
  };

  return (
    <div className="relative group" ref={containerRef}>
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30">
          <Search size={18} />
        </div>

        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            // Si el usuario borra todo, limpiamos la selección
            if (e.target.value === '') onChange('');
          }}
          onFocus={() => setIsOpen(true)}
          className="w-full bg-black/20 border border-white/10 focus:border-monalisa-gold rounded-sm text-white text-lg sm:text-xl py-2.5 sm:py-3 pl-12 pr-4 outline-none transition-all font-serif placeholder:text-white/10 text-center"
          placeholder={placeholder || 'Buscar mesero...'}
        />
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 w-full mt-2 bg-[#0F1E32] border border-white/10 rounded-sm shadow-2xl max-h-60 overflow-y-auto overflow-x-hidden custom-scrollbar"
          >
            {isLoading ? (
              <div className="p-4 text-center text-white/40 text-sm animate-pulse">
                Cargando lista...
              </div>
            ) : (
              <ul>
                {filteredWaiters.map((waiter) => (
                  <li key={waiter.id}>
                    <button
                      type="button"
                      onClick={() => handleSelect(waiter.name)}
                      className="w-full text-left px-4 py-3 text-white/80 hover:bg-monalisa-gold/20 hover:text-white transition-colors flex items-center justify-between group/item"
                    >
                      <span className="flex items-center gap-3">
                        <User
                          size={16}
                          className="text-monalisa-gold/50 group-hover/item:text-monalisa-gold"
                        />
                        {waiter.name}
                      </span>
                      {value === waiter.name && <Check size={16} className="text-monalisa-gold" />}
                    </button>
                  </li>
                ))}

                {filteredWaiters.length === 0 && (
                  <li className="p-4 text-center text-red-400 text-xs italic">
                    No se encontró mesero.
                  </li>
                )}
              </ul>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
