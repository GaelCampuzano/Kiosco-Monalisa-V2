"use client";

import { useState } from "react";
import { useAdminData } from "@/hooks/useAdminData";
import { AdminHeader } from "@/app/admin/components/AdminHeader";
import { AdminStats } from "@/app/admin/components/AdminStats";
import { TipsTable } from "@/app/admin/components/TipsTable";

export default function AdminDashboard() {
  const { tips, loading, stats, fetchTips, exportCSV, dbAuthenticated } = useAdminData();
  const [search, setSearch] = useState("");

  const handleExport = () => {
    // Re-filter for export to ensure we export what is seen (or export all?)
    // This logic mimics the original which exported 'filtered'
    const filtered = tips.filter(t =>
      t.waiterName.toLowerCase().includes(search.toLowerCase()) ||
      t.tableNumber.toLowerCase().includes(search.toLowerCase())
    );
    exportCSV(filtered);
  };

  return (
    <div className="min-h-screen bg-monalisa-navy text-monalisa-silver p-4 sm:p-6 md:p-10 font-sans selection:bg-monalisa-gold selection:text-monalisa-navy">
      {/* Fondo decorativo sutil */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_var(--tw-gradient-stops))] from-[#1f3a5e] via-monalisa-navy to-[#0a1525] -z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-8">

        <AdminHeader
          loading={loading}
          onRefresh={fetchTips}
          onExport={handleExport}
        />

        <AdminStats stats={stats} />

        <TipsTable
          tips={tips}
          search={search}
          setSearch={setSearch}
          loading={loading}
          dbAuthenticated={dbAuthenticated}
        />
      </div>
    </div>
  );
}
