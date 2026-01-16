import { LogOut, RefreshCw, Download } from 'lucide-react';
import { logout } from '@/app/actions/auth';

interface AdminHeaderProps {
  loading: boolean;
  onRefresh: () => void;
  onExport: () => void;
  filters: { startDate?: string; endDate?: string };
  onDateChange: (start?: Date, end?: Date) => void;
}

export function AdminHeader({
  loading,
  onRefresh,
  onExport,
  filters,
  onDateChange,
}: AdminHeaderProps) {
  const handleStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value ? new Date(e.target.value) : undefined;
    // Mantener end date existente
    const end = filters.endDate ? new Date(filters.endDate) : undefined;
    onDateChange(val, end);
  };

  const handleEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value ? new Date(e.target.value) : undefined;
    // Mantener start date existente
    const start = filters.startDate ? new Date(filters.startDate) : undefined;
    onDateChange(start, val);
  };

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 sm:gap-6 pb-4 sm:pb-6 border-b border-monalisa-gold/20">
      <div>
        <button
          onClick={() => logout()}
          className="flex items-center gap-2 text-red-400/70 hover:text-red-400 transition-colors mb-3 sm:mb-4 text-[10px] sm:text-xs font-bold tracking-widest uppercase"
        >
          <LogOut className="w-3 h-3" /> Cerrar Sesión
        </button>
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-monalisa-gold tracking-wide">
          Panel de Control
        </h1>

        {/* Filtros de Fecha */}
        <div className="flex flex-wrap items-center gap-2 mt-4">
          <div className="flex items-center gap-2 bg-monalisa-navy/50 border border-monalisa-gold/20 rounded-sm px-3 py-1.5 p-1">
            <span className="text-xs text-monalisa-silver/50 uppercase tracking-wider">Desde</span>
            <input
              type="date"
              className="bg-transparent text-white text-sm outline-none w-[110px] appearance-none [&::-webkit-calendar-picker-indicator]:invert-[0.6]"
              value={filters.startDate ? filters.startDate.split('T')[0] : ''}
              onChange={handleStartChange}
            />
          </div>
          <div className="flex items-center gap-2 bg-monalisa-navy/50 border border-monalisa-gold/20 rounded-sm px-3 py-1.5 p-1">
            <span className="text-xs text-monalisa-silver/50 uppercase tracking-wider">Hasta</span>
            <input
              type="date"
              className="bg-transparent text-white text-sm outline-none w-[110px] appearance-none [&::-webkit-calendar-picker-indicator]:invert-[0.6]"
              value={filters.endDate ? filters.endDate.split('T')[0] : ''}
              onChange={handleEndChange}
            />
          </div>
        </div>
      </div>

      {/* Botones de Acción */}
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
