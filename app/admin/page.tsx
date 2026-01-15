'use client';

import { useState, useEffect } from 'react';
import { useAdminData } from '@/hooks/useAdminData';
import { AdminHeader } from '@/app/admin/components/AdminHeader';
import { AdminStats } from '@/app/admin/components/AdminStats';
import { TipsTable } from '@/app/admin/components/TipsTable';
import { WaitersTable } from '@/app/admin/components/WaitersTable';
import { AdminSettings } from '@/app/admin/components/AdminSettings';

export default function AdminDashboard() {
  const {
    tips,
    loading,
    stats,
    fetchTips,
    exportCSV,
    dbAuthenticated,
    page,
    totalPages,
    setPage,
    setDateRange,
    filters,
    setSearch,
  } = useAdminData();

  const [activeTab, setActiveTab] = useState<'tips' | 'waiters' | 'settings'>('tips');

  // No necesitamos estado local de search si usamos el del hook,
  // pero para evitar re-renders excesivos al escribir, podríamos debcear.
  // Por simplicidad en versión 1, usamos el del hook directo o mantenemos local solo visual.
  // Vamos a usar el del hook para consistencia inmediata con "Enter" o search simple.

  useEffect(() => {
    // Persistir tab en URL o estado simple si se desea, por ahora local
  }, []);

  const handleExport = () => {
    // Exportar lo que hay en 'tips' (que ya es la página actual filtrada)
    // IDEALMENTE: exportCSV debería recibir filtros y bajar TODO del servidor, no solo la página actual.
    // El hook useAdminData ya maneja esto internamente usando los filtros actuales.
    exportCSV();
  };

  return (
    <div className="min-h-screen bg-monalisa-navy text-monalisa-silver p-4 sm:p-6 md:p-10 font-sans selection:bg-monalisa-gold selection:text-monalisa-navy">
      {/* Fondo decorativo sutil */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_var(--tw-gradient-stops))] from-[#1f3a5e] via-monalisa-navy to-[#0a1525] -z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Navegación de Pestañas */}
        <div className="flex space-x-1 border-b border-monalisa-gold/20 pb-1">
          <button
            onClick={() => setActiveTab('tips')}
            className={`px-6 py-2 text-sm font-medium transition-all rounded-t-sm relative ${
              activeTab === 'tips'
                ? 'text-monalisa-gold after:absolute after:bottom-[-5px] after:left-0 after:w-full after:h-[2px] after:bg-monalisa-gold'
                : 'text-monalisa-silver/50 hover:text-monalisa-silver hover:bg-white/5'
            }`}
          >
            Propinas
          </button>
          <button
            onClick={() => setActiveTab('waiters')}
            className={`px-6 py-2 text-sm font-medium transition-all rounded-t-sm relative ${
              activeTab === 'waiters'
                ? 'text-monalisa-gold after:absolute after:bottom-[-5px] after:left-0 after:w-full after:h-[2px] after:bg-monalisa-gold'
                : 'text-monalisa-silver/50 hover:text-monalisa-silver hover:bg-white/5'
            }`}
          >
            Meseros
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-6 py-2 text-sm font-medium transition-all rounded-t-sm relative ${
              activeTab === 'settings'
                ? 'text-monalisa-gold after:absolute after:bottom-[-5px] after:left-0 after:w-full after:h-[2px] after:bg-monalisa-gold'
                : 'text-monalisa-silver/50 hover:text-monalisa-silver hover:bg-white/5'
            }`}
          >
            Configuración
          </button>
        </div>

        {activeTab === 'tips' ? (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <AdminHeader
              loading={loading}
              onRefresh={fetchTips}
              onExport={handleExport}
              filters={filters}
              onDateChange={setDateRange}
            />

            <AdminStats stats={stats} />

            <TipsTable
              tips={tips}
              search={filters.search || ''}
              setSearch={setSearch}
              loading={loading}
              dbAuthenticated={dbAuthenticated}
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        ) : activeTab === 'waiters' ? (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <WaitersTable />
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <AdminSettings />
          </div>
        )}
      </div>
    </div>
  );
}
