/**
 * Componente AdminHeader
 * Encabezado principal del Panel de Administración.
 * Contiene el título, filtros de fecha, botón de cierre de sesión y acciones globales (refrescar/exportar).
 */

'use client';
import { RefreshCw, Download, LogOut } from 'lucide-react';
import { logout } from '@/app/actions/auth';

interface AdminHeaderProps {
  /** Estado de carga global del panel para deshabilitar botones durante peticiones. */
  loading: boolean;
  /** Función para refrescar manualmente los datos de las tablas. */
  onRefresh: () => void;
  /** Función para disparar la exportación de los datos actuales a CSV. */
  onExport: () => void;
  /** Valores actuales de los filtros de fecha. */
  filters: { startDate?: string; endDate?: string };
  /** Función para actualizar el rango de fechas de filtrado. */
  onDateChange: (start?: Date, end?: Date) => void;
}

export function AdminHeader({
  loading,
  onRefresh,
  onExport,
  filters,
  onDateChange,
}: AdminHeaderProps) {
  /** Maneja el cambio en el selector de fecha inicial. */
  const handleStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value ? new Date(e.target.value) : undefined;
    const end = filters.endDate ? new Date(filters.endDate) : undefined;
    onDateChange(val, end);
  };

  /** Maneja el cambio en el selector de fecha final. */
  const handleEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value ? new Date(e.target.value) : undefined;
    const start = filters.startDate ? new Date(filters.startDate) : undefined;
    onDateChange(start, val);
  };

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 sm:gap-6 pb-4 sm:pb-6 border-b border-monalisa-gold/20">
      <div>
        {/* Botón de Logout: Estética discreta pero accesible */}
        <button
          onClick={() => logout()}
          className="flex items-center gap-2 text-red-400/70 hover:text-red-400 transition-colors mb-3 sm:mb-4 text-[10px] sm:text-xs font-bold tracking-widest uppercase"
        >
          <LogOut className="w-3 h-3" /> Cerrar Sesión
        </button>

        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-monalisa-gold tracking-wide">
          Panel de Control
        </h1>

        {/* Sección de Filtros de Fecha: Diseño compacto adaptable a móvil */}
        <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 mt-4 w-full">
          <div className="flex items-center gap-2 bg-monalisa-navy/50 border border-monalisa-gold/20 rounded-sm px-2 sm:px-3 py-1.5 flex-1 min-w-0">
            <span className="text-[10px] sm:text-xs text-monalisa-silver/50 uppercase tracking-wider shrink-0">
              Desde
            </span>
            <input
              type="date"
              className="bg-transparent text-white text-xs sm:text-sm outline-none w-full appearance-none [&::-webkit-calendar-picker-indicator]:invert-[0.6] min-w-0"
              value={filters.startDate ? filters.startDate.split('T')[0] : ''}
              onChange={handleStartChange}
            />
          </div>
          <div className="flex items-center gap-2 bg-monalisa-navy/50 border border-monalisa-gold/20 rounded-sm px-2 sm:px-3 py-1.5 flex-1 min-w-0">
            <span className="text-[10px] sm:text-xs text-monalisa-silver/50 uppercase tracking-wider shrink-0">
              Hasta
            </span>
            <input
              type="date"
              className="bg-transparent text-white text-xs sm:text-sm outline-none w-full appearance-none [&::-webkit-calendar-picker-indicator]:invert-[0.6] min-w-0"
              value={filters.endDate ? filters.endDate.split('T')[0] : ''}
              onChange={handleEndChange}
            />
          </div>
        </div>
      </div>

      {/* Acciones principales del panel */}
      <div className="flex gap-3 w-full md:w-auto">
        <button
          onClick={onRefresh}
          className="p-3 bg-monalisa-navy border border-monalisa-gold/30 rounded-sm hover:bg-monalisa-gold/10 hover:border-monalisa-gold transition text-monalisa-gold"
          title="Actualizar datos"
          disabled={loading}
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
        <button
          onClick={onExport}
          className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-monalisa-bronze text-white px-6 py-3 rounded-sm hover:bg-monalisa-gold hover:text-monalisa-navy transition shadow-[0_0_15px_rgba(147,119,55,0.3)] font-bold text-sm tracking-widest uppercase"
          disabled={loading}
        >
          <Download className="w-4 h-4" /> Exportar CSV
        </button>
      </div>
    </div>
  );
}
