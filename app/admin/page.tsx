'use client';

import { useState, useEffect } from 'react';
import { useAdminData } from '@/hooks/useAdminData';
import { AdminHeader } from '@/app/admin/components/AdminHeader';
import { AdminStats } from '@/app/admin/components/AdminStats';
import { TipsTable } from '@/app/admin/components/TipsTable';
import { WaitersTable } from '@/app/admin/components/WaitersTable';
import { AdminSettings } from '@/app/admin/components/AdminSettings';
import { AIAnalyst } from '@/app/admin/components/AIAnalyst';

export default function AdminDashboard() {
  const {
    tips,
    loading,
    stats,
    fetchTips,
    exportCSV,
    page,
    totalPages,
    setPage,
    setDateRange,
    filters,
    setSearch,
    waiters,
    setWaiters,
    loadingWaiters,
    fetchWaiters,
    percentages,
    setPercentages,
    loadingSettings,
    fetchSettings,
  } = useAdminData();

  const [activeTab, setActiveTab] = useState<'tips' | 'waiters' | 'settings' | 'ia'>('tips');

  useEffect(() => {
    if (activeTab === 'waiters') {
      fetchWaiters();
    } else if (activeTab === 'settings') {
      fetchSettings();
    }
  }, [activeTab, fetchWaiters, fetchSettings]);

  const handleExport = () => {
    exportCSV();
  };

  return (
    <div className="min-h-full text-monalisa-silver p-4 sm:p-6 md:p-10 font-sans selection:bg-monalisa-gold selection:text-monalisa-navy">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Navegación de Pestañas */}
        <div className="flex overflow-x-auto no-scrollbar scroll-smooth space-x-1 sm:space-x-2 bg-white/5 p-1 rounded-xl backdrop-blur-md border border-white/10 w-full sm:w-fit">
          {(
            [
              { id: 'tips', label: 'Propinas' },
              { id: 'waiters', label: 'Meseros' },
              { id: 'ia', label: 'IA Analista' },
              { id: 'settings', label: 'Configuración' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-shrink-0 px-4 sm:px-6 py-2 text-[10px] sm:text-xs font-bold uppercase tracking-widest transition-all rounded-lg relative ${
                activeTab === tab.id
                  ? 'bg-monalisa-gold text-monalisa-navy shadow-lg shadow-monalisa-gold/20'
                  : 'text-monalisa-silver/50 hover:text-monalisa-silver hover:bg-white/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
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
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        ) : activeTab === 'waiters' ? (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <WaitersTable
              waiters={waiters}
              loading={loadingWaiters}
              onRefresh={() => fetchWaiters(true)}
              onUpdate={setWaiters}
            />
          </div>
        ) : activeTab === 'ia' ? (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <AIAnalyst />
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <AdminSettings
              percentages={percentages}
              loading={loadingSettings}
              onRefresh={() => fetchSettings(true)}
              onUpdate={setPercentages}
            />
          </div>
        )}
      </div>
    </div>
  );
}
