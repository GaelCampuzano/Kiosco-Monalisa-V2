'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Plus, Search, User } from 'lucide-react';
import { getActiveWaiters, createWaiter, Waiter } from '@/app/actions/waiters';
import { toast } from 'sonner';

interface WaiterAutocompleteProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string; // Para estilizado externo si es necesario
}

export function WaiterAutocomplete({ value, onChange, placeholder }: WaiterAutocompleteProps) {
    const [query, setQuery] = useState(value);
    const [waiters, setWaiters] = useState<Waiter[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);

    const containerRef = useRef<HTMLDivElement>(null);

    // Cargar meseros al montar
    useEffect(() => {
        let mounted = true;
        getActiveWaiters().then(data => {
            if (mounted) {
                setWaiters(data);
                setIsLoading(false);
            }
        });
        return () => { mounted = false; };
    }, []);

    // Actualizar query si el valor externo cambia (ej. reset del formulario)
    useEffect(() => {
        setQuery(value);
    }, [value]);

    // Cerrar dropdown al hacer click fuera
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                // Si el usuario escribió algo pero no seleccionó, revertimos al valor guardado o limpiamos si no es válido
                // Aquí decidimos: ¿permitimos texto libre? NO, queremos forzar selección o creación.
                // Pero por UX, si el texto coincide exactamente con uno existente, lo seleccionamos.
                // Por simplificación: al salir, si el query no es igual al value, reseteamos visualmente al value.
                // setQuery(value); // Comentado para permitir flujo más suave, se validará en submit del padre
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [value]);

    const filteredWaiters = query === ''
        ? waiters
        : waiters.filter((person) =>
            person.name.toLowerCase().includes(query.toLowerCase())
        );

    const handleSelect = (name: string) => {
        setQuery(name);
        onChange(name);
        setIsOpen(false);
    };

    const handleCreate = async () => {
        if (!query || query.length < 2) return;
        setIsCreating(true);

        // Optimista: Agregamos a la lista visualmente antes de confirmar
        // (Opcional, pero aquí esperaremos para asegurar id)

        const result = await createWaiter(query);

        setIsCreating(false);

        if (result.success && result.waiter) {
            toast.success(`Mesero "${result.waiter.name}" registrado correctamente.`);
            setWaiters(prev => [...prev, result.waiter!].sort((a, b) => a.name.localeCompare(b.name)));
            handleSelect(result.waiter.name);
        } else {
            toast.error(result.error || "Error al registrar mesero.");
        }
    };

    const exactMatch = waiters.some(w => w.name.toLowerCase() === query.toLowerCase());

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
                    placeholder={placeholder || "Buscar mesero..."}
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
                            <div className="p-4 text-center text-white/40 text-sm animate-pulse">Cargando lista...</div>
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
                                                <User size={16} className="text-monalisa-gold/50 group-hover/item:text-monalisa-gold" />
                                                {waiter.name}
                                            </span>
                                            {value === waiter.name && <Check size={16} className="text-monalisa-gold" />}
                                        </button>
                                    </li>
                                ))}

                                {/* Opción de Crear Nuevo si no existe exacto */}
                                {query.length >= 2 && !exactMatch && (
                                    <li className="border-t border-white/5 mx-2 my-1 pt-1">
                                        <button
                                            type="button"
                                            disabled={isCreating}
                                            onClick={handleCreate}
                                            className="w-full text-left px-2 py-3 text-monalisa-gold hover:bg-monalisa-gold/10 transition-colors flex items-center gap-2 rounded-sm"
                                        >
                                            <div className="bg-monalisa-gold/20 p-1 rounded-full">
                                                <Plus size={16} />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-sm">Registrar nuevo: "{query}"</span>
                                                <span className="text-[10px] text-white/50">Se guardará para el futuro</span>
                                            </div>
                                            {isCreating && <span className="ml-auto text-xs animate-pulse">Guardando...</span>}
                                        </button>
                                    </li>
                                )}

                                {filteredWaiters.length === 0 && query.length < 2 && (
                                    <li className="p-4 text-center text-white/30 text-xs italic">
                                        Escribe para buscar...
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
