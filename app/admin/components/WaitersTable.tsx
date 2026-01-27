/**
 * Componente WaitersTable
 * Permite la gestión completa del staff de meseros: creación, edición y activación/desactivación.
 * Implementa actualizaciones optimistas para una sensación de velocidad inmediata.
 */

'use client';

import { useState } from 'react';
import { Button } from '@/app/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/app/components/ui/card';
import { Plus, User, Search, Pencil, X, Check, RefreshCw } from 'lucide-react';
import { createWaiter, toggleWaiterStatus, updateWaiterName } from '@/app/actions/waiters';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { TableSkeleton } from './TableSkeleton';

interface Waiter {
  id: number;
  name: string;
  active: boolean;
}

interface WaitersTableProps {
  /** Lista completa de meseros (activos e inactivos). */
  waiters: Waiter[];
  /** Estado de carga de la lista desde el servidor. */
  loading: boolean;
  /** Función para refrescar los datos desde la fuente de verdad. */
  onRefresh: () => void;
  /** Función para actualizar el estado local de meseros (para actualizaciones optimistas). */
  onUpdate: (waiters: Waiter[]) => void;
}

export function WaitersTable({ waiters, loading, onRefresh, onUpdate }: WaitersTableProps) {
  const [newWaiterName, setNewWaiterName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');

  /**
   * Crea un nuevo mesero y refresca la lista global tras el éxito.
   */
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWaiterName.trim()) return;

    try {
      const result = await createWaiter(newWaiterName);
      if (result.success && result.waiter) {
        toast.success('Mesero agregado correctamente');
        setNewWaiterName('');
        onRefresh();
      } else {
        toast.error(result.error || 'Error al crear mesero');
      }
    } catch {
      toast.error('Error inesperado durante la creación');
    }
  };

  /**
   * Cambia el estado (activo/inactivo) de un mesero de forma optimista.
   */
  const handleToggle = async (id: number, currentStatus: boolean) => {
    try {
      // Cambio optimista: Actualizamos la UI inmediatamente antes de que el servidor responda
      const updatedWaiters = waiters.map((w) =>
        w.id === id ? { ...w, active: !currentStatus } : w
      );
      onUpdate(updatedWaiters);

      const result = await toggleWaiterStatus(id, currentStatus);
      if (!result.success) {
        // Reversión: Si el servidor falla, volvemos al estado anterior
        onUpdate(waiters);
        toast.error(result.error);
      } else {
        toast.success(`Estado actualizado exitosamente`);
      }
    } catch {
      toast.error('Error de conexión con el servidor');
      onUpdate(waiters);
    }
  };

  /** Inicia el modo de edición de nombre para una fila específica. */
  const startEditing = (waiter: Waiter) => {
    setEditingId(waiter.id);
    setEditName(waiter.name);
  };

  /** Cancela la edición y limpia los buffers temporales. */
  const cancelEditing = () => {
    setEditingId(null);
    setEditName('');
  };

  /** Persiste los cambios de nombre en el servidor. */
  const saveEdit = async () => {
    if (!editingId || !editName.trim()) return;

    try {
      const res = await updateWaiterName(editingId, editName);
      if (res.success) {
        // Sincronizar estado local con el nombre editado
        const updated = waiters.map((w) => (w.id === editingId ? { ...w, name: editName } : w));
        onUpdate(updated);

        setEditingId(null);
        setEditName('');
        toast.success('Nombre actualizado correctamente');
      } else {
        toast.error(res.error || 'Error al actualizar');
      }
    } catch {
      toast.error('Error de red al intentar actualizar');
    }
  };

  /** Filtra los meseros visibles según la consulta de búsqueda rápida. */
  const filteredWaiters = waiters.filter((w) =>
    w.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Card className="border-monalisa-gold/20 bg-monalisa-navy/40 backdrop-blur-md">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-xl text-monalisa-gold">Gestión de Meseros</CardTitle>
          <CardDescription className="text-monalisa-silver/70">
            Controla quién aparece en la lista pública del kiosco.
          </CardDescription>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onRefresh()}
          className="text-monalisa-gold hover:text-white"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* BARRA DE BÚSQUEDA Y CREACIÓN RÁPIDA */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-6 bg-white/5 p-4 rounded-xl border border-white/5">
          <div className="relative w-full sm:w-auto flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-monalisa-silver/50" />
            <input
              type="text"
              placeholder="Filtrar por nombre..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-monalisa-navy/50 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-monalisa-silver placeholder:text-monalisa-silver/30 focus:border-monalisa-gold/50 focus:outline-none transition-colors"
            />
          </div>

          <form onSubmit={handleCreate} className="flex gap-2 w-full sm:w-auto">
            <input
              type="text"
              value={newWaiterName}
              onChange={(e) => setNewWaiterName(e.target.value)}
              placeholder="Nombre del nuevo mesero"
              className="flex-1 sm:w-64 bg-monalisa-navy/50 border border-white/10 rounded-lg px-4 py-2 text-sm text-monalisa-silver placeholder:text-monalisa-silver/30 focus:border-monalisa-gold/50 focus:outline-none transition-colors"
            />
            <button
              type="submit"
              disabled={!newWaiterName.trim()}
              className="bg-monalisa-gold hover:bg-white text-monalisa-navy font-bold p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-5 h-5" />
            </button>
          </form>
        </div>

        {/* ESTRUCTURA DE LA TABLA */}
        <div className="bg-white/5 rounded-2xl border border-white/5 overflow-hidden shadow-xl">
          <table className="w-full">
            <thead className="bg-[#0f1e33]/50 border-b border-white/5">
              <tr>
                <th className="text-left py-4 px-6 text-[10px] uppercase tracking-wider text-monalisa-gold font-bold">
                  Visibilidad
                </th>
                <th className="text-left py-4 px-6 text-[10px] uppercase tracking-wider text-monalisa-gold font-bold">
                  Colaborador
                </th>
                <th className="text-right py-4 px-6 text-[10px] uppercase tracking-wider text-monalisa-gold font-bold">
                  Gestión
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-monalisa-silver/5">
              <AnimatePresence>
                {loading && waiters.length === 0 && <TableSkeleton columns={3} rows={5} />}
                {filteredWaiters.map((waiter) => (
                  <motion.tr
                    key={waiter.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="py-4 px-6">
                      {/* Switch de activación de mesero */}
                      <button
                        onClick={() => handleToggle(waiter.id, waiter.active)}
                        className={`w-10 h-5 rounded-full p-1 transition-colors duration-300 relative ${waiter.active ? 'bg-monalisa-gold' : 'bg-white/10'}`}
                      >
                        <div
                          className={`w-3 h-3 rounded-full bg-white shadow-sm transform transition-transform duration-300 ${waiter.active ? 'translate-x-5' : 'translate-x-0'}`}
                        />
                      </button>
                    </td>
                    <td className="py-4 px-6">
                      {editingId === waiter.id ? (
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="bg-monalisa-navy/80 border border-monalisa-gold/50 rounded px-2 py-1 text-white text-sm focus:outline-none w-full max-w-[200px]"
                          autoFocus
                          onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                        />
                      ) : (
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-1.5 rounded-full ${waiter.active ? 'bg-monalisa-gold/10 text-monalisa-gold' : 'bg-white/5 text-monalisa-silver/30'}`}
                          >
                            <User className="w-3.5 h-3.5" />
                          </div>
                          <span
                            className={`text-sm tracking-wide ${waiter.active ? 'text-white' : 'text-monalisa-silver/40 line-through'}`}
                          >
                            {waiter.name}
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right">
                      {editingId === waiter.id ? (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={saveEdit}
                            className="p-1.5 hover:bg-green-500/20 text-green-400 rounded transition-colors"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={cancelEditing}
                            className="p-1.5 hover:bg-red-500/20 text-red-400 rounded transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEditing(waiter)}
                          className="p-1.5 hover:bg-white/10 text-monalisa-silver/30 hover:text-monalisa-gold rounded transition-colors"
                          title="Editar nombre"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
              {!loading && filteredWaiters.length === 0 && (
                <tr>
                  <td
                    colSpan={3}
                    className="p-8 text-center text-monalisa-silver/40 italic text-xs"
                  >
                    Sin meseros que mostrar.
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
