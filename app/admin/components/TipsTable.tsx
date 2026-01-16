import { Search } from 'lucide-react';
import { TipRecord } from '@/types';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { TableSkeleton } from './TableSkeleton';

interface TipsTableProps {
  tips: TipRecord[];
  search: string;
  setSearch: (value: string) => void;
  loading: boolean;

  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function TipsTable({
  tips,
  search,
  setSearch,
  loading,
  page,
  totalPages,
  onPageChange,
}: TipsTableProps) {
  // Filtrado ahora es manejado en el servidor, usamos 'tips' directamente
  const filtered = tips;

  return (
    <div className="bg-monalisa-navy/30 backdrop-blur-md rounded-sm border border-monalisa-gold/10 overflow-hidden shadow-2xl flex flex-col max-h-[600px]">
      <div className="p-4 sm:p-6 border-b border-monalisa-gold/10 bg-monalisa-navy/50 shrink-0">
        <div className="relative">
          <Search className="absolute left-3 sm:left-4 top-3 sm:top-3.5 w-4 h-4 sm:w-5 sm:h-5 text-monalisa-silver/30" />
          <input
            type="text"
            placeholder="Buscar por mesero o mesa..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                // Opcional: Trigger search explicitly if needed, but hook handles it on change or debounce
              }
            }}
            className="w-full bg-monalisa-navy/50 border border-monalisa-gold/20 rounded-sm py-2 sm:py-3 pl-10 sm:pl-12 pr-3 sm:pr-4 text-sm sm:text-base text-white placeholder:text-monalisa-silver/20 focus:border-monalisa-gold outline-none transition-all font-light focus:shadow-[0_0_15px_rgba(223,200,148,0.1)]"
          />
        </div>
      </div>

      <div className="overflow-auto custom-scrollbar flex-1">
        <table className="w-full text-left border-collapse">
          <thead className="bg-[#0f1e33]/90 backdrop-blur-md border-b border-monalisa-gold/10 sticky top-0 z-10 shadow-md">
            <tr>
              <th className="p-5 text-xs font-bold text-monalisa-gold/80 uppercase tracking-widest whitespace-nowrap">
                Fecha
              </th>
              <th className="p-5 text-xs font-bold text-monalisa-gold/80 uppercase tracking-widest whitespace-nowrap">
                Mesa
              </th>
              <th className="p-5 text-xs font-bold text-monalisa-gold/80 uppercase tracking-widest whitespace-nowrap">
                Mesero
              </th>
              <th className="p-5 text-xs font-bold text-monalisa-gold/80 uppercase tracking-widest whitespace-nowrap">
                Propina
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-monalisa-gold/5">
            {loading ? (
              <TableSkeleton columns={4} rows={6} />
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-12 text-center text-monalisa-silver/50 italic">
                  {search
                    ? 'No se encontraron registros que coincidan con la búsqueda.'
                    : 'No se encontraron registros recientes.'}
                </td>
              </tr>
            ) : (
              filtered.map((tip) => (
                <tr
                  key={tip.id}
                  className="hover:bg-white/5 transition-colors group border-l-2 border-transparent hover:border-monalisa-gold"
                >
                  <td className="p-5 text-monalisa-silver font-light whitespace-nowrap">
                    {(() => {
                      try {
                        const date = new Date(tip.createdAt);
                        // Usamos Intl.DateTimeFormat para mayor control y consistencia
                        return new Intl.DateTimeFormat('es-MX', {
                          timeZone: 'America/Mazatlan',
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: true,
                        }).format(date);
                      } catch {
                        return tip.createdAt;
                      }
                    })()}
                  </td>
                  <td className="p-5">
                    <span className="font-serif text-lg text-white group-hover:text-monalisa-gold transition-colors">
                      {tip.tableNumber}
                    </span>
                  </td>
                  <td className="p-5 text-white font-medium tracking-wide">{tip.waiterName}</td>
                  <td className="p-5">
                    <span
                      className={`px-3 py-1 rounded-sm font-bold text-xs tracking-wider border shadow-sm ${
                        tip.tipPercentage === 25
                          ? 'bg-green-900/30 text-green-400 border-green-800/50'
                          : tip.tipPercentage === 23
                            ? 'bg-blue-900/30 text-blue-300 border-blue-800/50'
                            : 'bg-monalisa-gold/10 text-monalisa-gold border-monalisa-gold/30'
                      }`}
                    >
                      {tip.tipPercentage}%
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="p-4 bg-monalisa-gold/5 border-t border-monalisa-gold/10 flex items-center justify-between shrink-0">
        <div className="text-xs text-monalisa-silver/40 uppercase tracking-widest">
          Página {page} de {totalPages || 1}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1 || loading}
            className="p-1 sm:p-2 hover:bg-white/5 rounded-full disabled:opacity-30 disabled:cursor-not-allowed text-monalisa-gold transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages || loading}
            className="p-1 sm:p-2 hover:bg-white/5 rounded-full disabled:opacity-30 disabled:cursor-not-allowed text-monalisa-gold transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
