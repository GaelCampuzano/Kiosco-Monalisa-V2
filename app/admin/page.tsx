// gaelcampuzano/kiosco-monalisa-v2/Kiosco-Monalisa-V2-8fe9ff121b13b2ecf67347664cfbdd5ba4f06866/app/admin/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
// REMOVIDO: import { collection, query, orderBy, getDocs } from "firebase/firestore";
// REMOVIDO: import { db, auth } from "@/lib/firebase"; 
import { TipRecord } from "@/types";
import { logout } from "@/app/actions/auth";
import { Download, RefreshCw, Search, TrendingUp, Users, Calendar, LogOut } from "lucide-react";
// REMOVIDO: import { signInWithEmailAndPassword } from "firebase/auth";
// NUEVO: Importar la acción del servidor
import { fetchAllTips } from "@/app/actions/tips"; 

// REMOVIDO: Credenciales públicas de Firebase
// const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
// const ADMIN_PASSWORD_FIREBASE = process.env.NEXT_PUBLIC_ADMIN_PASSWORD_FIREBASE;

export default function AdminDashboard() {
  const [tips, setTips] = useState<TipRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  // [CAMBIO] Se asume que la autenticación de cookie (middleware/proxy) es suficiente.
  const [dbAuthenticated, setDbAuthenticated] = useState(true); 

  // Estados para métricas
  const [stats, setStats] = useState({
    totalTips: 0,
    avgPercentage: 0,
    topWaiter: "-"
  });

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

  // [CAMBIO] Función para cargar datos usando el Server Action (MySQL)
  const fetchTips = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAllTips(); 
      setTips(data);
      calculateStats(data);
    } catch (error) {
      console.error("Error al cargar propinas (MySQL Server Action):", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // [CAMBIO] Ejecuta la carga de datos directamente al montar el componente
  useEffect(() => {
    fetchTips();
  }, [fetchTips]);

  const exportCSV = () => {
    // ... (función original del archivo)
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
              // [CAMBIO] Se asume autenticación y se deshabilita solo por carga
              disabled={loading} 
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button 
              onClick={exportCSV} 
              className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-monalisa-bronze text-white px-6 py-3 rounded-sm hover:bg-monalisa-gold hover:text-monalisa-navy transition shadow-[0_0_15px_rgba(147,119,55,0.3)] font-bold text-sm tracking-widest uppercase"
              disabled={loading}
            >
              <Download className="w-4 h-4" /> Exportar CSV
            </button>
          </div>
        </div>

        {/* KPIs - Tarjetas Elegantes */}
        {/* ... (el resto de las KPIs y el JSX se mantiene igual) */}
        
        {/* Tabla y Filtros */}
        <div className="bg-monalisa-navy/30 backdrop-blur-md rounded-sm border border-monalisa-gold/10 overflow-hidden shadow-2xl">
          <div className="p-6 border-b border-monalisa-gold/10 bg-monalisa-navy/50">
          {/* ... (el input de búsqueda se mantiene igual) */}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-monalisa-gold/5 border-b border-monalisa-gold/10">
              {/* ... (el encabezado de la tabla se mantiene igual) */}
              </thead>
              <tbody className="divide-y divide-monalisa-gold/5">
                {/* [CAMBIO] Muestra el estado de la base de datos */}
                {loading || !dbAuthenticated ? ( 
                  <tr><td colSpan={5} className="p-12 text-center text-monalisa-silver/50 italic">
                    {dbAuthenticated ? "Cargando datos del servidor..." : "Error de conexión/autenticación."}
                  </td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={5} className="p-12 text-center text-monalisa-silver/50 italic">No se encontraron registros recientes.</td></tr>
                ) : (
                  filtered.map((tip) => (
                    // ... (las filas de datos se mantienen igual)
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