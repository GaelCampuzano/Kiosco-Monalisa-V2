"use client";

import { useEffect, useState } from "react";
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { TipRecord } from "@/types";
import { logout } from "@/app/actions/auth"; // Importamos la acción de logout
import { Download, RefreshCw, Search, TrendingUp, Users, Calendar, LogOut } from "lucide-react";

export default function AdminDashboard() {
  const [tips, setTips] = useState<TipRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Estados para métricas
  const [stats, setStats] = useState({
    totalTips: 0,
    avgPercentage: 0,
    topWaiter: "-"
  });

  const fetchTips = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "tips"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TipRecord));
      setTips(data);
      calculateStats(data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data: TipRecord[]) => {
    if (data.length === 0) return;

    const totalPct = data.reduce((acc, curr) => acc + curr.tipPercentage, 0);
    const avg = (totalPct / data.length).toFixed(1);

    const waiterCounts: Record<string, number> = {};
    data.forEach(t => {
      waiterCounts[t.waiterName] = (waiterCounts[t.waiterName] || 0) + 1;
    });
    const topWaiter = Object.entries(waiterCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "-";

    setStats({
      totalTips: data.length,
      avgPercentage: Number(avg),
      topWaiter
    });
  };

  useEffect(() => { fetchTips(); }, []);

  const exportCSV = () => {
    const headers = ["Fecha", "Mesa", "Mesero", "Propina %", "User Agent"];
    const rows = tips.map(t => [
      new Date(t.createdAt).toLocaleString(),
      t.tableNumber,
      t.waiterName,
      `${t.tipPercentage}%`,
      t.userAgent || ""
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = `reporte_monalisa_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const filtered = tips.filter(t => t.waiterName.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen bg-monalisa-navy text-monalisa-silver p-6 md:p-10 font-sans selection:bg-monalisa-gold selection:text-monalisa-navy">
      {/* Fondo decorativo sutil */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_var(--tw-gradient-stops))] from-[#1f3a5e] via-monalisa-navy to-[#0a1525] -z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header con Logout */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-6 border-b border-monalisa-gold/20">
          <div>
            <button 
              onClick={() => logout()} 
              className="flex items-center gap-2 text-red-400/70 hover:text-red-400 transition-colors mb-4 text-xs font-bold tracking-widest uppercase"
            >
              <LogOut className="w-3 h-3" /> Cerrar Sesión
            </button>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-monalisa-gold tracking-wide">
              Panel de Control
            </h1>
            <p className="text-monalisa-silver/60 mt-2 text-lg font-light">Resumen de actividad Sunset Monalisa</p>
          </div>
          
          {/* Botones de Acción */}
          <div className="flex gap-3 w-full md:w-auto">
            <button 
              onClick={fetchTips} 
              className="p-3 bg-monalisa-navy border border-monalisa-gold/30 rounded-sm hover:bg-monalisa-gold/10 hover:border-monalisa-gold transition text-monalisa-gold"
              title="Actualizar datos"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button 
              onClick={exportCSV} 
              className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-monalisa-bronze text-white px-6 py-3 rounded-sm hover:bg-monalisa-gold hover:text-monalisa-navy transition shadow-[0_0_15px_rgba(147,119,55,0.3)] font-bold text-sm tracking-widest uppercase"
            >
              <Download className="w-4 h-4" /> Exportar CSV
            </button>
          </div>
        </div>

        {/* KPIs - Tarjetas Elegantes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-monalisa-navy/50 backdrop-blur-sm p-6 rounded-sm border border-monalisa-gold/20 flex items-center gap-5 shadow-lg hover:border-monalisa-gold/40 transition-colors">
            <div className="p-4 bg-monalisa-gold/10 rounded-full text-monalisa-gold border border-monalisa-gold/20">
              <Calendar className="w-8 h-8" />
            </div>
            <div>
              <p className="text-xs text-monalisa-bronze uppercase tracking-widest font-bold mb-1">Total Registros</p>
              <p className="text-4xl font-serif font-bold text-white">{stats.totalTips}</p>
            </div>
          </div>

          <div className="bg-monalisa-navy/50 backdrop-blur-sm p-6 rounded-sm border border-monalisa-gold/20 flex items-center gap-5 shadow-lg hover:border-monalisa-gold/40 transition-colors">
            <div className="p-4 bg-monalisa-gold/10 rounded-full text-monalisa-gold border border-monalisa-gold/20">
              <TrendingUp className="w-8 h-8" />
            </div>
            <div>
              <p className="text-xs text-monalisa-bronze uppercase tracking-widest font-bold mb-1">Promedio Propina</p>
              <p className="text-4xl font-serif font-bold text-white">{stats.avgPercentage}<span className="text-2xl align-top opacity-50">%</span></p>
            </div>
          </div>

          <div className="bg-monalisa-navy/50 backdrop-blur-sm p-6 rounded-sm border border-monalisa-gold/20 flex items-center gap-5 shadow-lg hover:border-monalisa-gold/40 transition-colors">
            <div className="p-4 bg-monalisa-gold/10 rounded-full text-monalisa-gold border border-monalisa-gold/20">
              <Users className="w-8 h-8" />
            </div>
            <div className="overflow-hidden">
              <p className="text-xs text-monalisa-bronze uppercase tracking-widest font-bold mb-1">Mesero Top</p>
              <p className="text-3xl font-serif font-bold text-white truncate">{stats.topWaiter}</p>
            </div>
          </div>
        </div>

        {/* Tabla y Filtros */}
        <div className="bg-monalisa-navy/30 backdrop-blur-md rounded-sm border border-monalisa-gold/10 overflow-hidden shadow-2xl">
          <div className="p-6 border-b border-monalisa-gold/10 bg-monalisa-navy/50">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-3 text-monalisa-gold/50 w-5 h-5" />
              <input 
                placeholder="Filtrar por mesero..." 
                className="w-full pl-10 pr-4 py-2.5 bg-[#0f1e33] border border-monalisa-gold/20 rounded-sm focus:border-monalisa-gold text-monalisa-silver outline-none transition-all placeholder:text-monalisa-silver/30"
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-monalisa-gold/5 border-b border-monalisa-gold/10">
                <tr>
                  <th className="p-5 text-xs font-bold text-monalisa-bronze uppercase tracking-widest">Fecha</th>
                  <th className="p-5 text-xs font-bold text-monalisa-bronze uppercase tracking-widest">Mesa</th>
                  <th className="p-5 text-xs font-bold text-monalisa-bronze uppercase tracking-widest">Mesero</th>
                  <th className="p-5 text-xs font-bold text-monalisa-bronze uppercase tracking-widest">Propina</th>
                  <th className="p-5 text-xs font-bold text-monalisa-bronze uppercase tracking-widest hidden lg:table-cell">Disp.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-monalisa-gold/5">
                {loading ? (
                  <tr><td colSpan={5} className="p-12 text-center text-monalisa-silver/50 italic">Cargando datos del servidor...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={5} className="p-12 text-center text-monalisa-silver/50 italic">No se encontraron registros recientes.</td></tr>
                ) : (
                  filtered.map((tip) => (
                    <tr key={tip.id} className="hover:bg-monalisa-gold/5 transition-colors group">
                      <td className="p-5 text-monalisa-silver font-light">{new Date(tip.createdAt).toLocaleString()}</td>
                      <td className="p-5">
                        <span className="font-serif text-lg text-white">{tip.tableNumber}</span>
                      </td>
                      <td className="p-5 text-white font-medium tracking-wide">{tip.waiterName}</td>
                      <td className="p-5">
                        <span className={`px-3 py-1 rounded-sm font-bold text-xs tracking-wider border ${
                          tip.tipPercentage === 25 
                            ? 'bg-green-900/30 text-green-400 border-green-800/50' 
                            : tip.tipPercentage === 23 
                              ? 'bg-blue-900/30 text-blue-300 border-blue-800/50'
                              : 'bg-monalisa-gold/10 text-monalisa-gold border-monalisa-gold/30'
                        }`}>
                          {tip.tipPercentage}%
                        </span>
                      </td>
                      <td className="p-5 text-xs text-monalisa-silver/30 max-w-[150px] truncate hidden lg:table-cell group-hover:text-monalisa-silver/60 transition-colors">
                        {tip.userAgent}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          <div className="p-4 bg-monalisa-gold/5 border-t border-monalisa-gold/10 text-center text-xs text-monalisa-silver/40 uppercase tracking-widest">
            Mostrando {filtered.length} registros
          </div>
        </div>
      </div>
    </div>
  );
}