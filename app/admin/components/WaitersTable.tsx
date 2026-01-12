"use client";

import { useState, useEffect } from "react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/app/components/ui/card";
import { Loader2, Plus, Power, RefreshCw, User } from "lucide-react";
import { getAllWaiters, createWaiter, toggleWaiterStatus } from "@/app/actions/waiters";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface Waiter {
    id: number;
    name: string;
    active: boolean;
}

export function WaitersTable() {
    const [waiters, setWaiters] = useState<Waiter[]>([]);
    const [loading, setLoading] = useState(true);
    const [newName, setNewName] = useState("");
    const [isCreating, setIsCreating] = useState(false);

    const loadWaiters = async () => {
        setLoading(true);
        try {
            const data = await getAllWaiters();
            setWaiters(data);
        } catch (error) {
            toast.error("Error al cargar meseros");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadWaiters();
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newName.trim()) return;

        setIsCreating(true);
        try {
            const result = await createWaiter(newName);
            if (result.success && result.waiter) {
                toast.success("Mesero agregado correctamente");
                setNewName("");
                loadWaiters(); // Recargar lista
            } else {
                toast.error(result.error || "Error al crear");
            }
        } catch (error) {
            toast.error("Error inesperado");
        } finally {
            setIsCreating(false);
        }
    };

    const handleToggle = async (id: number, currentStatus: boolean, name: string) => {
        try {
            // Optimistic update
            setWaiters(prev => prev.map(w => w.id === id ? { ...w, active: !currentStatus } : w));

            const result = await toggleWaiterStatus(id, currentStatus);
            if (!result.success) {
                // Revert if failed
                setWaiters(prev => prev.map(w => w.id === id ? { ...w, active: currentStatus } : w));
                toast.error(result.error);
            } else {
                toast.success(`Estado de ${name} actualizado`);
            }
        } catch (error) {
            toast.error("Error de conexión");
        }
    };

    return (
        <Card className="border-monalisa-gold/20 bg-monalisa-navy/40 backdrop-blur-md">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="text-xl text-monalisa-gold">Gestión de Meseros</CardTitle>
                    <CardDescription className="text-monalisa-silver/70">
                        Administra quién aparece en la lista de selección del kiosco.
                    </CardDescription>
                </div>
                <Button variant="ghost" size="icon" onClick={loadWaiters} className="text-monalisa-gold hover:text-white">
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </Button>
            </CardHeader>
            <CardContent className="space-y-6">

                {/* Formulario de Crear */}
                <form onSubmit={handleCreate} className="flex gap-4">
                    <div className="relative flex-1">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-monalisa-silver/50" />
                        <Input
                            placeholder="Nombre del nuevo mesero"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            className="bg-monalisa-navy/60 border-monalisa-silver/20 pl-10 text-white placeholder:text-gray-500 focus-visible:ring-monalisa-gold"
                        />
                    </div>
                    <Button
                        type="submit"
                        disabled={!newName.trim() || isCreating}
                        className="bg-monalisa-gold text-monalisa-navy hover:bg-monalisa-gold/90"
                    >
                        {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                        Agregar
                    </Button>
                </form>

                {/* Tabla */}
                <div className="rounded-md border border-monalisa-silver/10 overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-monalisa-navy/80">
                            <tr className="border-b border-monalisa-silver/10">
                                <th className="p-4 text-monalisa-gold font-semibold text-sm">Nombre</th>
                                <th className="p-4 text-monalisa-gold font-semibold w-[150px] text-center text-sm">Estado</th>
                                <th className="p-4 text-right text-monalisa-gold font-semibold w-[100px] text-sm">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-monalisa-silver/5">
                            <AnimatePresence>
                                {waiters.map((waiter) => (
                                    <motion.tr
                                        key={waiter.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="hover:bg-monalisa-silver/5 transition-colors group"
                                    >
                                        <td className="p-4 font-medium text-white">{waiter.name}</td>
                                        <td className="p-4 text-center">
                                            <span
                                                className={`
                                                    inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-all border
                                                    ${waiter.active
                                                        ? 'bg-green-500/10 text-green-400 border-green-500/20'
                                                        : 'bg-red-500/10 text-red-400 border-red-500/20'
                                                    }
                                                `}
                                            >
                                                {waiter.active ? 'ACTIVO' : 'INACTIVO'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleToggle(waiter.id, waiter.active, waiter.name)}
                                                className={`
                                                    ${waiter.active ? 'text-red-400 hover:text-red-300' : 'text-green-400 hover:text-green-300'}
                                                `}
                                                title={waiter.active ? "Desactivar" : "Activar"}
                                            >
                                                <Power className="w-4 h-4" />
                                            </Button>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                            {!loading && waiters.length === 0 && (
                                <tr>
                                    <td colSpan={3} className="p-8 text-center text-monalisa-silver/50">
                                        No hay meseros registrados.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    );
}
