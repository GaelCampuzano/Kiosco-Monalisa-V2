'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/app/components/ui/button';
// import { Input } from "@/app/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/app/components/ui/card';
import { Plus, User, Search, Pencil, X, Check, RefreshCw } from 'lucide-react';
import {
  getAllWaiters,
  createWaiter,
  toggleWaiterStatus,
  updateWaiterName,
} from '@/app/actions/waiters';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { TableSkeleton } from './TableSkeleton';

interface Waiter {
  id: number;
  name: string;
  active: boolean;
}

export function WaitersTable() {
  const [waiters, setWaiters] = useState<Waiter[]>([]);
  const [loading, setLoading] = useState(true);
  const [newWaiterName, setNewWaiterName] = useState('');
  // const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');

  const loadWaiters = async () => {
    setLoading(true);
    try {
      // Race between fetch and 10s timeout
      const dataPromise = getAllWaiters();
      const timeoutPromise = new Promise<Waiter[]>((_, reject) =>
        setTimeout(() => reject(new Error('Timeout')), 10000)
      );

      const data = await Promise.race([dataPromise, timeoutPromise]);
      setWaiters(data);
    } catch (error) {
      console.error('Error loading waiters:', error);
      toast.error('Error al cargar meseros (Tiempo de espera agotado)');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWaiters();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWaiterName.trim()) return;

    // Assuming there was an `isCreating` state before, we'll remove it as per the new snippet.
    // If the user wants to keep it, they should specify. For now, following the snippet.
    try {
      const result = await createWaiter(newWaiterName);
      if (result.success && result.waiter) {
        toast.success('Mesero agregado correctamente');
        setNewWaiterName('');
        loadWaiters(); // Recargar lista
      } else {
        toast.error(result.error || 'Error al crear');
      }
    } catch {
      toast.error('Error inesperado');
    }
  };

  const handleToggle = async (id: number, currentStatus: boolean) => {
    try {
      // Optimistic update
      setWaiters((prev) => prev.map((w) => (w.id === id ? { ...w, active: !currentStatus } : w)));

      const result = await toggleWaiterStatus(id, currentStatus);
      if (!result.success) {
        // Revert if failed
        setWaiters((prev) => prev.map((w) => (w.id === id ? { ...w, active: currentStatus } : w)));
        toast.error(result.error);
      } else {
        toast.success(`Estado actualizado`);
      }
    } catch {
      toast.error('Error de conexión');
    }
  };

  const startEditing = (waiter: Waiter) => {
    setEditingId(waiter.id);
    setEditName(waiter.name);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditName('');
  };

  const saveEdit = async () => {
    if (!editingId || !editName.trim()) return;

    try {
      const res = await updateWaiterName(editingId, editName);
      if (res.success) {
        setWaiters(waiters.map((w) => (w.id === editingId ? { ...w, name: editName } : w)));
        setEditingId(null);
        setEditName('');
        toast.success('Nombre actualizado');
      } else {
        toast.error(res.error || 'Error al actualizar');
      }
    } catch {
      toast.error('Error de conexión');
    }
  };

  const filteredWaiters = waiters.filter((w) =>
    w.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Card className="border-monalisa-gold/20 bg-monalisa-navy/40 backdrop-blur-md">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-xl text-monalisa-gold">Gestión de Meseros</CardTitle>
          <CardDescription className="text-monalisa-silver/70">
            Administra quién aparece en la lista de selección del kiosco.
          </CardDescription>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={loadWaiters}
          className="text-monalisa-gold hover:text-white"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* SEARCH & ADD BAR */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-6 bg-white/5 p-4 rounded-xl border border-white/5">
          <div className="relative w-full sm:w-auto flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-monalisa-silver/50" />
            <input
              type="text"
              placeholder="Buscar mesero..."
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
              placeholder="Nuevo mesero..."
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

        {/* TABLE */}
        <div className="bg-white/5 rounded-2xl border border-white/5 overflow-hidden shadow-xl">
          <table className="w-full">
            <thead className="bg-monalisa-navy border-b border-white/5">
              <tr>
                <th className="text-left py-4 px-6 text-xs uppercase tracking-wider text-monalisa-gold font-bold">
                  Estado
                </th>
                <th className="text-left py-4 px-6 text-xs uppercase tracking-wider text-monalisa-gold font-bold">
                  Mesero
                </th>
                <th className="text-right py-4 px-6 text-xs uppercase tracking-wider text-monalisa-gold font-bold">
                  Acciones
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
                      <button
                        onClick={() => handleToggle(waiter.id, waiter.active)}
                        className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ease-in-out relative ${waiter.active ? 'bg-monalisa-gold' : 'bg-white/10'}`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform duration-300 ${waiter.active ? 'translate-x-6' : 'translate-x-0'}`}
                        />
                      </button>
                    </td>
                    <td className="py-4 px-6">
                      {editingId === waiter.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="bg-monalisa-navy/80 border border-monalisa-gold/50 rounded px-2 py-1 text-white text-sm focus:outline-none w-full max-w-[200px]"
                            autoFocus
                          />
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-2 rounded-full ${waiter.active ? 'bg-monalisa-gold/10 text-monalisa-gold' : 'bg-white/5 text-monalisa-silver/40'}`}
                          >
                            <User className="w-4 h-4" />
                          </div>
                          <span
                            className={`font-medium ${waiter.active ? 'text-white' : 'text-monalisa-silver/50 dashed'}`}
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
                            className="p-2 hover:bg-green-500/20 text-green-400 rounded-lg transition-colors"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={cancelEditing}
                            className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEditing(waiter)}
                          className="p-2 hover:bg-white/10 text-monalisa-silver/50 hover:text-monalisa-gold rounded-lg transition-colors"
                          title="Editar nombre"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                      )}
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
